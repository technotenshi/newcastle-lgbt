# November 3, 2026 election: actual-voter demographic source verification

Checked November 4, 2026 (local clock recorded `2026-11-04T15:55:02-0800` during the check). Public aggregate data only. This is a research evidence record, not certified results or an article.

## Finding

**Current age-specific turnout percentages were retrieved from King County's official embedded Power BI report. Matching age-specific registered-voter counts and returned-ballot counts were not retrieved. No current statewide age-specific figures were verified.** Do not describe the King County figures as statewide, Newcastle-specific, certified participation, demographic shares of voters, or initiative voting by age.[^1][^2]

The absence of verified statewide figures in this check is an access/verification limitation, not proof that the Secretary of State has not published them elsewhere. The earlier finding that November General rows in `VoterParticipation.xlsx` were blank was supplied as task context; that workbook was not independently rechecked in this browser investigation. No historical values were substituted.

## King County: verified current report fields

Official landing page: https://kingcounty.gov/en/dept/elections/results/ballot-return-statistics/2026/november-general

The complete public full-screen link was obtained from the official page using text extraction, then opened in the browser:

Public report link: obtain it from the official landing page. Encoded query omitted.

Report title: **Ballot Return Statistics / November 2026 General Election**. Both Summary (page 1 of 12) and Returned by Demographics (page 6 of 12) displayed **Last updated: 11/4/2026 2:00:06 PM**. The report text did not expose a timezone for that timestamp; do not silently append one. The demographic page's **Filter by District** was **All**. This is the county report's unfiltered geography, not all Washington.[^1]

### Countywide summary

| Exact field label | Displayed value |
|---|---:|
| Total Ballots Returned | 811,397 |
| Active Registered Voters | 1,460,414 |
| Voter Turnout | 55.56% |

The demographic page independently displayed the same **Total Ballots Returned: 811,397**.[^1]

### Turnout by Age

Labels are preserved literally, including `65+ (Other)`. The long decimal values below are the browser accessibility labels of the six chart bars, in chart order, not reconstructed counts.[^1]

| Exact age label | Displayed turnout | Bar accessibility value | Age-specific ballots returned | Matching age-specific registered voters |
|---|---:|---:|---|---|
| 18-24 | 33.82% | 0.3382147330401095 | Not retrieved | Not retrieved |
| 25-34 | 41.76% | 0.4176017259210658 | Not retrieved | Not retrieved |
| 35-44 | 50.81% | 0.5081078581667242 | Not retrieved | Not retrieved |
| 45-54 | 56.69% | 0.5669097999566693 | Not retrieved | Not retrieved |
| 55-64 | 64.16% | 0.6415681451445111 | Not retrieved | Not retrieved |
| 65+ (Other) | 73.15% | 0.7315437690653984 | Not retrieved | Not retrieved |

The chart establishes that the official report publishes these age-group percentages. It does **not** establish the number of voters in each age group. Do not invert rounded percentages, infer denominators from the countywide total, or substitute general-population age counts. The meaning of the suffix `(Other)`, the age reference date, treatment of unknown ages, and precise age-specific registration eligibility/status rule were not verified. Preserve the original category rather than silently relabeling it `65+`.

### Other demographic fields actually exposed

The same page exposed **Turnout by Language**, **Turnout by Gender**, **Total Ballots Returned**, and **Filter by District**. These are official chart labels, not a verified codebook for identity, language proficiency, race, ethnicity, or LGBTQ+ status.[^1]

| Turnout by Language label | Displayed turnout |
|---|---:|
| Chinese | 37.79% |
| English | 55.49% |
| Korean | 50.32% |
| Other | 39.58% |
| Russian | 42.26% |
| Somali | 40.00% |
| Spanish | 45.44% |
| Vietnamese | 43.81% |

| Turnout by Gender label | Displayed turnout |
|---|---:|
| (Blank) | 27.87% |
| F | 56.83% |
| M | 54.24% |
| Other | 50.00% |
| U | 51.21% |

No counts or matching demographic denominators were retrieved for these charts. Do not interpret administrative registration fields as a demographic survey.

### Timing and ballot-status definitions verified on the official landing page

King County explicitly says:[^1]

> This information is a snapshot in time, subject to change, and is intended to provide an unofficial indication of returns. As required by law, returned ballots are accepted and counted only after the voter’s signature has been verified.

