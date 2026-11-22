#!/usr/bin/env python3
"""Verify actual deployed bytes, not just build or deployment status."""
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError
from hashlib import sha256
from time import sleep
import json
import sys

ROOT=Path(__file__).resolve().parents[1]
BASE="https://aipmandy.github.io/muse-guide/"
FILES=[
 "index.html","sources.html","data/library.json",
 "robots.txt","sitemap.xml","pdf/muse-guide-guide.pdf"
]
ED=json.loads((ROOT/"pdf/edition.json").read_text(encoding="utf-8"))
pdf=(ROOT/ED["pdf_path"]).read_bytes()
if sha256(pdf).hexdigest()!=ED["sha256"]:
 raise SystemExit("FAIL: historic PDF checksum does not match published edition")
if len(pdf)!=ED["bytes"]:
 raise SystemExit("FAIL: historic PDF size does not match published edition")
print("PASS: historical PDF manifest, 171 pages per original edition (not a new manual QA)")
for attempt in range(1,37):
 errors=[]
 for path in FILES:
  local=(ROOT/path).read_bytes()
  expected=sha256(local).hexdigest()
  try:
   req=Request(BASE+path+"?deploy_attempt="+str(attempt),headers={"User-Agent":"MuseAtlasLiveVerifier/1.0","Cache-Control":"no-cache"})
   with urlopen(req,timeout=18) as resp:
    status=resp.status
    public=resp.read()
   actual=sha256(public).hexdigest()
   if status!=200 or actual!=expected:
    errors.append(f"{path}: HTTP={status} expected={expected[:12]} actual={actual[:12]}")
  except (HTTPError,URLError,TimeoutError) as exc:
   errors.append(f"{path}: {exc}")
 if not errors:
  for path in FILES: print(f"PASS HTTP 200 SHA-256 {path}: {sha256((ROOT/path).read_bytes()).hexdigest()}")
  print("Live website and PDF byte-for-byte verified at "+BASE)
  sys.exit(0)
 print(f"Attempt {attempt}/36: "+ "; ".join(errors),flush=True)
 if attempt<36:sleep(10)
raise SystemExit("FAIL: GitHub Pages has not published checked-out source bytes")
