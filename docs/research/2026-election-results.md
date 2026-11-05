# November 2026 election results reporting

Current article cutoff: November 4, 2026, 6:05 p.m. PST. The evening refresh below supersedes the afternoon article figures. Earlier sections retain the unpublished afternoon evidence record and deferred research scope. This is not a continuously maintained dashboard.

## November 5 editorial corrections, with the published counts preserved

The owner requested implementation of the article review on a feature branch, followed by parent-agent review and validation. This is an editorial correction to the published November 4 snapshot, not a count refresh. The article now carries a dated reader-facing note identifying these changes. Both numerical CSVs, chart votes/seats, count-snapshot timestamps, frontmatter and images remain unchanged.

- **AP screenshot provenance:** the owner identified the source as The Seattle Times' results page: https://www.seattletimes.com/seattle-news/politics/washington-state-election-results-2026/#Key-results&651_filter=0 . Footnote 1 now identifies AP results displayed by that publication and links the page. The review's attempts to retrieve it were blocked; the screenshot's historical contents were not independently reverified. The original screenshot remains owner-supplied evidence.
- **Timezone correction:** the owner assumes the displayed 6:14 p.m. call and 6:21 p.m. update used PST, but has not confirmed it. The article preserves those displayed times with an explicit timezone qualification and removes the previously encoded `2026-11-04T18:14:00-08:00`. It does not substitute a fabricated observation time. This supersedes the original chart's assumption, not the independently recorded Pacific count snapshots.
- **Chart behavior:** a sourced `called` status can omit `at` and `observedAt` when neither is reliable. Attribution stays visible even without a status slot; certification still requires an actual timezone-qualified timestamp. Focused formatter/render regressions cover this distinction.
- **I-645 legal precision:** directly cite the Attorney General's July 23 explanation, https://www.sos.wa.gov/sites/default/files/2026-07/ExStmt_IP26-645.pdf . The review downloaded and read pages 1–2; they establish the 2028 start and the shared $1 million deduction for spouses/registered domestic partners. Enacted ESSB 6346 sections 201 and 314 independently confirm both: https://lawfilesext.leg.wa.gov/biennium/2025-26/Htm/Bills/Session%20Laws/Senate/6346-S.SL.htm . The individual-income ballot shorthand was not fabricated; the correction supplies omitted qualifications.
- **Scott source metadata:** the source's indexed article text identifies Molly Sprayregen and November 4, 2026, 11:08 a.m. EST. The entry now uses that author/date rather than “LGBTQ Nation, n.d.” The direct page remains bot-blocked: https://www.lgbtqnation.com/2026/11/jaelynn-scott-will-be-nations-first-out-black-trans-state-lawmaker-after-winning-washington-race/ .
- **Sponsorship context:** add Let's Go Washington and founder Brian Heywood, drawing on the standing dossier and re-fetched sources: the committee's FAQ, https://letsgowashington.com/faq/ , promotes all three measures; Jake Goldstein-Street's May 8 Standard report identifies the conservative committee and its founder, https://washingtonstatestandard.com/2026/05/08/lets-go-washington-will-go-for-income-tax-repeal-on-this-years-ballot/ . No old fundraising figures or unresolved allegations were imported.
- **Prose and citations:** shorten repeated call/certification explanations while retaining individual chart statuses and the article's advocacy. Add three sources and renumber all footnotes by first appearance. No new election outcome, vote estimate, turnout analysis, or litigation claim is introduced. The legal-help section's absence-of-verified-guidance statement is explicitly tied to the November 4 reporting.

The parent workflow owns Docker tests, lint, static build, social-image verification and independent review. These implementation notes do not claim those checks have passed. No staging, commit, push or publication is part of this implementation.

### November 5 parent review and validation

Independent parent review and separate standards/spec reviews found no remaining actionable issue in the correction diff. The parent fixed two Vue template formatting warnings before final checks. Re-fetched primary law sections 201 and 314 confirm the tax clarification; the committee FAQ and Standard report support the added sponsorship context. The AP source's historical screenshot and timezone remain qualified, not independently reverified.

Validated in an isolated source copy using the project's Docker image and existing dependencies:

- ESLint passed with no errors or warnings.
- Both election formatter/render test files passed: 20 tests, zero failures.
- Static build passed, prerendering 899 routes with zero prerender errors. The build emitted plugin-timing warnings and a duplicate `provider` key warning in generated NuxtImg code; these did not prevent generation.
- Social-image verification scanned 59 HTML files and 52 distinct local social-image URLs; all images exist at 1200×630. The verifier notes the existing IPX extension/encoded-format distinction.
- Direct comparison to `a5b9e68` confirms all 57 authored result rows, 22 count-snapshot inputs and frontmatter are unchanged. Only the I-638 call's provenance and unsupported absolute time changed within chart metadata. All 39 footnotes are ordered and complete.
- The generated article, payload, scripts, stylesheet and header image returned HTTP 200 from a temporary loopback static server. The installed minimal Chromium headless browser captured the page; its DOM retains all 22 charts, the correction note, qualified call times, tax clarification and sponsorship context, without a fabricated AP call-time element. Full Chromium's initial capture stalled, so it was replaced by the bounded minimal-browser capture.