> Ballot return data is updated every 2 hours between 8:00 a.m. and 6:00 p.m. on business days. The voter registration data is updated two weeks before Election Day and on Election Day.

The Summary page additionally exposed ballot statuses **Accepted**, **Challenged**, and **Received** on its returns-by-date chart. Therefore keep **returned** separate from **accepted/counted**, and do not describe this preliminary return measure as final certified participation. The landing page provides the registration refresh schedule but not the demographic denominator counts or an exact displayed denominator snapshot date. November 3 is the election-day refresh scheduled by the page, not an independently verified successful refresh timestamp.

## Washington Secretary of State: what was and was not verified

Official landing page: https://www.sos.wa.gov/elections/data-research/election-data-and-maps/ballot-return-statistics

Verified landing-page heading: **Ballot Return Statistics**. Verified embedded iframe title: **2026 November General Ballot Return Statistics**. Verified publication schedule:[^2]

> Ballot return statistics are posted after 5 p.m. each business day, not including state holidays, beginning two weeks prior to Election Day and continuing until the election is certified.

Public report link: obtain it from the official landing page. Encoded query omitted.

Do not fabricate a replacement report token, claim the unavailable link proves nonpublication, or carry the county percentages over to statewide analysis.

## Browser evidence and limitations

- Used `browser_exec` in an isolated session, first reading `page_info()` and filtered `Accessibility.getFullAXTree` snapshots before interacting.
- The initial official-page browser DOM showed abbreviated Power BI links. Opening those literal abbreviated links returned an unavailable-content message. Text extraction of the King County landing page exposed a complete public report URL; that source-provided URL successfully loaded the actual 12-page report.
- The report loaded asynchronously. Early snapshots and screenshots showed empty/loading visuals. Later `document.body.innerText` and accessibility chart options exposed the November 2026 values recorded above. An empty early frame was not treated as missing data.
- Selected **Returned by Demographics** through the report page chooser. Verified **6 of 12**, the current election heading, timestamp, district filter **All**, age labels and percentage bars. No district or age filter was applied.
- Age chart category accessibility nodes were `4450` through `4455`; value nodes were `4486` through `4491` in that browser snapshot. These are ephemeral diagnostic IDs, not stable source identifiers.
- An attempted exact-bar hover through CDP timed out, so no tooltip counts or denominator fields were obtained. Later navigation toward report definitions did not yield a usable About page. Neither denominator counts nor unobserved definitions are asserted here.
- Raw extracted demographic text and accessibility labels were saved in browser scratch evidence at `/Users/angelibarra/.hermes/cache/browser-use/workspace/sa-0-d754e54a/king-county-demographics.json`. This Markdown preserves the material aggregate values durably; the scratch path is supplementary, not required to use the findings.
- A Python `urllib` source fetch failed local certificate verification; `curl` subsequently fetched the SOS page successfully. No TLS-verification bypass was used.
- No credentials, CAPTCHA interaction, individual ballot-status download, voter record, registration-file join, X/Twitter content, or Census proxy was used.

## Analysis boundary

These data support a carefully labeled preliminary statement about **King County's reported turnout percentages by registration age group**, as of the report timestamp. They do not yet supply an auditable age-by-age numerator/denominator table. They do not identify which age groups voted for or against statewide initiatives. Geographic turnout-versus-initiative comparisons, if pursued separately, must remain ecological, distinguish county from statewide geography, and use compatible timestamps and denominators.

## Sources

[^1]: King County Elections. (2026). *November 2026 General ballot return statistics* [Official landing page and embedded Power BI report, Summary and Returned by Demographics pages; report updated November 4, 2026, 2:00:06 PM]. Retrieved November 4, 2026, from [https://kingcounty.gov/en/dept/elections/results/ballot-return-statistics/2026/november-general](https://kingcounty.gov/en/dept/elections/results/ballot-return-statistics/2026/november-general).

[^2]: Washington Office of the Secretary of State. (n.d.). *Ballot return statistics*. Retrieved November 4, 2026, from [https://www.sos.wa.gov/elections/data-research/election-data-and-maps/ballot-return-statistics](https://www.sos.wa.gov/elections/data-research/election-data-and-maps/ballot-return-statistics).
