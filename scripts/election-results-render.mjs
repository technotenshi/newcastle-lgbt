// Test/preview helper only. Compiles the real SFCs using already-installed Vue dependencies.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse, compileScript, compileStyle } from '@vue/compiler-sfc';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { parseMarkdown } from '@nuxtjs/mdc/runtime';

const root = fileURLToPath(new URL('../', import.meta.url));

async function loadComponent(filename, id) {
  const { descriptor, errors } = parse(await readFile(filename, 'utf8'), { filename });
  if (errors.length) throw errors[0];
  const script = compileScript(descriptor, { id, inlineTemplate: true, genDefaultAs: '__component' });
  const code = script.content.replace(/(from\s+['"])([^'"]+)(['"])/g, (_, before, specifier, after) => {
    let url;
    if (specifier.startsWith('.')) {
      let path = resolve(dirname(filename), specifier);
      if (!existsSync(path) && existsSync(`${path}.js`)) path += '.js';
      else if (existsSync(resolve(path, 'index.js'))) path = resolve(path, 'index.js');
      url = pathToFileURL(path).href;
    } else url = import.meta.resolve(specifier);
    return `${before}${url}${after}`;
  });
  const { default: component } = await import(`data:text/javascript;base64,${Buffer.from(`${code}\nexport default __component;`).toString('base64')}`);
  component.__scopeId = `data-v-${id}`;
  const css = descriptor.styles.map(style => {
    const compiled = compileStyle({ source: style.content, filename, id: `data-v-${id}`, scoped: style.scoped });
    if (compiled.errors.length) throw compiled.errors[0];
    return compiled.code;
  }).join('\n');
  return { component, css };
}

export async function renderElectionMarkdown(markdown) {
  const election = await loadComponent(resolve(root, 'components/content/ElectionResults.vue'), 'election-fixture');
  const renderer = await loadComponent(fileURLToPath(import.meta.resolve('@nuxtjs/mdc/runtime/components/MDCRenderer.vue')), 'mdc-fixture');
  const ast = await parseMarkdown(markdown, { highlight: false });
  const app = createSSRApp({ render: () => h(renderer.component, {
    body: ast.body, data: ast.data, prose: false,
    components: { 'election-results': election.component },
  }) });
  const html = await renderToString(app);
  return { html, css: election.css, ast };
}

// Export a fixture outside the checkout; never add a route or content to the site.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output || !isAbsolute(output) || !resolve(output).startsWith('/tmp/')) {
    throw new Error('Usage: node scripts/election-results-render.mjs <markdown> /tmp/<external-fixture-directory>');
  }
  const { html, css } = await renderElectionMarkdown(await readFile(input, 'utf8'));
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, 'index.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Election results fixture</title><style>body{margin:0;padding:12px;font-family:Arial,sans-serif}.news-article-section p{font-size:1.08rem;line-height:1.9;margin-bottom:1.25rem}.news-article-section h3{font-size:1.2rem;line-height:1.5;margin-top:1.75rem;margin-bottom:.5rem}${css}</style><main class="news-article-section">${html}</main></html>`);
  console.log(`Fixture written to ${output}/index.html`);
}