Validation logs and screenshot are in `/tmp/a5b9e68-*`; generated output is in `/tmp/a5b9e68-validation/.output/public`. These are temporary local artifacts. No result refresh, staging, commit, push, merge or deployment was performed.

## I-638 AP call supplied by the owner, November 4

AP results screenshot supplied by the owner: Yes wins, call at 6:14 p.m. November 4,
display updated at 6:21 p.m. Yes 1,252,863 (56.6%); No 961,810 (43.4%); estimated
66% counted. These counts match the preserved official evening snapshot. The call is
reported from the supplied screenshot, not an independently fetched AP page. At initial
publication no original page URL had been supplied, and no explicit timezone appeared in
the screenshot. The November 5 correction above records the subsequently supplied URL;
the timezone remains unconfirmed. The article
now distinguishes projected passage from certification and effectiveness, with a separately
timestamped update. Other races, vote totals and the CSV are unchanged.

## November 4 evening publication refresh

The owner requested current numbers for an evening publication snapshot, then selected file refresh only instead of Docker publication checks. The article's `draft: true` flag is removed for publication preparation. No build, dependency installation, commit, push or deployment is authorized by this refresh.

Official source: https://results.votewa.gov/cdn/results/washington/export-20261103.json . The ordinary URL initially returned `createdAt` 2026-11-04T23:34:28.0810725Z, older than the live page. A cache-busting query returned the export generated at `2026-11-05T01:52:13.8292467Z`, November 4 at 5:52:13 p.m. PST. Its three statewide initiative counts match the rendered dashboard. Retrieval time is not count time.

The browser timezone was America/Los_Angeles. Rendered dashboard publication times were November 4 at 5:52:06 p.m. for Washington, 4:34:31 p.m. for King County, and 5:01:07 p.m. for Pierce County. Both counties list November 5 at 4 p.m. as the next expected update. Results remain unofficial.

Preserved numerical evidence: `2026-election-results-snapshot-evening.csv`, with source URL and export generation time on every row. Code matched all 146 prior-snapshot contests by jurisdiction and exact contest name, retaining 412 options including write-ins. The original `2026-election-results-snapshot.csv` is unchanged. Percentages and margins were recalculated from all valid contest-option votes.

| Measure | Yes | No | Lead |
|---|---|---|---|
| IL26-638 | 1,252,863 (56.57%) | 961,810 (43.43%) | Yes by 291,053 |
| IL26-001 | 1,027,479 (47.38%) | 1,141,234 (52.62%) | No by 113,755 |
| IP26-645 | 936,309 (42.07%) | 1,289,553 (57.93%) | No by 353,244 |

Scott has 32,069 votes (87.32%), McCorkle 4,344 (11.83%), and write-ins 311. King County's rendered count corroborates these figures and its I-638 county totals: No 336,255 (57.25%), Yes 251,111 (42.75%). The refreshed export still gives 68 D / 30 R House leaders, 18 D / six R leaders in the 24 Senate contests, and eight D / two R U.S. House leaders. The Bellevue Chamber's whole-Senate 31 D / 18 R scenario remains explicitly attributed and conditional, not a new inventory of called seats.

AP's rendered office pages were checked between 6:01 and 6:04 p.m. Pacific. House: 239 D, 147 R, 49 uncalled, summing to 435. Senate: 54 Democratic aligned, 44 R, two uncalled, including continuing seats. Governors: 28 D, 20 R, two uncalled, including continuing officeholders. The House and governor pages displayed an update at 6:01 p.m.; the Senate top summary displayed 6:01 p.m. while its map displayed 5:50 p.m. Do not assign one widget's timestamp to all underlying calls. AP's map marks eight Washington Democratic wins, including WA-9, and Republican leads without calls in WA-4 and WA-5. Alaska and Mississippi Senate, and Alaska and Kansas governor, remain uncalled on the respective maps.

Re-fetched LGBTQ Nation's Scott report, AP's congressional-control and outstanding-races reports, the Bellevue Chamber scenario, CNN and AP/NBC historical milestones, NCSL's governor context, and King County's schedule. Their relevant outcome descriptions remain consistent with the article. The standing legal-text and historical source verification below remains from the afternoon research; this refresh is not a new full audit of every unchanged citation. No turnout, county association or demographic analysis was added. Prior articles and `.codex/` remain untouched.

Source/content verification: the mechanical article checker passed with 31 footnote references and 31 definitions, first-use ordering was checked, and `git diff --check` passed. Publication render, lint, static build and social-image verification remain pending because the owner selected file refresh only. A prior passing build excluded this previously hidden article and does not verify the evening publication page.

## I-638 organizational response and next steps, November 4 evening

