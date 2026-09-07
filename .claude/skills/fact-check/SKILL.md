---
name: fact-check
description: Perform a rigorous, claim-by-claim fact-check and citation audit of an article, essay, report, or policy analysis — verifies every citation exists, resolves to the source claimed, and actually supports the specific statement attached to it. Use when asked to fact-check an article, verify citations/references, audit sources, check whether citations support claims, or review a draft before publication.
---

# Article Citation and Fact-Check Audit

## Purpose

Perform a rigorous editorial fact-check and citation audit of an article, essay, report, blog post, policy analysis, investigative piece, or other sourced writing.

The goal is not merely to determine whether the article "looks credible." The goal is to determine, claim by claim, whether:

1. The cited source exists.
2. The citation resolves to the source claimed.
3. The source actually supports the specific statement attached to it.
4. Numbers, dates, quotations, names, titles, legal claims, scientific claims, and procedural history are accurate.
5. The article accurately represents the strength and limitations of the underlying evidence.
6. Important developments occurring after a cited source was published have not made the article outdated or misleading.
7. Primary sources are used where reasonably available.
8. Editorial conclusions remain distinguishable from factual claims.

This is an adversarial verification task. Assume that even plausible-looking references may contain errors.

---

## When to Use

Use this skill whenever the user asks to:

* fact-check an article
* verify references or citations
* audit sources
* check whether citations support claims
* review an article before publication
* verify statistics or quotations
* examine legal or scientific sourcing
* check chronology
* identify unsupported assertions
* evaluate source quality
* cross-check footnotes or bibliography entries
* determine whether an article is current

The article may be supplied as:

* pasted text
* Markdown
* PDF
* Word document
* uploaded file
* webpage URL
* draft with inline hyperlinks
* draft with numbered footnotes/endnotes

## Repo-specific verification tools

When auditing a `content/news/*.md` article in this repo, use the tools already established here (see root `CLAUDE.md`) rather than defaulting to a plain fetch:

* **`playwright-cli`** (real Chromium browser) — the most reliable way to confirm a source link resolves. `curl`/`WebFetch` and a real browser can return different results from the same bot-defensive site.
* **`federalregister.gov`** — blocks bots inconsistently (reCAPTCHA wall to `WebFetch`, `curl`, and sometimes even Playwright). A single 200 with the correct title/text is sufficient confirmation; don't treat a later CAPTCHA redirect as proof the citation is broken.
* **NCBI E-utilities** — `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=<PMID>&retmode=json` (or `db=pmc`) to confirm a PubMed/PMC citation's real title and authors when the HTML page is behind a cookie wall.
* **WA bill/initiative text** — `sos.wa.gov` ballot-initiative PDFs 403 `WebFetch`; `lawfilesext.leg.wa.gov` enacted-bill PDFs usually work. Use the `Read` tool's `pages` parameter directly on a fetched/saved bill PDF to see strikeout/underline markup rather than trusting a secondary summary.
* Existing `docs/research/*.md` background dossiers on recurring subjects (organizations, committees, individuals) are a starting point, not a substitute for re-verifying the specific claim against its cited primary source.

---

# Core Principles

## 1. Verify, Do Not Assume

Never treat the existence of a citation as proof that the corresponding claim is supported.

For every meaningful citation, determine:

* Does the source exist?
* Is the title correct?
* Is the author or organization correct?
* Is the publication date correct?
* Is the journal, court, agency, or publication correct?
* Does the URL point to the cited document?
* Does the cited document say what the article says it says?

A citation can be genuine while still being misused.

---

## 2. Audit the Claim, Not Merely the Source

Compare the wording of the article against the wording and meaning of the source.

Classify support as:

### DIRECTLY SUPPORTED
The source clearly supports the claim as written.

### SUPPORTED WITH QUALIFICATION
The basic claim is correct, but wording in the article is broader, stronger, more absolute, or less precise than the source.

### PARTIALLY SUPPORTED
Only part of a compound statement is supported.

### MISLEADING
Technically related evidence exists, but the article presents it in a way that creates a materially inaccurate impression.

### UNSUPPORTED
The cited source does not substantiate the claim.

### CONTRADICTED
Reliable evidence directly conflicts with the article.

### OUTDATED
The claim may once have been correct, but later developments materially changed the situation.

---

# Research Workflow

## Phase 1: Parse the Article

Identify:

* title
* publication or draft date
* central thesis
* sections
* footnotes/endnotes
* hyperlinks
* quoted material
* numerical claims
* legal claims
* scientific/medical claims
* historical claims
* claims about current events
* statements attributed to named people or organizations

Create an internal inventory of all claims requiring verification.

Do not limit verification only to sentences containing explicit citations.

---

## Phase 2: Audit Every Citation

For every reference, check bibliographic accuracy:

* author
* organization
* title
* publication
* publication date
* DOI if relevant
* court and case information
* government agency
* URL
* document version

Flag malformed or incorrect metadata even when the underlying source is valid.

Examples:

* wrong journal
* wrong publication year
* wrong case name
* press release cited instead of the underlying study
* source title paraphrased inaccurately
* dead or incorrect URL
* secondary article used when primary source is available

---

## Phase 3: Claim-to-Source Verification

Read enough of the original source to understand its context.

Do not rely solely on:

* search-result snippets
* article abstracts when full text is available
* press releases describing academic papers
* advocacy summaries of statutes
* news stories describing court filings
* another article quoting the original source

When possible, inspect the primary document.

For each cited claim, ask:

> If a skeptical reader opened this citation, would she reasonably conclude that the cited source supports what the article just told her?

If the answer is no, flag it.

---

# Source Hierarchy

Prefer sources approximately in this order, depending on subject.

## Law and government

1. Statutes and regulations
2. Court opinions and orders
3. Complaints, briefs, and filings
4. Federal Register
5. Agency publications
6. State attorney general or government publications
7. Reputable legal analysis
8. News reporting
9. Advocacy summaries

Always distinguish between:

* allegations in a complaint
* arguments in a brief
* preliminary injunctions
* final judgments
* appellate rulings
* pending cases
* enacted legislation
* proposed legislation
* proposed rules
* final rules

Never describe allegations in a complaint as established facts.

---

## Medicine and science

Prefer:

1. Original peer-reviewed research
2. Systematic reviews and meta-analyses
3. Professional clinical guidelines
4. Government/public-health sources
5. Major academic medical institutions
6. Secondary reporting
7. Advocacy summaries

Check:

* sample size
* study design
* population
* follow-up duration
* confidence intervals
* causal versus correlational findings
* whether results are being generalized beyond the study population
* publication year
* subsequent corrections or retractions

Do not convert correlation into causation.

---

## Statistics

Whenever possible, trace numbers to the original dataset or official report.

Check:

* numerator
* denominator
* date range
* geography
* age range
* population definition
* units
* inflation adjustment
* nominal versus real dollars
* annual versus cumulative totals
* federal versus state spending
* percentage versus percentage points

Recalculate ratios and percentages when useful.

Flag orders-of-magnitude errors aggressively.

---

# Date and Chronology Audit

Chronology errors are especially important.

Build a timeline whenever an article discusses:

* litigation
* legislation
* government actions
* scientific developments
* investigations
* elections
* corporate events
* unfolding news

Check:

* date event occurred
* date source was published
* whether later developments superseded the source
* whether the article's publication date makes a claim outdated

Pay special attention to words such as: currently, pending, unresolved, recently, today, remains, still, first, latest, final, proposed.

These words require current verification.

---

# Legal Procedural Posture

Legal articles require extra scrutiny.

For every referenced case determine, where relevant:

* court
* docket/case number
* filing date
* plaintiffs and defendants
* cause of action
* preliminary rulings
* summary judgment
* injunctions
* final judgment
* appeal
* appellate decision
* current status

Do not say a case is "pending" merely because litigation once existed.

A case may have received a district court judgment, been appealed, had part of the dispute mooted, had a rule vacated, or received an injunction. Explain the precise posture.

---

# Quotations

Verify every important quotation.

Check:

* exact wording
* speaker
* context
* date
* source

If wording has been shortened, rewritten, stitched together, or paraphrased, it should not appear as an exact quotation.

Minor punctuation normalization is acceptable only if meaning remains identical.

Flag altered quotations separately.

---

# Numerical Comparisons

Whenever an article makes a rhetorical comparison involving money or scale, independently verify the calculation.

For example: "A policy saves $100 million compared with a $20 billion program." Calculate 100 million / 20 billion = 0.5%.

If the article mistakenly compares an annual number against a ten-year number, correct it.

Prefer matching same time period, same jurisdiction, same funding category, same nominal/real-dollar basis.

---

# Missing Citation Audit

Identify important factual claims without citations.

A citation should usually be present for:

* exact statistics
* survey results
* medical claims
* quotations
* controversial factual assertions
* government actions
* court outcomes
* historical dates that matter to the argument
* organizational positions
* policy costs
* demographic estimates

Not every sentence requires a footnote. Editorial interpretation does not necessarily need one if the underlying facts are already sourced.

---

# Citation Placement

Check whether citations appear next to the claim they support.

Flag cases where:

* one footnote follows several unrelated statistics
* a citation supports only one half of a paragraph
* references are reversed
* a secondary source is attached to data actually found in another source
* a paragraph makes multiple factual claims but only one is substantiated

Recommend moving or duplicating citations where needed.

---

# Source Quality Audit

For each significant reference evaluate whether it is:

