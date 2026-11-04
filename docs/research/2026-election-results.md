# November 2026 election results reporting

Research cutoff: November 4, 2026, 1:28 p.m. PST. This is an unpublished article's evidence record, not a continuously maintained dashboard.

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
- Use only a preliminary turnout note now. Defer substantive county-level turnout and initiative-result comparisons until certified data are available.
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

“Washington's unofficial turnout dashboard reports 2,026,373 ballots cast among 5,170,951 registered voters, or 39.19%, in its November 4 afternoon update. This is an incomplete reporting snapshot, not final turnout. It does not establish whether turnout helped produce the initiative leads; that analysis should wait for certified county-level turnout and results.”

If approved for the article, give this a separately labeled reporting timestamp because it is newer than the existing article cutoff. Cite the official turnout view using the article's footnote conventions. Do not silently update the initiative totals or other races alongside this addition.

### Remaining work and limitations

No county-level association has been calculated or verified. Different county counting speeds can make incomplete reported turnout look like differences in final participation. Even a verified county-level association would not establish causation, how LGBTQ+ voters voted, or what nonvoters preferred.

After certification, obtain turnout and initiative results for matching counties and the same election. Verify each source's certification status and reporting definitions before comparing. No monitoring job or reminder has been scheduled; resume only when requested.

Additional official source locations identified during the read-only research:

- Ballot-return reports: https://www.sos.wa.gov/elections/data-research/election-data-and-maps/ballot-return-statistics . These concern returns and must not be conflated with the results dashboard's ballots-cast figure.
- Historical turnout: https://www.sos.wa.gov/elections/data-research/election-data-and-maps/reports-data-and-statistics/voter-turnout-election . At the initial check, its newest entry was August 4, 2026; it did not yet supply November 2026 turnout.
- Participation denominators: https://www.sos.wa.gov/elections/data-research/reports-data-and-statistics/voter-participation-statistics . Registered-voter turnout and voting-age-population participation are different measures; voting-age population is not synonymous with voting-eligible population.

The initial text extraction did not expose the current turnout figures. Opening the dashboard's Voter Turnout control in the browser did expose them. For a future refresh, read the rendered turnout view rather than assuming the figures are unavailable.

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