The owner approved a fuller standalone section after the initiative explanations. Lead with harm to students and belonging, briefly describe the substantial Yes lead and market direction qualitatively, distinguish pre-election opposition from actual election-night response, explain conditional implementation and legal uncertainty, and end with existing assistance routes. No new vote-count refresh, numerical reversal forecast, Docker checks, commit, push or publication was requested. Supplemental context was checked through 6:22 p.m. Pacific, separately from the article's 6:05 p.m. numerical snapshot.

### Verified sources used in the new section

- Public: https://public.com/prediction-markets/which-ballot-measures-will-pass-in-washington-li6innl . Retrieved display: I-638 Yes 93%, No 7%; the Yes contract table displayed 97 cents rather than the headline's 93 cents. The page describes market-implied probabilities from recent trading and warns that data may be delayed or incorrect. Do not conflate an offered contract price, a displayed probability, and an election call. No numerical probability is printed in the article.
- Nijinn: https://midterms.nijinn.io/ballot-measures/washington-initiative-il26-638-transgender-school-sports-access/ . Displayed update November 4 at 9:06 p.m. Eastern, 6:06 p.m. Pacific: TruthIndex 95.0% Yes, Polymarket 96.4%, Kalshi 95.0%. Polymarket depth within five points was only $7; Kalshi $4.3K. The qualitative article mention does not endorse calibration of these prices or treat this tracker as independent evidence of voter choices.
- ACLU of Washington, LaVendrick Smith, October 2: https://www.aclu-wa.org/news/banning-trans-girls-from-school-sports-is-discrimination/ . Verified belonging quotation and author's communications role. This is pre-election opposition, not a post-election ACLU response. Its annual-verification and Supreme Court characterizations are not imported into the article; the initiative text does not specify an annual interval.
- No Hate in WA State, Sloane Shearer, November 3: https://nohateinwastate.org/internal-news/election-results . Explicitly responds to the first reported counts. Verified Watson's hope for subsequent I-638 rejection and Suluai's role and exact support quotation. The release is not a concession, a call, a lawsuit announcement or a separate UTOPIA release. Do not import its I-001 outcome assertion as an independently verified result or repeat its broad examination language without the primary-text qualification.
- Washington Office of Financial Management: https://www.sos.wa.gov/sites/default/files/2026-07/Initiative%20Measure%20NoIL26-638_FIS_FINAL.pdf . Official analysis says effective December 3, 2026, prospective application, OSPI guidance updates and local policy revisions. No publication day is stated in the extracted PDF, so the article uses n.d. The document's inconsistent fiscal-year expenditure detail is omitted. It is not implementation instructions already issued.
- Washington State LGBTQ Commission: https://lgbtq.wa.gov/sports . Verified links to school civil-rights coordinators, OSPI discrimination complaints and the Education Ombuds. Existing assistance routes, not a new I-638-specific remedy or assurance of continued eligibility.

Research found no verified announced I-638 lawsuit, injunction or post-election WIAA/OSPI implementation instructions in the materials reviewed. This is a bounded verification statement, not proof none exists. The coalition's February legal briefing characterizes a possible state constitutional challenge, not a filed case: https://nohateinwastate.org/internal-news/legal-medical-experts-provide-factual-information-onnbspheywood-initiatives-il26-001-il26-638 . Do not promise a judicial delay or rescue.

The researcher corroborated the December 3 date with Washington Constitution Article II, section 1(d), the thirtieth day after approval at the election: https://leg.wa.gov/media/wydnzzoe/waconstitution.pdf . The article directly cites the initiative-specific official fiscal analysis and retains the existing certification calendar; effectiveness and certification remain distinct concepts.

### Supplied material not used as a fresh forecast

The supplied On Point Politics page, https://www.onpointpolitics.us/forecast/measures/wa/initiative-measure-no-il26-638 , was read. It is dated November 3 and projects Yes 53.4%, with a 68.4% chance of passage, using one listed poll and model assumptions. It is not updated to the November 4 count, so it is not used as a current probability in the article. The owner's pasted earlier-count scenario table is also not used: its Yes/No figures differ from the preserved evening snapshot, and no reliable statewide outstanding-vote estimate was established. No fresh reversal probability was calculated or inferred.

Six sources were added and all 37 footnote definitions renumbered by first appearance. The section's factual claims and quotations were checked against fetched first-party pages, including an independent parent check of the coalition release, ACLU commentary, fiscal analysis and Commission resources. No older article, image, numerical CSV, package manifest or lockfile changed for this addition. Rendered verification remains outstanding under the owner's file-only scope.

## Approved scope and publication workflow

The owner approved a Washington and Newcastle first follow-up linking these existing articles:

- Newcastle Voter's Guide: Progressive and LGBTQ+ Friendly Candidates for the November 3 Election: `/news/2026/10/28/newcastle-voters-guide`.
- Jaelynn Scott Is Poised to Become Washington's First Openly Trans Legislator: `/news/2026/10/28/jaelynn-scott-first-openly-trans-legislator`.
- Reign Fans Answer Sheriff's Anti-Trans Protest With Trans Pride Flags: `/news/2026/11/02/sheriff-anti-trans-protest-reign-match`.

