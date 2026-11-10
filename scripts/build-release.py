#!/usr/bin/env python3
"""Build audited lightweight/full skill ZIPs from explicit shipped folders."""
from pathlib import Path
import hashlib, json, re, zipfile
ROOT=Path(__file__).resolve().parents[1]
SKILL=ROOT/'skills/lrh-packaging-plugin'
DIST=ROOT/'dist'
lock=json.loads((SKILL/'runtime.lock.json').read_text())
archive=DIST/lock['archive']
previews=['v6-presenter-reframe-demo.mp4','v6-workflow-merge-demo.mp4','v6-result-takeover-demo.mp4']
for name in previews:
    if not (DIST/name).is_file(): raise SystemExit('Render the public synthetic preview into dist/: '+name)
if not archive.exists(): raise SystemExit('Place the verified runtime archive in dist/ first.')
data=archive.read_bytes()
if len(data)!=lock['bytes'] or hashlib.sha256(data).hexdigest()!=lock['sha256']:
    raise SystemExit('Runtime checksum mismatch.')
files=[]
for p in sorted(SKILL.rglob('*')):
    if p.is_symlink(): raise SystemExit('Symlink rejected: '+str(p))
    if not p.is_file(): continue
    rel=p.relative_to(SKILL)
    if any(x.startswith('.') or x in ('node_modules','__pycache__') for x in rel.parts):
        raise SystemExit('Unshipped/private path: '+str(rel))
    if p.suffix in ('.md','.mjs','.js','.html','.yaml','.json'):
        text=p.read_text()
        if re.search(r'/(?:Users|home)/[^/\s]+/|[A-Za-z]:\\Users\\|-----BEGIN .*PRIVATE KEY|ghp_[A-Za-z0-9]{20,}|sk-proj-[A-Za-z0-9_-]{20,}',text):
            raise SystemExit('Private data signature in '+str(rel))
    files.append(p)
for full in (False,True):
    name='lrh-packaging-plugin-v1.2.0'+('-full' if full else '')+'.zip'
    with zipfile.ZipFile(DIST/name,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for p in files: z.write(p,'lrh-packaging-plugin/'+p.relative_to(SKILL).as_posix())
        if full: z.write(archive,'lrh-packaging-plugin/assets/'+archive.name,compress_type=zipfile.ZIP_STORED)
        if full:
            for preview in previews:
                z.write(DIST/preview,'lrh-packaging-plugin/examples/'+preview,compress_type=zipfile.ZIP_STORED)
        z.writestr('lrh-packaging-plugin/RELEASE-NOTES.txt','v1.2.0: actual V6 modules, configurable media/text/captions/framing, native 60fps renderer, independently licensed Agent Motion source.\nRead references/runtime.md before running setup. Dependencies still require network.\n')
    print(name,(DIST/name).stat().st_size)
names=['lrh-packaging-plugin-v1.2.0.zip','lrh-packaging-plugin-v1.2.0-full.zip',archive.name]+previews
(DIST/'SHA256SUMS.txt').write_text(''.join(hashlib.sha256((DIST/n).read_bytes()).hexdigest()+'  '+n+'\n' for n in names))
print('Audited',len(files),'Skill files. No private media, credentials or absolute author paths included.')
