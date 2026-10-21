from pathlib import Path
from html.parser import HTMLParser
import json,re,unittest
ROOT=Path(__file__).resolve().parents[1]
class Scan(HTMLParser):
 def __init__(self): super().__init__();self.ids=set();self.refs=[];self.external_scripts=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id' in d: self.ids.add(d['id'])
  for k in ('src','href'):
   if k in d:self.refs.append(d[k])
  if tag=='script' and d.get('src','').startswith(('http:','https:')): self.external_scripts.append(d['src'])
class TestMuseAtlas(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.html=(ROOT/'index.html').read_text(encoding='utf-8')
  cls.js=(ROOT/'assets/site.js').read_text(encoding='utf-8')
  cls.css=(ROOT/'assets/site.css').read_text(encoding='utf-8')
  cls.data=json.loads((ROOT/'data/library.json').read_text(encoding='utf-8'))
  cls.parser=Scan();cls.parser.feed(cls.html)
 def test_site_files(self):
  for p in ['README.md','START-HERE.md','PLAN-30-DAYS.md','.nojekyll','index.html','assets/site.css','assets/site.js','assets/reader.js','assets/reader.css','read.html','assets/cover.svg','assets/favicon.svg','data/library.json','docs/SOURCES.md','docs/SECURITY.md','docs/CHANGELOG.md','.github/workflows/deploy-pages.yml']:
   with self.subTest(path=p):self.assertTrue((ROOT/p).exists(),p)
 def test_paths_and_anchor_targets(self):
  for link in self.parser.refs:
   if link.startswith('#'): self.assertIn(link[1:],self.parser.ids,link)
   elif link.startswith(('https://','http://','mailto:','tel:')): continue
   else: self.assertTrue((ROOT/link.split('#')[0]).is_file(),link)
 def test_card_counts_and_uniqueness(self):
  d=self.data
  self.assertEqual(len(d['chapters']),28)
  self.assertEqual(len(d['prompts']),80)
  self.assertEqual(len(d['workflows']),12)
  self.assertEqual(len(d['checklist']),12)
  self.assertEqual(len(d['faq']),12)
  self.assertEqual(len(set(x['id'] for x in d['prompts'])),len(d['prompts']))
  self.assertEqual(len(set(x['slug'] for x in d['chapters'])),len(d['chapters']))
 def test_chapter_files(self):
  for c in self.data['chapters']:
   p=ROOT/c['url'];self.assertTrue(p.is_file(),p)
   s=p.read_text(encoding='utf-8')
   for word in ['验收清单','任务指令','反证','AIPMAndy','metaver.vip']:
    self.assertIn(word,s,str(p))
   self.assertGreater(len(s),800)
 def test_every_prompt_has_limits(self):
  for p in self.data['prompts']:
   self.assertIn('执行红线',p['body']);self.assertIn('验收',p['body'])
 def test_site_privacy_and_contact(self):
  self.assertGreaterEqual(self.html.count('data-wechat'),3)
  for w in ['metaver.vip','AIPMAndy','非官方','本地']:
   self.assertIn(w,self.html)
  self.assertFalse(self.parser.external_scripts)
  self.assertIn('localStorage',self.js)
  self.assertIn('read.html?chapter=',self.js)
  self.assertNotIn('innerHTML',self.js)
 def test_security_evidence(self):
  for p in ['docs/SECURITY.md','docs/SOURCES.md']:
   s=(ROOT/p).read_text(encoding='utf-8')
   for q in ['theverge.com','apnews.com','research.meta.ai','2026-10-21']:self.assertIn(q,s)
 def test_js_control_references(self):
  ids=set(re.findall(r"\$\('([^']+)'\)",self.js))
  self.assertFalse(ids-self.parser.ids,'Missing DOM IDs: '+','.join(ids-self.parser.ids))
 def test_official_provenance_and_safe_rendering(self):
  from urllib.parse import urlparse
  capabilities=self.data.get('capabilities',[])
  self.assertEqual(len(capabilities),12)
  chapter_slugs={c['slug'] for c in self.data['chapters']}
  for c in capabilities:
   with self.subTest(title=c['title']):
    self.assertIn(urlparse(c['url']).hostname,('ai.meta.com','about.fb.com'))
    self.assertIn(c['chapter'],chapter_slugs)
    self.assertEqual(c['validation'],'T 真实账号未实测')
  render=(ROOT/'assets/reader.js').read_text(encoding='utf-8')
  self.assertIn("document.createElement('table')",render)
  self.assertIn("document.createElement('blockquote')",render)
  self.assertIn("document.createElement('li')",render)
  self.assertNotIn('innerHTML',render)
 def test_release_counts_and_metadata(self):
  home=self.html
  read=(ROOT/'read.html').read_text(encoding='utf-8')
  readme=(ROOT/'README.md').read_text(encoding='utf-8')
  self.assertIn('VERSION 3.0',home)
  for label in ('28 章系统教程','80 条指令','12 套流程'):
   self.assertIn(label,home,label)
  self.assertIn('80 条指令',read)
  self.assertIn('v3.0.0',readme)
  self.assertIn('16 类 × 每类 5 条',readme)
  self.assertIn('https://aipmandy.github.io/muse-guide/',home)
  self.assertTrue((ROOT/'sitemap.xml').is_file())
  self.assertTrue((ROOT/'robots.txt').is_file())
 def test_mobile_breakpoints(self):
  self.assertIn('@media(max-width:540px)',self.css)
  self.assertIn('mobile-contact',self.css)
if __name__=='__main__':unittest.main()