Include local ballot races, all three statewide measures, state legislative balance, Scott, Pierce Amendments 53/54, national congressional control, governor totals and selected broader representation milestones. Accuracy and explicit status labels coexist with the site's LGBTQ+ advocacy.

Keep `draft: true`. Refresh numbers before publication only when requested. Any requested post-publication revision must note changes since the previous published snapshot. There is no previous published results edition to compare. Do not change older articles without separate approval. Existing MDC prose overrides are Dateline and ProseA only; use compact tables rather than introduce a chart subsystem for this story.

## Turnout follow-up: November 4 afternoon verification

This follow-up is separate from the article's 1:28 p.m. PST reporting cutoff above. It does not refresh the article or the companion results CSV.

### Owner-approved scope

The owner requested an investigation of turnout's relationship to results, then approved these boundaries in the interview:

- Focus on the three statewide initiatives, not legislative races.
- Scope revised by the owner on November 4, 2026: conduct preliminary county-level turnout and initiative-result analysis before certification. This replaces the earlier decision to wait for certified data. Label the analysis unofficial and timestamp its inputs; do not present reported turnout as final participation.
- Use registered voters as the turnout denominator. Compare matching geographic units and describe associations, not causes or individual voter motivations.
- Verify the figures and propose wording first. Article edits have not been approved or applied.

### Verified preliminary statewide figures

Source: Washington Office of the Secretary of State, official 2026 general election dashboard, Voter Turnout view:

https://results.votewa.gov/results/public/washington/elections/20261103/voters

Read directly from the rendered browser accessibility tree on November 4, 2026:

| Dashboard label | Reported value |
|---|---|
| Registered Voters | 5,170,951 |
| Ballots Cast | 2,026,373 |
| Voter Turnout | 39.19% |
| Last Updated | Wednesday, November 4, 2026 at 3:34:48 PM |
| Results status | UNOFFICIAL RESULTS |

Arithmetic independently checked: 2,026,373 / 5,170,951 × 100 rounds to 39.19%.

The browser timezone was verified as `America/Los_Angeles`. The displayed timestamp itself contains no explicit timezone label. Preserve that distinction when citing the timestamp. The earlier extraction showed 6:34:48 p.m.; the browser displayed 3:34:48 p.m., consistent with the rendering pitfall documented below. Do not treat these as two different updates.

These are the dashboard's reported figures, not final turnout. Preserve its label `Ballots Cast`; do not silently recast the figure as all ballots returned, accepted, or eventually counted. Contest vote totals are not a substitute for total ballots. The denominator is registered voters, not all voting-age or voting-eligible residents.

### Proposed article wording, not yet applied

“Washington's unofficial turnout dashboard reports 2,026,373 ballots cast among 5,170,951 registered voters, or 39.19%, in its November 4 afternoon update. This is an incomplete reporting snapshot, not final turnout. These incomplete statewide totals alone do not establish whether turnout helped produce the initiative leads. Any county-level comparison at this stage is preliminary and must account for differences in reporting progress.”

If approved for the article, give this a separately labeled reporting timestamp because it is newer than the existing article cutoff. Cite the official turnout view using the article's footnote conventions. Do not silently update the initiative totals or other races alongside this addition.

### Remaining work and limitations

No county-level association has been calculated or verified. Different county counting speeds can make incomplete reported turnout look like differences in final participation. Even a verified county-level association would not establish causation, how LGBTQ+ voters voted, or what nonvoters preferred.

Proceed before certification: obtain official preliminary turnout and initiative results for matching counties and the same election. Record source timestamps and reporting definitions, distinguish ballots returned from ballots cast, and assess differences in counting progress before interpreting geographic associations. Certification is not a prerequisite under the revised scope. No monitoring job or reminder has been scheduled. Article edits and a further commit still require separate approval.

Additional official source locations identified during the read-only research:

- Ballot-return reports: https://www.sos.wa.gov/elections/data-research/election-data-and-maps/ballot-return-statistics . These concern returns and must not be conflated with the results dashboard's ballots-cast figure.
- Historical turnout: https://www.sos.wa.gov/elections/data-research/election-data-and-maps/reports-data-and-statistics/voter-turnout-election . At the initial check, its newest entry was August 4, 2026; it did not yet supply November 2026 turnout.
- Participation denominators: https://www.sos.wa.gov/elections/data-research/reports-data-and-statistics/voter-participation-statistics . Registered-voter turnout and voting-age-population participation are different measures; voting-age population is not synonymous with voting-eligible population.

The initial text extraction did not expose the current turnout figures. Opening the dashboard's Voter Turnout control in the browser did expose them. For a future refresh, read the rendered turnout view rather than assuming the figures are unavailable.

## Demographic data feasibility: November 4 follow-up

The owner asked whether demographics can be obtained. The source check supports county population context, not a demographic breakdown of initiative vote choices. Inclusion and selection of demographic variables remain to be approved. No demographic analysis or county dataset has yet been produced.

### Sources and verified availability

Use 2020–2024 ACS five-year estimates consistently across Washington counties if this approach is approved. These describe residents over a five-year period, not the November 2026 electorate. Preserve each variable's population universe, estimate year and margin of error.

