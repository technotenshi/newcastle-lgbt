#!/usr/bin/env node
// Verifies that every local social image referenced by the prerendered HTML
// (og:image, twitter:image and image URLs inside JSON-LD) exists in the static
// output and is served as a real 1200x630 image.
//
// Usage: node scripts/verify-social-images.mjs [outputDir] [siteOrigin]
// Defaults: .output/public, https://newcastle.lgbt
// Exit code 0 = all good, 1 = at least one problem (including finding no
// HTML files or no social image URLs at all).
//
// Keep in sync with other files:
// - EXPECTED_WIDTH/EXPECTED_HEIGHT mirror the s_1200x630 modifier in
//   composables/useSocialImage.ts.
// - The default origin mirrors site.url in nuxt.config.ts.
// This is plain Node on purpose, so CI can run it without the Nuxt toolchain.

import { createServer } from 'node:http';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const outputDir = path.resolve(process.argv[2] ?? '.output/public');
const outputPrefix = path.join(outputDir, path.sep);
const siteOrigin = new URL(process.argv[3] ?? 'https://newcastle.lgbt').origin;
const EXPECTED_WIDTH = 1200;
const EXPECTED_HEIGHT = 630;
const MIME = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};
const FORMAT_BY_EXTENSION = {
  '.webp': 'webp',
  '.png': 'png',
  '.jpg': 'jpeg',
  '.jpeg': 'jpeg',
  '.gif': 'gif',
};
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'' };

async function* walkHtml(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkHtml(full);
    } else if (entry.name.endsWith('.html')) {
      yield full;
    }
  }
}

function decodeEntities(text) {
  return text.replace(/&(?:#x([\da-f]+)|#(\d+)|([a-z]+));/gi, (match, hex, dec, name) => {
    try {
      if (hex) return String.fromCodePoint(parseInt(hex, 16));
      if (dec) return String.fromCodePoint(Number(dec));
    } catch {
      return match;
    }
    return ENTITIES[name.toLowerCase()] ?? match;
  });
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, 'i'));
  const value = match ? (match[1] ?? match[2]) : null;
  return value === null ? null : decodeEntities(value);
}

// Returns the URL path (still percent-encoded as written) for local URLs, or
// null for external ones.
function localPath(url) {
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    return parsed.origin === siteOrigin ? parsed.pathname + parsed.search : null;
  } catch {
    return null;
  }
}

function collectJsonLdImages(node, found) {
  if (typeof node === 'string') {
    const local = localPath(node);
    if (local?.startsWith('/_ipx/')) found.push(node);
  } else if (Array.isArray(node)) {
    for (const item of node) collectJsonLdImages(item, found);
  } else if (node && typeof node === 'object') {
    for (const value of Object.values(node)) collectJsonLdImages(value, found);
  }
}

// Collects social image URLs from meta tags and JSON-LD blocks.
function socialUrls(html) {
  const urls = [];
  const errors = [];
  for (const [tag] of html.matchAll(/<meta\s[^>]*>/gi)) {
    const key = attr(tag, 'property') ?? attr(tag, 'name');
    if (key === 'og:image' || key === 'twitter:image') {
      const content = attr(tag, 'content');
      if (content) urls.push(content);
    }
  }
  const jsonLd = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  for (const [, json] of html.matchAll(jsonLd)) {
    try {
      collectJsonLdImages(JSON.parse(json), urls);
    } catch {
      errors.push('unparseable JSON-LD block');
    }
  }
  return { urls, errors };
}

function safeDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

// Maps a URL path from the HTML to a file inside the output directory. Throws
// if the decoded path would leave it (the output directory itself is not a
// file, so it is rejected too).
function toFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const resolved = path.resolve(outputDir, `.${decoded}`);
  if (!resolved.startsWith(outputPrefix)) {
    throw new Error(`path escapes output directory: ${urlPath}`);
  }
  return resolved;
}

