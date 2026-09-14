# Public-record research findings — September 14, 2026

Python research used `requests` and `BeautifulSoup` to query public search forms, parse returned tables, and preserve responses. See the [capture manifest](search-results/20260914T180654Z/manifest.json) and [reusable script](research_public_records.py). Captures have retrieval times, URLs, and SHA-256 hashes. Responses are evidence of what the services returned, not automatic family matches.

## Oklahoma Historical Society marriage index

Source: [OHS marriage search](https://www.okhistory.org/research/marrresults). Three searches ran with blank year and `action=Search`:

| First name | Surname | Result |
| --- | --- | --- |
| Blank | Hazleton | Explicit no-matches response |
| Blank | Hazelton | 10 returned rows; none names Alfred or Myrtle |
| Myrtle | Smith | 12 returned rows; no spouse named Alfred or surnamed Hazleton/Hazelton |

The Hazelton rows name Acie E., Donald E., Eugene, Fred Kimball, Hazel, J. Virgil, James H., Lee M. H., Mary Jane, and William Earl. These people are not established relatives and were not added to the family ledger.

The Myrtle Smith rows pair the bride with F. M. Basken, William L. Bailey, Homer Peacock, W. C. Anderson, Warren Ramsey, Walter C. Stone, Richard Wiederstein, Harold Baker, Charley H. Johnson, Paul D. Drawver, Noll Roscoe Kittrell, or Robert Park Burns. No row establishes the target marriage. These results do not exclude an earlier marriage, a different surname spelling, or a marriage outside the collection.

OHS describes Oklahoma County coverage as 1889–1951 alongside several other collections. This is not a comprehensive statewide marriage search. No original marriage certificate was obtained.

## New obituary lead: Myrtle Hazelton

The [Tulsa City-County Library death-notice index](https://www.tulsalibrary.org/research/death-notices-index?page=952) contains a row for **Myrtle Hazelton**, **July 14, 1977**, **Tulsa World**. Python retrieved and parsed the full index page, confirming the search-engine lead.

The date is a newspaper notice date, not an established death date. The row supplies no spouse or children. It cannot yet be assigned to Jared's mother. Do not add a 1977 death event to Myrtle's record from this index alone.

**Next specific document:** the Tulsa World notice dated July 14, 1977. Inspect for Alfred, Jared, Susan/Swingen, or Smith/Goode relatives. Matching relatives would be much stronger evidence than name and state alone. No request has been sent to the library and no paid access has been purchased.

## Census and newspaper access outcomes

- Gateway queries for quoted Jared Hazleton, Jared Hazelton, Alfred Hazelton, and Myrtle Hazleton returned request-verification pages rather than search results. HTTP 200 did not mean the search succeeded. No article or negative-search conclusion was extracted.
- FamilySearch's Jared Hazleton record search returned a JavaScript-required shell. No census record was retrieved. No claim is made that the 1940 or 1950 household was searched successfully.
- Web searches for Jared with census/year terms did not identify a usable household record in the inspected results.

The script now recognizes these response types and stops further same-host queries after a verification page or HTTP 403/429. The first capture batch preceded that refinement; its manifest has been reviewed and annotated accordingly.

## What this changes

The marriage search is now documented against actual index tables, and there is a concrete obituary issue to locate. The direct ancestral chain remains unchanged. Next work should obtain that notice and use an interactive census search to identify the 1940/1950 household. Record the enumeration district, sheet, household, and image citation before accepting a census match.