- Census DP05: age, median age, sex, race and Hispanic/Latino ethnicity. https://api.census.gov/data/2024/acs/acs5/profile/groups/DP05.html . Hispanic ethnicity overlaps race; do not add overlapping categories as if mutually exclusive.
- Census DP03: household income, including median household income in 2024 inflation-adjusted dollars. https://api.census.gov/data/2024/acs/acs5/profile/groups/DP03.html .
- Census DP02: educational attainment, including bachelor's degree or higher among residents age 25+. https://api.census.gov/data/2024/acs/acs5/profile/groups/DP02.html .
- ACS five-year documentation: https://www.census.gov/data/developers/data-sets/acs-5year/2024.html . Table metadata was accessible; actual county data retrieval remains outstanding. The delegated check encountered API queries requesting a key, not proof that every Census retrieval route requires one.
- Newer ACS one-year estimates have population thresholds and do not provide equivalent coverage of every Washington county. Do not mix one-year and five-year estimates county by county. Release information: https://www.census.gov/programs-surveys/acs/news/updates/2026.html and https://www.census.gov/programs-surveys/acs/news/data-releases/2025/release-schedule.html .

The delegated researcher downloaded and inspected the official participation workbook: https://www.sos.wa.gov/sites/default/files/2022-05/VoterParticipation.xlsx . It contains county/election age groups 18–24, 25–34, 35–44, 45–54, 55–64 and 65+, plus female/male/unknown administrative participation fields. Its 2026 General rows had blank voter/ballot counts at the check; they are placeholders, not usable November turnout figures. Its README warns that registration totals are estimates for the election period. Recheck the workbook before assuming those blanks persist.

Current return dashboard sources:

- State: https://www.sos.wa.gov/elections/data-research/election-data-and-maps/ballot-return-statistics .
- King County: https://kingcounty.gov/en/dept/elections/results/ballot-return-statistics/2026/november-general .

Current age-specific return categories were not verified because embedded dashboard content did not render in the source check. Do not report age-specific November turnout as established. A ballot-return rate by age needs the corresponding registered-voter age denominator, not that age group's share of county residents.

The registered-voter demographics directory is https://www.sos.wa.gov/elections/data-research/election-data-and-maps/reports-data-and-statistics/voter-demographics . Registered-voter composition is not actual-voter composition. An advertised August workbook returned district/precinct mapping columns in the delegated check, so its demographic contents were not verified.

Ballot-status reports are another possible participation source: https://www.sos.wa.gov/elections/data-research/election-data-and-maps/ballot-status-reports . File schema and compatible registration identifiers were not verified because a security gate prevented access. No individual-level voter data were collected or joined.

### Interpretation boundaries and next decision

No official November 2026 initiative-choice cross-tab by age, race, income, education, gender identity or sexual orientation was verified. Clark County explains voter identity is separated from ballot choices: https://clark.wa.gov/elections/frequently-asked-questions-0 .

Administrative female/male/unknown labels do not establish transgender or nonbinary turnout. ACS sex and same-sex-couple household categories are not comprehensive LGBTQ+ population or voter counts. No verified official sexual-orientation turnout breakdown was found.

A defensible county comparison would say that counties with a larger share of a demographic population showed a particular pattern. It cannot conclude that members of that group voted that way. Counting progress, population-versus-electorate differences, small-county uncertainty and correlated demographic variables must be addressed. Demographic variables should be selected before looking for favorable correlations; unexpected or null findings must not be omitted.

Owner decision on November 4: focus on actual-voter data instead of county population demographics. Census resident profiles are not approved for the current analysis. Next, verify whether current official aggregate participation or ballot-return reports provide demographic breakdowns, starting with age and checking the corresponding registered-voter denominators. Distinguish received, accepted and tabulated ballots. If current breakdowns remain unavailable, report that limitation rather than substituting population demographics or historical turnout. No individual-level voter-file collection or linkage has been approved. No demographic article wording has been approved.

### Actual-voter dashboard follow-up result

The subsequent rendered-dashboard investigation retrieved current King County age-specific return percentages, plus administrative language and gender chart values. Evidence, exact labels, update time, county totals and limitations are saved in [2026-election-turnout-demographics.md](2026-election-turnout-demographics.md). This supersedes the earlier inability to verify the current King County age chart, not the statewide limitation. Age-specific ballot counts and matching registration counts remain unretrieved. No statewide age figures or demographic initiative-vote choices have been verified. The county data are ballot returns, not necessarily accepted or counted ballots. No article edits have been applied.

## Primary numerical evidence and coverage checks

Official public media export, discovered through the dashboard's Media Export link:

https://results.votewa.gov/cdn/results/washington/export-20261103.json

Export `createdAt`: `2026-11-04T18:40:04.3483477Z`, which is November 4 at 10:40:04 a.m. PST. Export generation is not the time every county counted its latest ballots.