// Identifies the image format from the bytes, independent of the extension.
function sniffFormat(buf) {
  if (buf.length > 8 && buf.toString('latin1', 1, 4) === 'PNG') return 'png';
  if (
    buf.length > 12 &&
    buf.toString('latin1', 0, 4) === 'RIFF' &&
    buf.toString('latin1', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8) return 'jpeg';
  if (buf.length > 6 && buf.toString('latin1', 0, 3) === 'GIF') return 'gif';
  return null;
}

// Reads width and height from PNG or WebP bytes; null for other formats.
function imageSize(buf, format) {
  if (format === 'png' && buf.length > 24) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (format === 'webp' && buf.length > 30) {
    const kind = buf.toString('latin1', 12, 16);
    if (kind === 'VP8X') {
      return {
        width: 1 + buf.readUIntLE(24, 3),
        height: 1 + buf.readUIntLE(27, 3),
      };
    }
    if (kind === 'VP8 ') {
      return {
        width: buf.readUInt16LE(26) & 0x3fff,
        height: buf.readUInt16LE(28) & 0x3fff,
      };
    }
    if (kind === 'VP8L') {
      const bits = buf.readUInt32LE(21);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
    }
  }
  return null;
}

// Static-only server standing in for the production static host (Cloudflare
// Pages): serves exact files, no fallback to index/200.html, and picks the
// content type from the file extension like a static host does.
//
// It serves only files already validated by toFilePath and registered in
// `servable` (decoded URL path -> absolute file). The request URL is only a
// lookup key; no file path is ever built from request data.
const servable = new Map();

function startStaticServer() {
  const server = createServer(async (req, res) => {
    try {
      const file = servable.get(safeDecode((req.url ?? '/').split('?')[0]));
      if (!file) throw new Error('not served');
      const info = await stat(file);
      if (!info.isFile()) throw new Error('not a file');
      const body = await readFile(file);
      res.writeHead(200, {
        'content-type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
        'content-length': body.length,
      });
      res.end(body);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const referencedBy = new Map();
const problems = [];
let pages = 0;
for await (const file of walkHtml(outputDir)) {
  pages += 1;
  const relative = path.relative(outputDir, file);
  const { urls, errors } = socialUrls(await readFile(file, 'utf8'));
  for (const error of errors) problems.push(`BAD JSON-LD   ${error} in ${relative}`);
  for (const url of urls) {
    const local = localPath(url);
    if (!local) continue;
    if (!referencedBy.has(local)) referencedBy.set(local, new Set());
    referencedBy.get(local).add(relative);
  }
}

if (pages === 0) problems.push(`NO HTML FILES found in ${outputDir}`);
if (pages > 0 && referencedBy.size === 0) {
  problems.push(`NO SOCIAL IMAGE URLS found in ${pages} HTML files (origin ${siteOrigin})`);
}

const server = await startStaticServer();
const { port } = server.address();
let extensionMismatches = 0;

for (const [urlPath, files] of referencedBy) {
  const label = `${safeDecode(urlPath)} (first seen in ${[...files][0]}, ${files.size} page(s))`;
  let bytes;
  try {
    const file = toFilePath(urlPath);
    bytes = await readFile(file);
    servable.set(safeDecode(urlPath.split('?')[0]), file);
  } catch (error) {
    const detail = error.code ? '' : `: ${error.message}`;
    problems.push(`MISSING FILE  ${label}${detail}`);
    continue;
  }
  if (bytes.length === 0) {
    problems.push(`EMPTY FILE    ${label}`);
    continue;
  }
  const response = await fetch(`http://127.0.0.1:${port}${urlPath}`);
  const type = response.headers.get('content-type') ?? '';
  const body = Buffer.from(await response.arrayBuffer());
  if (response.status !== 200) {
    problems.push(`HTTP ${response.status}      ${label}`);
    continue;
  }
  if (!type.startsWith('image/')) {
    problems.push(`NOT AN IMAGE  ${label}: content-type ${type}`);
    continue;
  }
  if (body.length === 0) {
    problems.push(`EMPTY BODY    ${label}`);
    continue;
  }
  const format = sniffFormat(body);
  if (!format) {
    problems.push(`NOT AN IMAGE  ${label}: bytes are not PNG, WebP, JPEG or GIF`);
    continue;
  }
  const expectedFormat = FORMAT_BY_EXTENSION[path.extname(urlPath).toLowerCase()];
  if (expectedFormat && expectedFormat !== format) extensionMismatches += 1;
  const size = imageSize(body, format);
  if (!size || size.width !== EXPECTED_WIDTH || size.height !== EXPECTED_HEIGHT) {
    const got = size ? `${size.width}x${size.height}` : `unreadable ${format} (only PNG and WebP sizes are read)`;
    problems.push(`BAD SIZE      ${label}: ${got}, expected ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}`);
  }
}
server.close();

console.log(`Scanned ${pages} HTML files, ${referencedBy.size} distinct local social image URLs.`);
if (extensionMismatches > 0) {
  console.log(
    `Note: ${extensionMismatches} URL(s) end in an extension that differs from the image bytes ` +
      '(IPX keeps the source extension and converts to WebP). Static hosts send the ' +
      'extension\'s content type, and scrapers generally sniff the bytes.',
  );
}
if (problems.length > 0) {
  console.error(`FAIL: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log('OK: all local social images exist and are served as 1200x630 images.');
