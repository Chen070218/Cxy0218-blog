"use client";
import { useRef, useState } from 'react';
import type { Album } from '../data/albums';
import '../app/courses/courses.css';
import { withBasePath } from '../sitePath';

export async function readContent<T>(key: string): Promise<T[]> {
  const db = await openContent();
  try { return await new Promise((resolve,reject) => { const r=db.transaction('content').objectStore('content').get(key); r.onsuccess=()=>resolve(r.result || []); r.onerror=()=>reject(new Error('读取失败')); }); } finally { db.close(); }
}
async function openContent(): Promise<IDBDatabase> {
  return new Promise((resolve,reject) => { const r=indexedDB.open('xh-page-content',1); r.onupgradeneeded=()=>r.result.createObjectStore('content'); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(new Error('无法打开本地内容库')); });
}
async function writeContent(key:string,value:unknown) {
  const db=await openContent();
  try { await new Promise<void>((resolve,reject)=>{ const tx=db.transaction('content','readwrite'); tx.objectStore('content').put(value,key); tx.oncomplete=()=>resolve(); tx.onabort=()=>reject(new Error('保存失败，请检查浏览器存储空间')); }); } finally { db.close(); }
}
export type LocalPost={slug:string;title:string;date:string;description:string;tags:string[];cover:string;content:string;href:string};
const imageData=(file:File):Promise<string>=>new Promise((resolve,reject)=>{const r=new FileReader(); r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error('图片读取失败'));r.readAsDataURL(file);});
export default function ContentComposer({kind,albums=[],onSaved}:{kind:'photos'|'posts';albums?:Album[];onSaved:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null); const form=useRef<HTMLFormElement>(null);
  const [busy,setBusy]=useState(false); const [notice,setNotice]=useState(''); const [target,setTarget]=useState('new');
  const photos=kind==='photos';
  async function save(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data=new FormData(event.currentTarget); const get=(name:string)=>String(data.get(name)||'').trim();
    const files=(data.getAll('images') as File[]).filter(f=>f.size>0);
    if((photos && !files.length) || files.some(f=>!/^image\/(png|jpeg|webp|gif|avif)$/.test(f.type))) {setNotice('请选择 PNG、JPEG、WebP、GIF 或 AVIF 图片。');return;}
    if(files.some(f=>f.size>10*1024*1024)||files.reduce((n,f)=>n+f.size,0)>50*1024*1024){setNotice('单张图片不超过 10 MB，每次合计不超过 50 MB。');return;}
    setBusy(true);setNotice('正在保存…');
    try {
      const urls=await Promise.all(files.map(imageData));
      if(photos){
        const saved=await readContent<Album>('albums'); const existing=albums.find(a=>a.id===target);
        if(target!=='new'&&!existing)throw new Error('相册已不存在，请重新选择。');
        if(!existing&&!get('title'))throw new Error('请填写相册名称。');
        const album:Album={id:existing?.id||crypto.randomUUID(),title:existing?.title||get('title'),description:existing?.description||get('description'),date:existing?.date||get('date'),cover:existing?.cover||urls[0],photos:[...(existing?.photos||[]),...urls.map((url,i)=>({url,caption:get('caption')||files[i].name}))]};
        await writeContent('albums',[album,...saved.filter(a=>a.id!==album.id)]);
      }else{
        if(!get('title')||!get('content'))throw new Error('请填写标题与正文。');
        const slug=crypto.randomUUID();const post:LocalPost={slug,title:get('title'),date:get('date'),description:get('description')||get('content').slice(0,100),tags:get('tags').split(/[,，]/).map(s=>s.trim()).filter(Boolean),cover:urls[0]||withBasePath('/covers/notes.jpg'),content:get('content'),href:`/local-posts?id=${slug}`};
        if(!post.tags.length)post.tags=['未分类'];
        await writeContent('posts',[post,...await readContent<LocalPost>('posts')]);
      }
      onSaved();dialog.current?.close();setNotice('已保存，刷新页面仍会保留。');
    }catch(error){setNotice(error instanceof Error?error.message:'保存失败');}finally{setBusy(false);}
  }
  return <div style={{margin:'20px 0'}}><div className="cover-actions"><button className="cover-primary" onClick={()=>{form.current?.reset();setTarget('new');setNotice('');dialog.current?.showModal();}}>＋ {photos?'添加照片':'添加归档'}</button></div><p role="status" className="course-notice">{notice||'新增内容保存在当前浏览器，无需 GitHub；暂不跨设备同步。'}</p>
    <dialog ref={dialog} className="cover-dialog" aria-label={photos?'添加照片':'添加归档'} onCancel={e=>{if(busy)e.preventDefault();}}><div className="cover-dialog-head"><h2>{photos?'添加照片':'添加归档'}</h2><button disabled={busy} aria-label="关闭添加窗口" onClick={()=>dialog.current?.close()}>✕</button></div><form ref={form} onSubmit={save}>
      {photos&&<label>目标相册<select name="album" value={target} onChange={e=>setTarget(e.target.value)} style={{display:'block',padding:10,width:'100%'}}><option value="new">新建相册</option>{albums.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}</select></label>}
      {(!photos||target==='new')&&<><label>{photos?'相册名称':'归档标题'}<input name="title" required maxLength={150}/></label><label>{photos?'相册描述':'内容摘要'}<textarea name="description" rows={2} maxLength={1000}/></label><label>日期<input name="date" type="date" required defaultValue={new Date().toLocaleDateString('en-CA')}/></label></>}
      {!photos&&<><label>分类标签<input name="tags" placeholder="例如：学习笔记，编程" maxLength={200}/></label><label>归档正文<textarea name="content" required rows={9} maxLength={100000} placeholder="在这里写下完整内容…"/></label></>}
      {photos&&<label>照片说明<input name="caption" maxLength={300} placeholder="不填写时使用文件名"/></label>}
      <label>{photos?'选择照片（可多选）':'封面图片（可选）'}<input name="images" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" multiple={photos} required={photos}/></label><p className="course-notice">单张图片不超过 10 MB，每次合计不超过 50 MB。请保留原始材料。</p><p role="status">{notice}</p><div className="cover-actions"><button type="button" disabled={busy} onClick={()=>dialog.current?.close()}>取消</button><button type="submit" disabled={busy} className="cover-primary">{busy?'正在保存…':'保存'}</button></div>
    </form></dialog></div>;
}