The companion `2026-election-results-snapshot.csv` preserves 146 contests and 412 options from that one export: 98 state House, 24 state Senate, 10 congressional, five state Supreme Court, three statewide measures, four King County offices/court races, and two Pierce amendments. All options, including write-ins, are retained. Percentages are calculated from votes for all options in the contest; overvotes and undervotes are excluded. First read the CSV on later updates, then archive the prior published snapshot before replacing anything.

Computed and checked in Python:

- 98 House leaders: 68 Democratic, 30 Republican. Normalize both official `Democratic Party` and `Democrat Party` labels to D; do not turn other party labels into Democrats.
- 24 Senate election leaders: 18 Democratic, six Republican. This is not the entire 49-seat Senate. The Bellevue Chamber independently reports a conditional whole-chamber 31 D / 18 R, including continuing seats. No complete state legislative media-call inventory was verified, so no secured composition is claimed.
- 10 U.S. House leaders: eight Democratic, two Republican. These are leads, not ten verified calls.
- Five Supreme Court contests and all three statewide initiatives accounted for.
- Four live King County contests plus three canceled Superior Court contests are separately accounted for. Do not fabricate November votes for canceled races.

Official dashboards, opened in a browser with `Intl.DateTimeFormat().resolvedOptions().timeZone` verified as `America/Los_Angeles`:

- State: https://results.votewa.gov/results/public/washington/elections/20261103 . Last updated November 4, 9:08:35 a.m. PST.
- King: https://results.votewa.gov/results/public/king-county-wa/elections/20261103 . Last updated November 3, 8:12:12 p.m. PST. Next expected November 4, 4 p.m. PST.
- Pierce: https://results.votewa.gov/results/public/pierce-county-wa/elections/20261103 . Last updated November 4, 9:06:25 a.m. PST. Next expected November 4, 4 p.m. PST.

Important retrieval pitfall: web_extract displayed the same dashboard timestamps three hours later than the browser. Do not label the extraction's 12:08 / 11:12 / 7 p.m. values as Pacific. Use the live browser's Pacific times above. This is a timezone rendering difference, not evidence of an additional ballot count. Statewide totals include counties with different underlying update times.

King PDF corroborates local totals, generated November 3 at 20:08:11:

https://election-results-pdf.kingcounty.gov/ redirects to https://election-results-01.kingcounty.gov/results.pdf . The report and live dashboard have different generation/publication timestamps but matching relevant counts. County summary page: https://kingcounty.gov/en/dept/elections/results/2026/november-general .

## Calls and national totals

AP's dynamically rendered dashboard, read in the Pacific browser at approximately 1:19 to 1:22 p.m. November 4:

- https://apnews.com/projects/elections-2026/us-house-results/ : 237 D, 139 R, 59 to be called; sums to 435. Majority threshold 218. These are AP calls, not all current leads. Dashboard timestamp observed 1:21 p.m.
- https://apnews.com/projects/elections-2026/us-senate-results/ : 54 Democratic aligned, 44 R, two uncalled; includes 34 continuing Democratic aligned seats and 31 continuing Republican seats. Baseline 53 R / 47 Democratic aligned. Majority threshold 51 with a Republican vice president. The two continuing independents caucus with Democrats, so show 52 D + two I rather than claim 54 actual Democrats.
- https://apnews.com/projects/elections-2026/governor-results/ : 28 D, 20 R, two uncalled, including six continuing D and eight continuing R; sums to 50. Dashboard timestamp observed 1:21 p.m.
- https://apnews.com/article/midterm-election-house-senate-democrats-republicans-trump-f126e12e05b579a327b98481c0ae2226 explicitly reports Democrats winning control of both congressional chambers. Article updated 2:57 a.m. EST November 4 (11:57 p.m. PST November 3); do not confuse its dynamically embedded widget's extraction timezone with the body publication time.
- https://www.dailypress.senate.gov/on-the-floor/senate-facts/ lists 45 D, two I, 53 R as of July 14 and identifies King and Sanders as Democratic caucus members. Only that party lineup and caucus statement are used; some other page sections show conflicting or stale names.
- https://www.ncsl.org/state-legislatures-news/details/2026-state-legislative-elections-the-results-and-what-they-mean independently gives governor totals 28 D / 20 R / two uncalled and baseline 24 D / 26 R. It identifies five R-to-D governor flips: Georgia, Iowa, Nevada, Ohio, Texas. Do not turn the partial secured totals into a final net change.
- https://apnews.com/article/midterm-election-uncalled-races-b20c577aaffced99155af448bd182fa5 identifies Alaska and Mississippi Senate, Alaska and Kansas governor as uncalled at noon Eastern. Recheck before publication; avoid recycling its vote margins into a newer timestamp.

The AP top-level and office pages' web_extract outputs omit their live numerical widgets. Read rendered browser text. The exact office URLs use `us-senate-results` and `us-house-results`, not `senate-results` and `house-results`.

## Washington legislative context

https://washingtonstatestandard.com/2026/11/03/rough-election-night-for-republicans-in-wa-legislature/ establishes current 59 D / 39 R House and 30 D / 19 R Senate, all 98 House seats and 24 Senate seats contested. Treat its race-specific figures as election-night reporting, not updated totals.

