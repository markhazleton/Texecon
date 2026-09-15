"""Download this shared album and generate a self-contained local catalog."""
import concurrent.futures
import datetime
import hashlib
import html
import json
from pathlib import Path
import urllib.request
from PIL import Image

ROOT = Path(__file__).resolve().parent
SOURCE = 'https://photomyne.com/share?u=E21C14BE-5AFB-4D2F-ACBC-CC52056DBF4A&s=21518768-f26d-4229-91db-c83b6cdc053d_sub'


def main():
    captured = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with urllib.request.urlopen(SOURCE.replace('/share?', '/share/api/photos?') + '&offset=0&limit=40', timeout=60) as response:
        data = json.load(response)
    assert data['total'] == len(data['photos']) and not data['has_more'], 'Album requires additional pages'
    (ROOT / 'images').mkdir(exist_ok=True)

    def download(pair):
        index, photo = pair
        record = {key: value.split('?')[0] if isinstance(value, str) and key.endswith('url') else value for key, value in photo.items()}
        record['number'] = index
        record['files'] = []
        for field, suffix in [('url', ''), ('back_url', '-back')]:
            if not photo.get(field):
                continue
            relative = f'images/{index:03}{suffix}.jpg'
            path = ROOT / relative
            with urllib.request.urlopen(photo[field], timeout=90) as response:
                content = response.read()
            path.write_bytes(content)
            with Image.open(path) as img:
                img.load()
                width, height = img.size
                image_format = img.format
            record['files'].append(dict(path=relative, bytes=len(content), sha256=hashlib.sha256(content).hexdigest(), width=width, height=height, format=image_format))
            record[field] = relative
        for field in ('url', 'thumb_url', 'thumb2_url'):
            if record.get(field):
                record[field] = record['files'][0]['path']
        return record

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        records = list(pool.map(download, enumerate(data['photos'], 1)))
    # Preserve every source field, but omit temporary signed URL query credentials.
    data['photos'] = [{key: value.split('?')[0] if isinstance(value, str) and key.endswith('url') else value for key, value in p.items()} for p in data['photos']]
    for index, photo in enumerate(data['photos'], 1):
        local_path = f'images/{index:03}.jpg'
        for field in ('url', 'thumb_url', 'thumb2_url'):
            if photo.get(field):
                photo[field] = local_path
    (ROOT / 'source/photos-000.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    manifest = dict(title='Smith History Photos', source_url=SOURCE, retrieved_at=captured, count=len(records), photos=records)
    (ROOT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    markdown = ['# Smith History Photos — caption catalog', '', f'Source: {SOURCE}', '', 'Captions below are verbatim album metadata, not independently verified genealogy. Blank captions are identified explicitly. Photo numbers preserve the shared album order.', '']
    cards = []
    for p in records:
        title = p.get('title') or '[No caption supplied]'
        markdown += [f'## Photo {p["number"]:03}', '', f'[Open image]({p["files"][0]["path"]})', '', *['> ' + line for line in title.split('\n')], '']
        if p.get('year'):
            markdown += [f'Source date fields: year={p["year"]}, month={p.get("month")}, day={p.get("day")}. These are metadata values, not a verified date of photography.', '']
        picture = p['files'][0]
        cards.append(f'<article><h2>Photo {p["number"]:03}</h2><a href="{picture["path"]}"><img loading="lazy" src="{picture["path"]}" alt="Photo {p["number"]:03}"></a><p>{html.escape(title)}</p><small>{picture["width"]} × {picture["height"]}</small></article>')
    (ROOT / 'catalog.md').write_text('\n'.join(markdown), encoding='utf-8')
    page = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Smith History Photos</title><style>body{font:17px system-ui;margin:2rem;background:#f5f2ea;color:#27241f}input{padding:.8rem;width:min(90%,40rem)}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;margin-top:2rem}article{background:white;padding:1rem;border-radius:8px}img{width:100%;height:300px;object-fit:contain}p{white-space:pre-wrap}h2{font-size:1rem}</style><h1>Smith History Photos</h1><p>39 photos. Original album captions; historical claims have not been independently verified. Click a photo to open its full-size file.</p><label>Search captions <input id="search" type="search"></label><main>' + ''.join(cards) + '</main><script>document.getElementById("search").addEventListener("input",e=>{const q=e.target.value.toLowerCase();document.querySelectorAll("article").forEach(a=>a.hidden=!a.textContent.toLowerCase().includes(q))})</script></html>'
    (ROOT / 'index.html').write_text(page, encoding='utf-8')
    print(json.dumps(dict(photos=len(records), files=sum(len(p['files']) for p in records), bytes=sum(f['bytes'] for p in records for f in p['files']), captions=sum(bool(p.get('title')) for p in records))))


if __name__ == '__main__':
    main()
