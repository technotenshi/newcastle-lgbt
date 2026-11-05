## Synthetic candidate fixture, not election reporting

This file is outside the content collection and creates no production route.

::election-results
---
contest:
  id: fixture-multiparty
  title: Synthetic candidate contest with all supported party colors
  type: candidate
  source: Synthetic test data
  snapshot: "2026-11-04T17:52:00-08:00"
  incomplete: true
  incompleteNote: Demonstration of an explicitly limited supplied count.
  status:
    kind: leading
  results:
    - { id: a, label: Candidate A, party: Republican, votes: 200 }
    - { id: b, label: Candidate B, party: Democratic, votes: 400 }
    - { id: c, label: Candidate C, party: Libertarian, votes: 150 }
    - { id: d, label: Candidate D, party: Green, votes: 100 }
    - { id: e, label: Candidate E, party: Independent, votes: 50 }
    - { id: f, label: Candidate F with a deliberately long ballot label to check wrapping at phone widths, party: Local party with a very long ballot preference label to check wrapping, votes: 50 }
    - { id: write-ins, label: Write-ins, party: Nonpartisan, votes: 50 }
---
#source
Synthetic count evidence.[^1]
::

[^1]: Synthetic fixture only; no real candidates or results.
