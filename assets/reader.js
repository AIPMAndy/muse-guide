(()=>{'use strict';
const $=id=>document.getElementById(id);
const element=(tag,txt)=>{const e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;return e;};
let timer;function toast(msg){const e=$('toast');e.textContent=msg;e.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>e.classList.remove('show'),2300);}
async function copy(s){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(s);}else{const t=element('textarea');t.value=s;t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();if(!ok)throw Error('no clipboard');}toast('微信号 AIPMAndy 已复制');}catch(_){window.prompt('手动复制：',s);}}
document.querySelectorAll('[data-wechat]').forEach(x=>x.addEventListener('click',()=>copy('AIPMAndy')));
function inline(node,s){
 const re=/(\*\*[^*]+\*\*|\x60[^\x60]+\x60|\[[^\]]+\]\([^)]+\))/g;let last=0;
 for(const m of s.matchAll(re)){const p=m.index;if(p>last)node.append(document.createTextNode(s.slice(last,p)));
 const v=m[0];if(v.startsWith('**'))node.append(element('strong',v.slice(2,-2)));
 else if(v.startsWith('\x60'))node.append(element('code',v.slice(1,-1)));
 else{const a=v.match(/^\[([^\]]+)\]\(([^)]+)\)$/);if(a){const href=a[2];if(/^(https:\/\/|\.\.\/|[a-z0-9][a-z0-9./#-]*$)/i.test(href)&&!href.startsWith('//')){const x=element('a',a[1]);x.href=href;if(href.startsWith('https://')){x.target='_blank';x.rel='noopener noreferrer';}node.append(x);}else node.append(document.createTextNode(a[1]));}}
 last=p+v.length;}
 if(last<s.length)node.append(document.createTextNode(s.slice(last)));
}
function renderMarkdown(str){
 const root=document.createDocumentFragment();const lines=str.replace(/\r/g,'').split('\n');let list=null,kind='',pre=null;
 const flush=()=>{list=null;kind='';};
 for(const raw of lines){const line=raw.trim();
 if(line.startsWith('\x60\x60\x60')){flush();if(pre){root.append(pre);pre=null;}else{pre=element('pre');pre.append(element('code',''));}continue;}
 if(pre){pre.firstChild.textContent+=raw+'\n';continue;}
 if(!line){flush();continue;}
 if(/^---+$/.test(line)){flush();root.append(element('hr'));continue;}
 const heading=line.match(/^(#{1,4})\s+(.+)$/);if(heading){flush();const h=element('h'+Math.min(heading[1].length,4));inline(h,heading[2]);root.append(h);continue;}
 const block=line.match(/^>\s?(.+)$/);if(block){flush();const b=element('blockquote');inline(b,block[1]);root.append(b);continue;}
 const bullet=line.match(/^(-|\d+\.)\s+(.*)$/);
 if(bullet){const newkind=bullet[1]==='-'?'ul':'ol';if(!list||newkind!==kind){list=element(newkind);root.append(list);kind=newkind;}
 const li=element('li');inline(li,bullet[2]);list.append(li);continue;}
 flush();const p=element('p');inline(p,line);root.append(p);
 }
 if(pre)root.append(pre);
 return root;
}
fetch('data/library.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('目录HTTP '+r.status);return r.json();}).then(async d=>{
 const chapters=d.chapters;const u=new URL(location.href);const slug=u.searchParams.get('chapter')||chapters[0].slug;let index=chapters.findIndex(c=>c.slug===slug);if(index<0)index=0;
 const current=chapters[index];document.title=current.title+' | Muse Atlas';$('reader-title').textContent=current.title;
 $('github-source').href='https://github.com/AIPMAndy/muse-guide/blob/main/'+current.url;
 $('reader-nav').replaceChildren(...chapters.map(c=>{const a=element('a',String(c.n).padStart(2,'0')+'　'+c.title);a.href='read.html?chapter='+encodeURIComponent(c.slug);if(c.slug===current.slug){a.classList.add('active');a.setAttribute('aria-current','page');}return a;}));
 $('chapter-prev').disabled=index===0;$('chapter-next').disabled=index===chapters.length-1;
 $('chapter-prev').addEventListener('click',()=>location.href='read.html?chapter='+chapters[index-1].slug);
 $('chapter-next').addEventListener('click',()=>location.href='read.html?chapter='+chapters[index+1].slug);
 if(!/^guides\/[0-9a-z-]+\.md$/.test(current.url))throw Error('章节路径异常');
 const r=await fetch(current.url,{cache:'no-store'});if(!r.ok)throw Error('章节HTTP '+r.status);
 $('reader-body').replaceChildren(renderMarkdown(await r.text()));
}).catch(err=>{$('reader-body').replaceChildren(element('p','无法加载章节：'+err.message+'。可回到 GitHub 查看 Markdown 源码。'));});
})();