https://www.bellevuechamber.org/news/what-just-happened-washington-election-night-2026-recap-and-late-ballots independently describes 68 D / 30 R House and 31 D / 18 R Senate if current leads hold. The House conditional increase is nine; the Senate conditional increase is one. Two-thirds thresholds are 66 House and 33 Senate; simple majorities are 50 and 25. Neither conditional tally proves a secured supermajority. The Chamber is an interested advocacy organization; use its conditional accounting, not its late-ballot forecasts or political conclusions, and disclose the attribution.

No Washington U.S. Senate or statewide partisan executive election appears in the official 2026 list. Do not invent a 2026 governor, attorney general, or U.S. Senate race.

## Measures: verified primary text and limits

- I-638 full text: https://www.sos.wa.gov/sites/default/files/2026-03/INITIATIVE%20IL26-638%20fulltext.pdf . Read PDF text and visually inspect page 3. New section 3 requires sex verification for students entering specified female-only competition, based on reproductive anatomy, genetic makeup or normal endogenous testosterone. It does not prescribe a genital examination for every girl.
- I-638 official explanatory statement: https://www.sos.wa.gov/sites/default/files/2026-07/IL26-638%20Explanatory%20Statement.pdf . Confirms general exclusion of transgender girls and affected public/private school scope.
- I-001 full text: https://lawfilesext.leg.wa.gov/biennium/2025-26/Pdf/Initiatives/Initiatives/INITIATIVE%20IL26-001.pdf . It replaces the prior statute's provisions; nondiscrimination list on page 6 is struck. The removal of a statement in this statute is not repeal of separate chapters 28A.640 and 28A.642 RCW. Do not claim all nondiscrimination law disappears.
- I-001 official explanation: https://www.sos.wa.gov/sites/default/files/2026-07/ExStat_IL26-001.pdf . Describes records, privacy and notice changes, with other state/federal law still relevant.
- I-645 description is verified directly on the official results dashboard: repeal 9.9% tax on annual individual income over $1 million and prohibit specified state/local income taxes. Do not infer a new income-tax outcome solely from a lead.
- The official fact sheet lists exactly the three statewide measures: https://www.sos.wa.gov/sites/default/files/2026-10/GeneralElectionFacts2026.pdf . It gives county certification November 24 and secretary of state deadline December 3.
- Amendment 53 primary ballot explanation: https://www.piercecountywa.gov/DocumentCenter/View/159853/Charter-53---Explanatory-and-Ballot-Title . Approval ends the elected term January 1, 2027 and makes sheriff appointed by executive, confirmed by council majority. Rejection leaves this proposal unadopted; no claim that Swank is already removed or that his term has been newly extended.
- Amendment 54 primary ballot explanation: https://www.piercecountywa.gov/DocumentCenter/View/159854/Charter-54---Explanatory-and-Ballot-Title . Creates executive Public Safety Ombuds department, council appointment from panel list, findings/recommendations and advisory committee, subject to law. Rejection does not prove no other oversight exists.

Standing dossiers read: lets-go-washington.md, jaelynn-scott-lavender-rights-project.md, keith-swank.md. Older dossiers are leads, not current numerical evidence.

## Historic representation

Scott: https://www.lgbtqnation.com/2026/11/jaelynn-scott-will-be-nations-first-out-black-trans-state-lawmaker-after-winning-washington-race/ reports victory and describes first out Black trans woman in a state legislature and first trans Washington legislator. Attribute the report; do not label the county count certified. The Pink Times repeats LGBTQ Nation, so it is NOT an independent corroborating report. Do not count that repetition as a second independent source.

Cross-check historical wording:

- https://cawp.rutgers.edu/node/3706 : Althea Garrison, Black, elected in 1992, not out at election. This makes the word openly material.
- https://19thnews.org/2026/06/revolutionary-america-250-mo-turner-oklahoma-politics/ : Mo Turner is Black and nonbinary and was elected to Oklahoma's legislature in 2020. Do not erase their earlier service with the broader phrase first Black trans lawmaker.
- https://www.womenshistory.org/education-resources/biographies/andrea-jenkins : Jenkins was elected to Minneapolis City Council in 2017. State legislature is essential to Scott's narrower distinction.

Broader milestones checked in two different news organizations:

- Terry Tang, AP, November 4, via NBC: https://www.nbcwashington.com/elections/2026-midterms-historic-firsts/4177472/ . Reports Chris Pappas, Peggy Flanagan, Deb Haaland, Keisha Lance Bottoms, Byron Donalds, Juliana Stratton. Its El-Sayed subheading/body still contains conditional pre-call wording despite updated introductory text; use CNN for his outcome.
- Aleena Fayaz, CNN, November 4 (updated 8:28 a.m. ET): https://www.cnn.com/2026/11/04/politics/historic-firsts-2026-election . Explicitly projects El-Sayed, Pappas, Flanagan, Bottoms, Haaland, Donalds, Hinojosa and others. One paragraph omits female in Flanagan's distinction; use the narrower female distinction from both the table and AP.
- Jesse Bedayn and Anna Wilder, AP: https://apnews.com/article/texas-governor-election-hinojosa-abbott-c9a0ffa1ec3cd599f9bc304ae26268a2 . Reports Hinojosa as Texas' first Latina governor; CNN corroborates first Hispanic governor of Texas.

