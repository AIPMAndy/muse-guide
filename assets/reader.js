(()=>{'use strict';
const $=id=>document.getElementById(id);
const element=(tag,txt)=>{const e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;return e;};
let timer;function toast(msg){const e=$('toast');e.textContent=msg;e.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>e.classList.remove('show'),2300);}
async function copy(s){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(s);}else{const t=element('textarea');t.value=s;t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();if(!ok)throw Error('no clipboard');}toast('微信号 AIPMAndy 已复制');}catch(_){window.prompt('手动复制：',s);}}
document.querySelectorAll('[data-wechat]').forEach(x=>x.addEventListener('click',()=>copy('AIPMAndy')));
let currentDocUrl='guides/01-get-started.md';let knownSlugs=new Set();
function inline(node,s){
 const re=/(\*\*[^*]+\*\*|\x60[^\x60]+\x60|\[[^\]]+\]\([^)]+\))/g;let last=0;
 for(const m of s.matchAll(re)){const p=m.index;if(p>last)node.append(document.createTextNode(s.slice(last,p)));
 const v=m[0];if(v.startsWith('**'))node.append(element('strong',v.slice(2,-2)));
 else if(v.startsWith('\x60'))node.append(element('code',v.slice(1,-1)));
 else{const a=v.match(/^\[([^\]]+)\]\(([^)]+)\)$/);if(a){const href=a[2];if(/^(https:\/\/|\.\.\/|[a-z0-9][a-z0-9./#-]*$)/i.test(href)&&!href.startsWith('//')){const x=element('a',a[1]);let finalHref=href;
if(!href.startsWith('https://')){const resolved=new URL(href,new URL(currentDocUrl,location.href));
 const page=resolved.pathname.match(/\/guides\/([a-z0-9-]+)\.md$/);
 if(page&&knownSlugs.has(page[1]))finalHref='read.html?chapter='+encodeURIComponent(page[1]);
 else if(resolved.pathname.includes('/docs/')&&resolved.pathname.endsWith('.md')){const part=resolved.pathname.split('/docs/')[1];finalHref='https://github.com/AIPMAndy/muse-guide/blob/main/docs/'+part;}
 else finalHref=resolved.href;
}
x.href=finalHref;if(finalHref.startsWith('https://')&&!finalHref.startsWith(location.origin)){x.target='_blank';x.rel='noopener noreferrer';}node.append(x);}else node.append(document.createTextNode(a[1]));}}
 last=p+v.length;}
 if(last<s.length)node.append(document.createTextNode(s.slice(last)));
}
function renderMarkdown(str){
 const root=document.createDocumentFragment();
 const lines=str.replace(/\r/g,'').split('\n');
 let listStack=[],paragraph=null,codeBlock=null,quote=null;
 const closeParagraph=()=>{paragraph=null;quote=null;};
 const closeLists=()=>{listStack=[];};
 const isSeparator=s=>/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(s.trim());
 const cells=s=>s.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(x=>x.trim());
 for(let i=0;i<lines.length;i++){
  const raw=lines[i],line=raw.trim();
  if(line.startsWith(String.fromCharCode(96,96,96))){
   closeParagraph();closeLists();
   if(codeBlock){root.append(codeBlock);codeBlock=null;}
   else{codeBlock=document.createElement('pre');codeBlock.append(document.createElement('code'));}
   continue;
  }
  if(codeBlock){codeBlock.firstChild.append(document.createTextNode(raw+'\n'));continue;}
  if(!line){closeParagraph();closeLists();continue;}
  if(line.startsWith('|')&&i+1<lines.length&&isSeparator(lines[i+1])){
   closeParagraph();closeLists();
   const headings=cells(line);const table=document.createElement('table');
   const thead=document.createElement('thead'),headrow=document.createElement('tr');
   headings.forEach(h=>{const th=document.createElement('th');inline(th,h);headrow.append(th);});
   thead.append(headrow);table.append(thead);
   const tbody=document.createElement('tbody');i+=2;
   while(i<lines.length&&lines[i].trim().startsWith('|')){
    const tr=document.createElement('tr');const rowcells=cells(lines[i]);
    headings.forEach((h,k)=>{const td=document.createElement('td');inline(td,rowcells[k]||'');tr.append(td);});
    tbody.append(tr);i++;
   }
   table.append(tbody);root.append(table);i--;continue;
  }
  if(/^---+$/.test(line)){closeParagraph();closeLists();root.append(document.createElement('hr'));continue;}
  const heading=line.match(/^(#{1,4})\s+(.+)$/);
  if(heading){closeParagraph();closeLists();const h=document.createElement('h'+heading[1].length);inline(h,heading[2]);root.append(h);continue;}
  const block=line.match(/^>\s?(.*)$/);
  if(block){closeLists();paragraph=null;
   if(!quote){quote=document.createElement('blockquote');root.append(quote);}
   const p=document.createElement('p');inline(p,block[1]);quote.append(p);continue;
  }
  const bullet=raw.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
  if(bullet){
   closeParagraph();
   const indent=bullet[1].length;
   const kind=/^\d/.test(bullet[2])?'ol':'ul';
   while(listStack.length && (listStack[listStack.length-1].indent>indent || (listStack[listStack.length-1].indent===indent&&listStack[listStack.length-1].kind!==kind)))listStack.pop();
   if(!listStack.length||listStack[listStack.length-1].indent<indent){
    const next=document.createElement(kind);
    if(listStack.length){const parent=listStack[listStack.length-1].last;
      if(parent)parent.append(next);else root.append(next);
    }else root.append(next);
    listStack.push({indent,kind,node:next,last:null});
   }
   const li=document.createElement('li');
   const value=bullet[3],task=value.match(/^\[([ xX])\]\s+(.*)$/);
   if(task){const box=document.createElement('input');box.type='checkbox';box.checked=task[1].toLowerCase()==='x';box.disabled=true;box.setAttribute('aria-label','文档参考检查项');li.append(box);inline(li,task[2]);}
   else inline(li,value);
   const current=listStack[listStack.length-1];current.node.append(li);current.last=li;
   continue;
  }
  closeLists();quote=null;
  if(!paragraph){paragraph=document.createElement('p');root.append(paragraph);}
  else paragraph.append(document.createTextNode(' '));
  inline(paragraph,line);
 }
 if(codeBlock)root.append(codeBlock);
 return root;
}

fetch('data/library.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('目录HTTP '+r.status);return r.json();}).then(async d=>{
 const chapters=d.chapters;knownSlugs=new Set(chapters.map(x=>x.slug));const u=new URL(location.href);const slug=u.searchParams.get('chapter')||chapters[0].slug;let index=chapters.findIndex(c=>c.slug===slug);if(index<0)index=0;
 const current=chapters[index];currentDocUrl=current.url;document.title=current.title+' | Muse Atlas';$('reader-title').textContent=current.title;
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