### PRIMARY
Original study, law, regulation, court document, official data, first-party statement.

### AUTHORITATIVE SECONDARY
High-quality journalism, scholarly synthesis, reputable legal analysis, major medical institution.

### ADVOCACY SOURCE
May be useful but should generally not be the sole authority for contested facts when primary evidence exists.

### WEAK SECONDARY
Blog post, unsourced commentary, aggregation, unclear provenance.

Do not automatically reject advocacy sources. Instead determine whether their underlying factual claims can be independently verified.

---

# Bias and Argumentation

The skill is not intended to force artificial political neutrality. An article may take a clear position. Evaluate whether the factual foundation supports the argument.

Distinguish:

### Factual error
Evidence contradicts the statement.

### Overstatement
Evidence supports a narrower claim.

### Editorial conclusion
A reasonable interpretation based on established facts.

### Rhetorical characterization
Language reflecting the author's viewpoint.

Do not label an opinion "false" merely because another viewpoint exists. Do flag rhetoric when it implicitly claims facts that have not been established.

---

# Severity Classification

## CRITICAL
Errors that materially affect the article's thesis or factual narrative — e.g. wrong court outcome, nonexistent law, fabricated source, major statistical error, quotation falsely attributed, outdated information reversing the article's claim.

## MAJOR
Meaningful inaccuracies that should be fixed before publication — e.g. wrong study year, materially incorrect procedural history, incorrectly describing what a study measured, substantial overstatement, important missing qualifier.

## MODERATE
Real problems that do not fundamentally change the argument — e.g. wrong citation placement, secondary source where primary source is preferable, incorrect bibliographic metadata, minor chronological imprecision, unsupported but easily sourced statistic.

## MINOR
Editorial or citation hygiene problems — e.g. title formatting, minor source-name inconsistency, redundant citation, typo in organization name.

---

# Required Output

Begin with a short overall assessment. State whether the article is:

* publication-ready
* publication-ready after minor corrections
* requires substantive corrections
* requires major reworking

Then provide an audit table with columns:

| Severity | Article claim | Finding | Recommended correction |

For every material problem: quote or accurately paraphrase the article claim, explain what verification found, cite the evidence used for verification, and give specific replacement wording or instructions when practical.

After the table, include:

## Essential Corrections Before Publication
List only the issues that materially need fixing.

## Source Quality Improvements
Identify secondary or weak references that should be replaced with primary sources.

## Missing Citations
Identify important factual assertions needing references.

## Overall Assessment
Explain whether the central thesis survives verification. A strong audit may conclude:

> Several factual errors exist, but correcting them strengthens rather than undermines the central argument.

or:

> The central conclusion depends on claims that are not adequately supported and should be reconsidered.

Do not soften either conclusion.

---

# Verification Rules

1. Search the current web for time-sensitive claims.
2. Verify legal claims against current court records or government sources where possible.
3. Verify regulations against the Federal Register or official government publication.
4. Verify scientific papers using the journal, PubMed, DOI, or full paper.
5. Prefer original reports over news coverage of reports.
6. Verify quoted language against the original statement.
7. Recalculate percentages and comparisons.
8. Inspect dates carefully.
9. Search for developments occurring after the cited material.
10. Never invent missing sources.
11. Never assume a footnote supports a paragraph without reading it.
12. Clearly distinguish verified facts from your own inference.
13. If primary evidence cannot be obtained, state that explicitly.
14. If sources disagree, explain the disagreement rather than choosing one silently.
15. Treat factual precision as more important than preserving the author's preferred narrative.

---

# Special Attention Checklist

Before completing an audit, explicitly consider:

* [ ] Incorrect dates
* [ ] Wrong names or titles
* [ ] Broken references
* [ ] Wrong publication/journal
* [ ] Misquoted statements
* [ ] Outdated procedural status
* [ ] Proposed versus final rule confusion
* [ ] Lawsuit allegation presented as fact
* [ ] Wrong number of legal claims/counts
* [ ] Correlation described as causation
* [ ] Wrong sample/population
* [ ] Percentage calculation errors
* [ ] Annual versus cumulative spending
* [ ] Federal versus total spending
* [ ] Citation does not support sentence
* [ ] One citation incorrectly covering several claims
* [ ] Missing primary source
* [ ] Important uncited statistic
* [ ] Newer evidence changing the conclusion
* [ ] Source materially mischaracterized
* [ ] Secondary reporting used where original evidence exists

---

# Editing Philosophy

Do not rewrite the entire article unless asked. The default objective is to preserve the author's argument while making its factual foundation defensible. When an error is discovered, prefer the smallest correction that makes the statement accurate. However, if correcting the factual record changes the argument itself, explicitly say so.

The standard is:

> Could this article withstand scrutiny from a knowledgeable reader who opens every footnote?

If not, identify exactly what must change.
