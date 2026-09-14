"""Capture public research responses without treating search hits as relatives.

Uses requests and BeautifulSoup. Stops requests to a host after 403/429.
Each run has its own timestamped folder; family claims are never auto-updated.
"""
import datetime
import hashlib
import json
from pathlib import Path
from urllib.parse import urlencode, urlparse

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent


def main():
    stamp = datetime.datetime.now(datetime.timezone.utc)
    out = ROOT / 'search-results' / stamp.strftime('%Y%m%dT%H%M%SZ')
    out.mkdir(parents=True)
    jobs = []
    for first, last in [('', 'Hazleton'), ('', 'Hazelton'), ('Myrtle', 'Smith')]:
        jobs.append(('ohs-' + (first or 'all') + '-' + last,
                     'https://www.okhistory.org/research/marrresults?' + urlencode(dict(fname=first, lname=last, year='', action='Search'))))
    for name in ['Jared Hazleton', 'Jared Hazelton', 'Alfred Hazelton', 'Myrtle Hazleton']:
        jobs.append(('gateway-' + name.replace(' ', '-'),
                     'https://gateway.okhistory.org/search/?' + urlencode(dict(q='"' + name + '"', t='fulltext'))))
    jobs.append(('tulsa-myrtle-index', 'https://www.tulsalibrary.org/research/death-notices-index?page=952'))
    jobs.append(('familysearch-jared', 'https://www.familysearch.org/search/record/results?' + urlencode(dict(q='givenname:Jared surname:Hazleton birth_year:1937 birth_place:Oklahoma'))))
    results = []
    blocked = set()
    session = requests.Session()
    session.headers['User-Agent'] = 'FamilyHistoryResearch/1.0 (personal archival research)'
    for name, url in jobs:
        host = urlparse(url).netloc
        row = dict(id=name, url=url, retrieved_at=datetime.datetime.now(datetime.timezone.utc).isoformat())
        if host in blocked:
            row['status'] = 'not_attempted_host_access_limit'
            results.append(row)
            continue
        try:
            response = session.get(url, timeout=35)
            row.update(http_status=response.status_code, final_url=response.url)
            if response.status_code in (403, 429):
                blocked.add(host)
                row['status'] = 'access_limited'
            elif not response.ok:
                row['status'] = 'http_error'
            else:
                row['status'] = 'retrieved_requires_review'
                (out / (name + '.html')).write_bytes(response.content)
                row['sha256'] = hashlib.sha256(response.content).hexdigest()
                soup = BeautifulSoup(response.content, 'html.parser')
                for tag in soup(['script', 'style', 'nav', 'header', 'footer']):
                    tag.decompose()
                text = soup.get_text('\n', strip=True)
                if 'Validating your request' in text:
                    row['status'] = 'verification_page_not_results'
                    blocked.add(host)
                elif 'JavaScript is required to use FamilySearch' in text:
                    row['status'] = 'javascript_shell_not_results'
                (out / (name + '.txt')).write_text(text, encoding='utf-8')
                row['text_file'] = name + '.txt'
                row['links'] = [{'text': a.get_text(' ', strip=True), 'href': a['href']} for a in soup.select('a[href]') if '/ark:' in a['href'] or '/ark%3A' in a['href']]
                lines = text.splitlines()
                row['candidate_excerpts'] = [' | '.join(lines[max(0,i-2):i+6]) for i,l in enumerate(lines) if any(x in l.lower() for x in ['hazleton','hazelton','no matches','no results'])][:25]
        except requests.RequestException as exc:
            row.update(status='request_error', error=str(exc))
        results.append(row)
        print(name, row['status'], row.get('candidate_excerpts', [])[:6], flush=True)
    (out / 'manifest.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Saved', out)


if __name__ == '__main__':
    main()
