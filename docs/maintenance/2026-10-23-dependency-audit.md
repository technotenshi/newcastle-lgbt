# Dependency audit remediation — 2026-10-23

Status: open, tracked in [GitHub issue #436](https://github.com/technotenshi/newcastle-lgbt/issues/436). Priority: urgent for the two critical findings; triage and remediate all remaining reports.

## Evidence and impact

On `deploy/2026-10-23-batch`, dependency commit `49439f0`, this command exits 1:

```sh
docker compose run --rm --no-deps app yarn npm audit --all --recursive --severity moderate
```

The snapshot contains 41 advisory reports and three deprecation reports: two critical, 18 high and 24 moderate. Reports are not necessarily unique vulnerabilities: one advisory can cover multiple package names. The complete inventory below preserves all 44 reports. Existing findings remain actionable regardless of their introduction date.

The critical chain is Nuxt 4.5.2 → @nuxt/devtools 3.4.1 → simple-git 3.36.0 → @simple-git/argv-parser 1.1.1. Exploitation depends on untrusted Git configuration/arguments or editor environment input reaching these tools. This is a build/development risk; the deployed site serves static files. Static hosting does not remove the need to secure development and CI.

## Proposed remediation, in priority order

1. **Critical Git tooling:** prefer upgrading Nuxt/devtools to versions that depend on patched `simple-git` and its parser. The reviewed advisories identify `simple-git` 4.0.1 and `@simple-git/argv-parser` 2.0.1 as patched versions. Both are major upgrades from the installed graph: do not force them across incompatible APIs without checking the parent integration. If the parent cannot yet upgrade, investigate removing the unused devtools dependency through a supported parent configuration/package option. `devtools.enabled: false` is already set and does not remove the vulnerable packages. Until patched or removed, avoid untrusted Git options/editor environments in development and CI; this mitigation does not close the findings.
2. **Framework/toolchain:** prepare a coordinated Nuxt upgrade to at least 4.6.2, superseding the batch's Nuxt 4.5.2 constraint in a separate change. Recheck module compatibility, including sitemap/robots and OG Image, rather than assuming the deferred PRs become compatible automatically. Refresh affected transitive packages through supported parent updates. Candidate lower bounds derived from this audit are devalue >5.9.2, undici >=8.10.2, Vite >8.2.3, and seroval >1.6.2; verify released fixes and parent compatibility before selecting exact versions.
3. **Remaining package groups:** apply the table below, preserving unrelated lockfile pins and supported SQLite/Image constraints. Prefer parent upgrades; use a narrowly scoped resolution only after API compatibility and the actual requested range are verified.
4. **Prevention:** add a recursive audit check to CI. Gate critical/high findings, with an explicit tracked disposition and review date for any exception. Keep deprecations visible as maintenance tasks; do not count them as independently verified security advisories or silently suppress them.

| Package group | Proposed fix |
| --- | --- |
| brace-expansion 5.0.9 | Upgrade the minimatch dependency chain or cover its actual `^5.0.9` request with the existing 5.0.12 override; verify no vulnerable copy remains. |
| compression 1.8.1 | Upgrade serve or use a compatible scoped resolution to compression >=1.8.2; smoke-test the static preview server. |
| http-cache-semantics 4.2.0 | Upgrade make-fetch-happen's chain or resolve compatibly above 4.2.0. |
| ip-address 10.5.0 | Upgrade socks' chain or resolve compatibly above 10.7.3, covering all five reports. |
| node-forge 1.4.0 | Upgrade listhen's chain to a release using a patched node-forge above 1.4.0. |
| postcss-selector-parser 7.1.4 | Upgrade eslint-plugin-vue's chain or resolve compatibly to >=7.1.6; rerun lint. |
| source-map-js 1.2.1 | Upgrade magicast's chain or resolve compatible requests to >=1.2.2; remove every affected copy. |
| zod 3.25.76 | Verify the advisory's applicability and patched support for the v3 entry point with Nuxt Content. Prefer a Content release with a supported fix; do not blindly override v3 consumers to v4. The audit names 4.6.6 as its unaffected boundary. If not applicable, record upstream evidence and an explicit disposition. |
| @ungap/structured-clone 1.3.0 | Update the mdast-util-to-hast chain to >=1.3.1 where compatible; this report is a deprecation warning, not a separately sourced advisory. |
| glob 10.5.0 | Update archiver-utils' chain to a supported glob release; verify API compatibility rather than forcing a major glob resolution. |
| prebuild-install 7.1.3 | Track the better-sqlite3 upstream replacement for its unmaintained installer. Keep SQLite within Content's supported range; update both together if needed. If upstream offers no supported replacement yet, record a time-bounded maintenance exception with a review date and upstream tracking link. |

Version boundaries above are remediation candidates from the snapshot, not proof that every candidate release is available or compatible.

## Acceptance criteria

- [ ] Both critical packages are patched or removed from the resolved graph, verified with `yarn why` and a recursive audit.
- [ ] Every inventory row below has a disposition: fixed, removed, or an evidence-backed exception with an issue, rationale and review date. No blanket exclusion based on a finding's age or static hosting.
- [ ] No untriaged critical/high findings remain; moderate findings and deprecations have explicit remediation or exception records.
- [ ] Docker Yarn 4.18.1 immutable installation, lint, production static build, code review and security scans pass.
- [ ] Serve `.output/public` statically; verify content, sitemap, robots, RSS and rendered/social image resources. Preserve the Nuxt Image static-generation guardrail and Content's supported SQLite range.

## Complete audit inventory

Snapshot from Yarn/npm audit; severity and affected range are registry-reported and still require applicability triage.

| # | Package | Installed | Severity | Report | Affected range | Reported problem |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | @nuxt/nitro-server | 4.5.2 | moderate | [1242828](https://github.com/advisories/GHSA-vjh5-4x84-xrqp) | >=4.2.0 <4.6.2 | Nuxt: Server-side route rules (redirect, headers, proxy, ssr) are skipped for case-variant paths when routing is case-insensitive |
| 2 | @simple-git/argv-parser | 1.1.1 | critical | [1241198](https://github.com/advisories/GHSA-v5rq-49vh-5v5c) | <2.0.1 | simple-git: VISUAL editor environment variable is omitted from unsafe editor detection |
| 3 | @ungap/structured-clone | 1.3.0 | moderate | @ungap/structured-clone (deprecation) | 1.3.0 | Potential CWE-502 - Update to 1.3.1 or higher |
| 4 | brace-expansion | 5.0.9 | moderate | [1240103](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) | >=4.0.0 <5.0.12 | brace-expansion: Quadratic-time expansion of the {a},b} rewrite causes CPU denial of service |
| 5 | brace-expansion | 5.0.9 | high | [1240107](https://github.com/advisories/GHSA-qhr7-859c-m2p7) | >=4.0.0 <5.0.11 | brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion |
| 6 | brace-expansion | 5.0.9 | high | [1240111](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) | >=4.0.0 <5.0.10 | brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion |
| 7 | compression | 1.8.1 | high | [1241221](https://github.com/advisories/GHSA-vc2v-76pw-4v95) | <1.8.2 | compression vulnerable to Denial of Service via memory leak on premature response close |
| 8 | devalue | 5.9.1 | high | [1240870](https://github.com/advisories/GHSA-j22f-vq7h-c4qm) | >=5.1.0 <=5.9.2 | devalue: stringify/uneval serialize shared memory |
| 9 | devalue | 5.9.1 | moderate | [1240871](https://github.com/advisories/GHSA-hx4r-w6wj-j8fg) | <=5.9.2 | devalue: Residual sparse-array CPU amplification in uneval |
| 10 | devalue | 5.9.1 | high | [1240872](https://github.com/advisories/GHSA-mcm9-63f2-9j32) | <=5.9.2 | devalue: Repeated primitive strings cause quadratic expansion in uneval |
| 11 | devalue | 5.9.1 | high | [1240874](https://github.com/advisories/GHSA-x5rw-q4pp-hg5g) | >=5.8.0 <=5.9.2 | devalue: stringifyAsync can cause an unhandled rejection despite a caught returned promise |
| 12 | devalue | 5.9.1 | moderate | [1240875](https://github.com/advisories/GHSA-4q55-j62x-fr9h) | <=5.9.2 | devalue: Malformed null-prototype object keys bypass __proto__ rejection via property-key coercion |
| 13 | devalue | 5.9.1 | high | [1242362](https://github.com/advisories/GHSA-r9w8-h9r3-54w4) | <=5.9.2 | devalue: Custom ArrayBuffer revivers can bypass typed-array allocation validation |
| 14 | glob | 10.5.0 | moderate | glob (deprecation) | 10.5.0 | Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me |
| 15 | http-cache-semantics | 4.2.0 | high | [1240991](https://github.com/advisories/GHSA-ch52-4w7c-c8xp) | <=4.2.0 | http-cache-semantics max-stale handling can disclose cross-user cached responses |
| 16 | ip-address | 10.5.0 | moderate | [1239948](https://github.com/advisories/GHSA-rpw4-54j3-4h4q) | <=10.5.0 | ip-address: Address6.isLinkLocal() recognizes fe80::/64 rather than fe80::/10, allowing SSRF and trust-boundary bypass to on-link hosts |
| 17 | ip-address | 10.5.0 | moderate | [1239949](https://github.com/advisories/GHSA-2vr4-cq9g-pvrc) | >=10.2.0 <=10.5.0 | ip-address: no classifier recognizes the NAT64 local-use range 64:ff9b:1::/48, allowing SSRF and trust-boundary bypass |
| 18 | ip-address | 10.5.0 | moderate | [1240097](https://github.com/advisories/GHSA-j6r3-76f7-8jcv) | <=10.7.0 | ip-address: isInSubnet() and isHostInSubnet() compare addresses of different families as if they shared an address space, allowing an allowlist check to admit an address outside its range |
| 19 | ip-address | 10.5.0 | moderate | [1240098](https://github.com/advisories/GHSA-h3mg-xc3c-68pw) | <=10.7.0 | ip-address: Address6 builds a parse diagnostic proportional to the input with no length bound, allowing a single long string to stall or crash the process |
| 20 | ip-address | 10.5.0 | moderate | [1242883](https://github.com/advisories/GHSA-rxp7-6hxx-x8q5) | <=10.7.3 | ip-address: Address6 matches a zone identifier in quadratic time ahead of its length limit, allowing a single long string to stall the process |
| 21 | node-forge | 1.4.0 | high | [1240912](https://github.com/advisories/GHSA-86w9-cpqp-85rv) | <=1.4.0 | node-forge RSA PKCS#1 v1.5 signature verification accepts extra nested DigestAlgorithm elements |
| 22 | nuxt | 4.5.2 | moderate | [1242830](https://github.com/advisories/GHSA-vjh5-4x84-xrqp) | >=4.0.0 <4.6.2 | Nuxt: Server-side route rules (redirect, headers, proxy, ssr) are skipped for case-variant paths when routing is case-insensitive |
| 23 | nuxt | 4.5.2 | moderate | [1242831](https://github.com/advisories/GHSA-xfq5-w38q-pc2x) | >=3.13.0 <4.6.2 | Nuxt server islands render useHeadSafe input without sanitisation |
| 24 | postcss-selector-parser | 7.1.4 | moderate | [1241232](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) | <7.1.6 | PostCSS: Quadratic complexity in flat selector parsing allows CPU exhaustion |
| 25 | prebuild-install | 7.1.3 | moderate | prebuild-install (deprecation) | 7.1.3 | No longer maintained. Please contact the author of the relevant native addon; alternatives are available. |
| 26 | seroval | 1.6.2 | high | [1241208](https://github.com/advisories/GHSA-jp82-f5mq-hwhp) | <=1.6.2 | Seroval: Memory exhaustion via unchecked TypedArray length in JSON deserialization |
| 27 | simple-git | 3.36.0 | critical | [1241199](https://github.com/advisories/GHSA-x6jw-m9v5-85vh) | >=3.15.0 <4.0.1 | simple-git unsafe-operation guard does not block trailer command configuration |
| 28 | simple-git | 3.36.0 | high | [1241200](https://github.com/advisories/GHSA-g4wm-2vf7-vfgr) | <=3.36.0 | simple-git allows command execution through unblocked Git configuration includes |
| 29 | simple-git | 3.36.0 | high | [1242216](https://github.com/advisories/GHSA-858h-whjf-mvg5) | <=3.36.0 | simple-git: unsafe-operations plugin bypass via git long-option abbreviation (--receive-p/--exe) -> command execution (residual of CVE-2026-28291) |
| 30 | source-map-js | 1.2.1 | high | [1241209](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) | >=1.0.0 <1.2.2 | source-map-js allows event-loop denial of service through indexed source-map section offsets |
| 31 | undici | 8.10.0 | moderate | [1239932](https://github.com/advisories/GHSA-3wwx-pv8p-q78v) | >=8.1.0 <8.10.2 | undici vulnerable to Denial of Service via unhandled error in WebSocket permessage-deflate decompression |
| 32 | undici | 8.10.0 | moderate | [1240035](https://github.com/advisories/GHSA-pmjh-fq2x-6v4x) | >=8.0.0 <8.10.2 | undici vulnerable to Denial of Service via orphaned RetryHandler response body |
| 33 | undici | 8.10.0 | high | [1240040](https://github.com/advisories/GHSA-rfgv-xxqx-mfg5) | >=8.0.0 <8.10.2 | undici vulnerable to Denial of Service via unrequested WebSocket subprotocol |
| 34 | undici | 8.10.0 | moderate | [1240043](https://github.com/advisories/GHSA-3xpg-4rpp-hhhm) | >=8.0.0 <8.10.2 | undici vulnerable to Denial of Service via unbounded decompression of compressed responses |
| 35 | undici | 8.10.0 | moderate | [1240045](https://github.com/advisories/GHSA-2jfj-6hjv-fm6j) | >=8.0.0 <8.10.2 | undici vulnerable to cross-user cookie disclosure via Set-Cookie caching in shared caches |
| 36 | undici | 8.10.0 | high | [1240049](https://github.com/advisories/GHSA-w293-vg96-wgc3) | >=8.0.0 <8.10.2 | undici vulnerable to TLS certificate validation bypass via dropped connect options in BalancedPool |
| 37 | undici | 8.10.0 | high | [1240053](https://github.com/advisories/GHSA-vp8m-p9jh-q5pm) | >=8.10.0 <8.10.2 | undici vulnerable to cross-origin cache poisoning via missing origin isolation in interceptors |
| 38 | undici | 8.10.0 | moderate | [1240054](https://github.com/advisories/GHSA-rx4f-c7p8-82vq) | >=8.0.0 <8.10.2 | undici vulnerable to Denial of Service via WebSocketStream unclean close |
| 39 | vite | 8.2.2 | moderate | [1242625](https://github.com/advisories/GHSA-698v-4r3x-3vcv) | >=8.2.0 <=8.2.3 | launch-editor: escapeCmdArgs() omits % escaping on Windows |
| 40 | vite | 8.2.2 | moderate | [1242654](https://github.com/advisories/GHSA-r825-w8mm-5pxw) | >=8.2.0 <=8.2.3 | launch-editor: Editor CLI flag misinterpretation causing arbitrary command execution for some editors |
| 41 | vite | 8.2.2 | high | [1242661](https://github.com/advisories/GHSA-587h-7wmj-h5pm) | >=8.2.0 <=8.2.3 | launch-editor: fs.existsSync() existence check can be bypassed on Windows |
| 42 | vite | 8.2.2 | moderate | [1242733](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) | >=8.2.0 <=8.2.3 | Vite: Files outside server.fs.allow could be served when project paths match system paths on non-Windows machine |
| 43 | vite | 8.2.2 | moderate | [1242736](https://github.com/advisories/GHSA-vfpm-58rq-9qcg) | >=8.2.0 <=8.2.3 | Vite: First 4 bytes of files outside of server.fs setting is exposed by ?vite-wasm-instance |
| 44 | zod | 3.25.76 | high | [1243066](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) | <4.6.6 | Zod can exhaust memory while validating oversized constrained collections |
