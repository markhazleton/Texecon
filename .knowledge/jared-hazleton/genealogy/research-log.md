# Research log

## September 14, 2026 — Python public-record searches

Used requests and BeautifulSoup to retrieve OHS marriage-index tables, the Tulsa
Library death-notice index, and attempted Gateway/FamilySearch search responses.
OHS returned no rows for Hazleton, ten for Hazelton, and twelve for Myrtle Smith;
none matched the target couple. This supersedes the earlier incomplete
surname-only search assessment. A Myrtle Hazelton notice in Tulsa World dated
July 14, 1977 is an unassigned candidate. No census household was retrieved.
See [findings and saved evidence](public-records-findings.md).

## September 14, 2026 — second pass: uncaptioned documents

The Waterloo full-page retry remained unavailable. No linked cemetery photographs were inspected.

The OHS marriage search form was inspected directly. A query with `fname=Alfred`, `lname=Hazelton`, blank year, and `action=Search` returned **no matches**. A surname-only Hazleton response was inspected only for selected HTML terms; it was not sufficient to classify the result conclusively. A subsequent Python request for the surname-only search returned HTTP 403, and that batch stopped before its other planned queries ran. Do not record the unexecuted Myrtle Smith, Besse Goode, or Bessie Goode searches as negative results. No record was ordered.

Useful next attempt is a manual search of the [OHS marriage index](https://www.okhistory.org/research/marrresults) using surname variants and then the bride's name. Failure to match this query does not rule out a marriage elsewhere or an indexing variant.

Directly reviewed images 032, 034, 036, and 006. These yielded James Louis Allan's funeral notice, Stanley Lee Haggard's marker, and an exact cleaning-business sign. Full observations and a new library-hosted obituary lead are in [document transcriptions](photo-document-transcriptions.md).

New searches included `"James Louis Allan" Winchester`, `"Stanley Lee Haggard"`, `"Smiths Cleaners" "Carthage"`, and `"Smith" "Cleaners" "Dyers" "Blackwell"`. Only the Allan search produced a new specific documentary lead in the inspected results. The Haggard cemetery match was already present in the Waterloo result. No new family relationship has been established in this pass.

Next deliverables: verify the Allan obituary against its newspaper source; corroborate Haggard's identity through an obituary; obtain Alfred/Myrtle marriage or census evidence. The last remains the highest priority for proving the direct ancestral chain.

## September 14, 2026 — records and cemetery follow-up

### Sources examined

| Source | Access and result | What it supports |
| --- | --- | --- |
| [Jared Earl Hazleton funeral-home obituary](https://www.dignitymemorial.com/obituaries/arlington-tx/jared-hazleton-13026327) | Full page opened | Birth September 12, 1937, Oklahoma City; death September 3, 2026; parents Alfred Larson Hazleton and Myrtle Francis. It does not provide Myrtle's maiden surname. |
| [Album photos 023, 024, 035](gravestone-review.md) | Original local JPEGs visually inspected | Susan A. Goode's marker reads 1855–1928; further readings and limitations recorded separately. |
| [Waterloo Cemetery index](https://www.okcemeteries.net/oklahoma/waterloo/waterloo.htm) | Search result contained relevant Goode rows; full-page request returned HTTP 429 | Candidate cemetery identification and candidate child identity. Full source and linked images still need inspection. |

The funeral-home page independently confirms what the earlier AI report said the obituary contained. This is verification against the cited publication, not independent corroboration of every biographical fact with civil records. The page's service-scheduling text is not used to infer current arrangements.

### Searches performed

Queries included:

- `"Myrtle" "Hazleton" "Smith"`
- `"Alfred Larson Hazleton"`
- `"Besse" "Smith" "Goode"`
- `"Oklahoma" "Myrtle" "Alfred" "Hazelton"`
- `"Myrtle Frances" "Hazleton"`
- `"Benjamin Tillman Smith" Oklahoma`
- `"Goode" "1844" "1925" Edmond`
- `"Besse" "Smith" Edmond cemetery`
- `"Goode" "Susan" "1928" "Oklahoma"`
- `"John Goode" "1925" cemetery Oklahoma`
- `"Myrtle" "Hazleton" obituary`
- `"Smith" "Besse" "Carthage"`
- `site.okcemeteries.net/oklahoma/waterloo/ "SMITH"`
- `"William J. Bryan" "Goode"`
- `"Waterloo" "Bessie" "Smith" cemetery`
- `"Myrtle" "Hazleton" "Alfred" -site:jetty.klnpa.org`

These searches did not locate a usable marriage record or an independently matched older Smith/Hazleton household in the inspected results. That is a search limitation, not evidence that records or relatives do not exist. Unrelated Hazleton, Pennsylvania results and unlinked same-name people were excluded. No subscription databases or authenticated FamilySearch records were searched.

### Follow-up record targets

| Priority | Question | Record to seek | Match requirements |
| --- | --- | --- | --- |
| 1 | Was Myrtle's maiden name Smith, and who were her parents? | Alfred/Myrtle marriage record; Myrtle obituary or death certificate | Both spouses or known children; locality; original image and citation |
| 2 | Who were Alfred's parents? | Alfred obituary, death record, earlier census household | Full name plus spouse/child or another independent identifier |
| 3 | Which Goode family is pictured? | Waterloo linked stone photos and burial records | Same marker layout, names, dates, and parents' initials |
| 4 | Was the child Besse's brother or from the previous generation? | Goode census households around 1900; child's death notice | Explicit parentage; allow for a child who died before census enumeration |
| 5 | What did O.E. stand for? | Smith census, obituary, marriage, and business records | Besse/Myrtle or other identified relatives; not initials alone |
| 6 | Who was Elizabeth Goode? | Goode marriage/census/obituary records | Explicit connection to Besse or Myrtle; avoid assuming she married W.H. |

Starting points: [Oklahoma marriage holdings](https://www.okhistory.org/research/forms/marriageguide.pdf), [federal censuses](https://www.archives.gov/research/census), [Gateway to Oklahoma History](https://gateway.okhistory.org/), and [Missouri archival resources](https://www.sos.mo.gov/archives/resources). These are next-search destinations, not evidence of a family match.
