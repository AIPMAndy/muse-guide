"""Source workbench contract: no fabricated real-account verification or PDF release."""
import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1]
class Tags(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags=[]
        self.json_ld=[]
        self._in_json=False
    def handle_starttag(self,tag,attrs):
        d=dict(attrs);self.tags.append((tag,d))
        if tag=="script" and d.get("type")=="application/ld+json": self._in_json=True
    def handle_data(self,data):
        if self._in_json:self.json_ld.append(data)
    def handle_endtag(self,tag):
        if tag=="script": self._in_json=False

class SourceReviewContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text=(ROOT/"sources.html").read_text(encoding="utf-8")
        cls.home=(ROOT/"index.html").read_text(encoding="utf-8")
        cls.scan=Tags();cls.scan.feed(cls.text)
        cls.data=json.loads((ROOT/"data/library.json").read_text(encoding="utf-8"))
    def test_authoritative_source_records_unchanged(self):
        rows=self.data["capabilities"]
        self.assertEqual(len(rows),12)
        self.assertTrue(all(row["checked"]=="2026-10-21" for row in rows))
        self.assertTrue(all(row["validation"]=="T 真实账号未实测" for row in rows))
        self.assertTrue(all(urlparse(row["url"]).hostname in ("ai.meta.com","about.fb.com") for row in rows))
    def test_seo_metadata_and_semantically_true_jsonld(self):
        self.assertEqual(len([d for tag,d in self.scan.tags if tag=="h1"]),1)
        canon=[d.get("href") for tag,d in self.scan.tags if tag=="link" and d.get("rel")=="canonical"]
        self.assertEqual(canon,["https://aipmandy.github.io/muse-guide/sources.html"])
        doc=json.loads("".join(self.scan.json_ld))
        self.assertEqual(doc["@type"],"WebApplication")
        self.assertEqual(doc["dateModified"],"2026-11-22")
        self.assertEqual(doc["publisher"]["url"],"https://www.a6no1.cn/")
        for word in ("2026-10-21","T 真实账号未实测","AIPMAndy","pdf/muse-guide-guide.pdf","metaver.vip/services"):
            self.assertIn(word,self.text)
    def test_actual_interactive_features_and_no_customer_upload(self):
        for s in ("fetch('data/library.json'","localStorage","id=\"search\"","id=\"filter\"","id=\"export\"","id=\"clear\"","URL.createObjectURL","aria-live=\"polite\"","document.createElement","navigator.clipboard.writeText"):
            self.assertIn(s,self.text)
        self.assertNotIn("innerHTML",self.text)
        self.assertNotIn("fetch('https://",self.text)
        self.assertNotIn("API Key",self.text)
        self.assertIn("www.a6no1.cn",self.home)
        self.assertIn("sources.html",self.home)
        self.assertIn("pdf/muse-guide-guide.pdf",self.home)
    def test_site_map_contains_both_pages(self):
        sitemap=(ROOT/"sitemap.xml").read_text(encoding="utf-8")
        self.assertIn("/muse-guide/sources.html",sitemap)
        self.assertIn("/muse-guide/</loc>",sitemap)
    def test_pdf_is_original_and_edition_unmodified(self):
        ed=json.loads((ROOT/"pdf/edition.json").read_text(encoding="utf-8"))
        self.assertEqual(ed["pages"],171)
        self.assertEqual(ed["date"],"2026-11-13")
        self.assertEqual(ed["sha256"],"f7e22886c84cfe85c69bb7b87d0f679729041efe98091673b6d168565fd12f4c")
        self.assertTrue((ROOT/ed["pdf_path"]).is_file())
if __name__=="__main__": unittest.main()