Do not claim Jeffries has already been elected speaker, Peltola has already won, or an election win means someone already holds the new office. This is a selected set of milestones, not an exhaustive inventory of all identities and races.

## Superior Court checklist correction

No Superior Court contest for the three requested positions is present in the official November export or the 17-page King report. Ballotpedia says each November general election was canceled and each incumbent won without appearing on the ballot:

- Position 20, Kent Liu: https://ballotpedia.org/Kent_Liu .
- Position 32, Daniel York: https://ballotpedia.org/Daniel_York .
- Position 45, Tenaya Scheinman: https://ballotpedia.org/Tenaya_Scheinman .

Label these as canceled contests, with no November vote total, attributed to Ballotpedia. A county declaration/certificate was not obtained, so do not upgrade this to independently verified certification. The prior voter guide includes recommendations for these seats; leave it unchanged and flag the discrepancy to the owner.

## Pre-publication refresh gate

1. Obtain a new explicit update request. Keep draft hidden until publication approval.
2. Save the old published snapshot if one exists; compare only like-for-like geographies, options and status definitions.
3. Refresh official export, browser Pacific timestamps, AP calls, governor totals and historical wording.
4. Recompute all percentages, margins, leaders and seat arithmetic from source files. Preserve write-ins.
5. Resolve unverified complete secured state chamber totals rather than promoting leads. Recheck next update times, certification and recount/runoff status.
6. Verify citations, internal links, both image slots, Markdown checks, lint and static build. Draft routes are excluded: a passing normal build is not proof the draft renders.
7. At publication remove draft only with owner approval, update publication date if needed, and verify the real rendered route and social image.

## Verification of this unpublished draft

- Owner explicitly approved the immutable Docker dependency install, lint and static build after the missing-dependency blocker. Installation completed with peer-dependency warnings; `package.json` and `yarn.lock` are unchanged.
- Docker lint passed. Docker static build passed, prerendering 896 routes; link checker reported zero errors and zero warnings.
- Social image verification passed: 58 HTML files, 51 distinct local social images, all present at 1200x630. These are the published site's images, not a rendered social image for this hidden draft.
- Asserted that the draft route is absent from static output and that all three linked prior article routes exist. The draft's page layout and rendered footnote links remain unverified because it was intentionally not published or temporarily made public for testing.
- Recomputed percentages for all 146 preserved contests, checked national and state seat arithmetic, and confirmed 31 ordered source definitions match the article's first-use footnote order.
- Both generated PNGs are 1792x1024. No em dashes or CR line endings in the article. The mechanical article checker flags `draft: true`, which is intentional and owner-approved.
- No results refresh was performed after the 1:28 p.m. snapshot. No commit, push, deployment or older-article edit was made.

## November 5 blue-wave illustration refresh

The owner requested regeneration of both article images under the revised engagement guidance, with a blue-wave allegory and predominant blue. Two `gpt-6.1-terra` medium-effort agents generated new PNGs through the local Codex native image capability; each succeeded on its first generation after a sandbox initialization retry. The parent independently viewed both final 1792×1024 files and the feature thumbnail.

The feature shows a joyful crowd applauding and embracing beneath sweeping blue fabric. The header shows a high-five on an inclusive community recreation court with a blue wave mural. Blue clothing, visible pride-color accessories, expressive faces and sunny lighting carry the intended celebration and belonging. These are distinct fictional scenes, not photographs of election events or school competitions. Full prompts and asset paths are preserved in [the image prompt record](2026-election-results-image-prompts.md).

The article now uses the new paths, a descriptive feature alt, an engagement caption and an updated AI-illustration disclosure. Its dated correction note identifies the visual update. All vote/seat figures, reporting snapshots, outcome statuses and source footnotes remain unchanged from the reviewed article. Old images are retained. Parent lint, static build and social-image checks follow this visual review; no staging, commit, push or deployment is authorized by this image refresh.

### Parent validation of the blue-wave assets

Both PNGs are 1792×1024, and both alt/caption fields are within 50–250 characters. Parent checks confirm all 22 chart objects, source definitions and publication title/date/order/slug match the pre-image-refresh article. Earlier code and guideline edits remain byte-for-byte intact.

Docker lint passed without warnings. The static build passed with 899 prerendered routes and zero prerender errors. Social-image verification checked 52 distinct local URLs across 59 HTML files; all exist at 1200×630. The generated article and browser DOM use the new header and feature social image. Parent visual review also checked the actual 1200×630 social crop and a headless browser screenshot of the article. Temporary logs/screenshots are `/tmp/blue-wave-*`; the temporary loopback server was stopped. No result refresh, commit or push was performed.
