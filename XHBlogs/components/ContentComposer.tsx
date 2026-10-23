"use client";
import { useRef, useState } from 'react';
import type { Album } from '../data/albums';
import '../app/courses/courses.css';
import { withBasePath } from '../sitePath';

export async function readContent<T>(key: string): Promise<T[]> {
  const db = await openContent();
  try { return await new Promise((resolve,reject) => { const r=db.transaction('content').objectStore('content').get(key); r.onsuccess=()=>resolve(r.result || []); r.onerror=()=>reject(new Error('Could not read the content')); }); } finally { db.close(); }
}
async function openContent(): Promise<IDBDatabase> {
  return new Promise((resolve,reject) => { const r=indexedDB.open('xh-page-content',1); r.onupgradeneeded=()=>r.result.createObjectStore('content'); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(new Error('Cannot open the local content store')); });
}
async function writeContent(key:string,value:unknown) {
  const db=await openContent();
  try { await new Promise<void>((resolve,reject)=>{ const tx=db.transaction('content','readwrite'); tx.objectStore('content').put(value,key); tx.oncomplete=()=>resolve(); tx.onabort=()=>reject(new Error('Could not save. Check your browser storage space')); }); } finally { db.close(); }
}
export type LocalPost={slug:string;title:string;date:string;description:string;tags:string[];cover:string;content:string;href:string};
const imageData=(file:File):Promise<string>=>new Promise((resolve,reject)=>{const r=new FileReader(); r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error('Could not read the image'));r.readAsDataURL(file);});
export default function ContentComposer({kind,albums=[],onSaved}:{kind:'photos'|'posts';albums?:Album[];onSaved:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null); const form=useRef<HTMLFormElement>(null);
  const [busy,setBusy]=useState(false); const [notice,setNotice]=useState(''); const [target,setTarget]=useState('new');
  const photos=kind==='photos';
  async function save(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data=new FormData(event.currentTarget); const get=(name:string)=>String(data.get(name)||'').trim();
    const files=(data.getAll('images') as File[]).filter(f=>f.size>0);
    if((photos && !files.length) || files.some(f=>!/^image\/(png|jpeg|webp|gif|avif)$/.test(f.type))) {setNotice('Choose a PNG, JPEG, WebP, GIF or AVIF image.');return;}
    if(files.some(f=>f.size>10*1024*1024)||files.reduce((n,f)=>n+f.size,0)>50*1024*1024){setNotice('Each image must be 10 MB or less, 50 MB in total per upload.');return;}
    setBusy(true);setNotice('Saving…');
    try {
      const urls=await Promise.all(files.map(imageData));
      if(photos){
        const saved=await readContent<Album>('albums'); const existing=albums.find(a=>a.id===target);
        if(target!=='new'&&!existing)throw new Error('That album no longer exists. Pick another one.');
        if(!existing&&!get('title'))throw new Error('Enter an album name.');
        const album:Album={id:existing?.id||crypto.randomUUID(),title:existing?.title||get('title'),description:existing?.description||get('description'),date:existing?.date||get('date'),cover:existing?.cover||urls[0],photos:[...(existing?.photos||[]),...urls.map((url,i)=>({url,caption:get('caption')||files[i].name}))]};
        await writeContent('albums',[album,...saved.filter(a=>a.id!==album.id)]);
      }else{
        if(!get('title')||!get('content'))throw new Error('Enter a title and body text.');
        const slug=crypto.randomUUID();const post:LocalPost={slug,title:get('title'),date:get('date'),description:get('description')||get('content').slice(0,100),tags:get('tags').split(/[,，]/).map(s=>s.trim()).filter(Boolean),cover:urls[0]||withBasePath('/covers/notes.webp'),content:get('content'),href:`/local-posts?id=${slug}`};
        if(!post.tags.length)post.tags=['Uncategorized'];
        await writeContent('posts',[post,...await readContent<LocalPost>('posts')]);
      }
      onSaved();dialog.current?.close();setNotice('Saved. It will still be here after a refresh.');
    }catch(error){setNotice(error instanceof Error?error.message:'Save failed');}finally{setBusy(false);}
  }
  return <div style={{margin:'20px 0'}}><div className="cover-actions"><button className="cover-primary" onClick={()=>{form.current?.reset();setTarget('new');setNotice('');dialog.current?.showModal();}}>＋ {photos?'Add photos':'Add draft'}</button></div><p role="status" className="course-notice">{notice||'New content is saved in this browser only — no GitHub needed. It does not sync across devices yet.'}</p>
    <dialog ref={dialog} className="cover-dialog" aria-label={photos?'Add photos':'Add draft'} onCancel={e=>{if(busy)e.preventDefault();}}><div className="cover-dialog-head"><h2>{photos?'Add photos':'Add draft'}</h2><button disabled={busy} aria-label="Close the add dialog" onClick={()=>dialog.current?.close()}>✕</button></div><form ref={form} onSubmit={save}>
      {photos&&<label>Target album<select name="album" value={target} onChange={e=>setTarget(e.target.value)} style={{display:'block',padding:10,width:'100%'}}><option value="new">New album</option>{albums.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}</select></label>}
      {(!photos||target==='new')&&<><label>{photos?'Album name':'Draft title'}<input name="title" required maxLength={150}/></label><label>{photos?'Album description':'Summary'}<textarea name="description" rows={2} maxLength={1000}/></label><label>Date<input name="date" type="date" required defaultValue={new Date().toLocaleDateString('en-CA')}/></label></>}
      {!photos&&<><label>Tags<input name="tags" placeholder="e.g. study notes, programming" maxLength={200}/></label><label>Draft body<textarea name="content" required rows={9} maxLength={100000} placeholder="Write the full content here…"/></label></>}
      {photos&&<label>Photo caption<input name="caption" maxLength={300} placeholder="Uses the file name if left blank"/></label>}
      <label>{photos?'Choose photos (multiple allowed)':'Cover image (optional)'}<input name="images" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" multiple={photos} required={photos}/></label><p className="course-notice">Each image must be 10 MB or less, 50 MB in total per upload. Keep your original files.</p><p role="status">{notice}</p><div className="cover-actions"><button type="button" disabled={busy} onClick={()=>dialog.current?.close()}>Cancel</button><button type="submit" disabled={busy} className="cover-primary">{busy?'Saving…':'Save'}</button></div>
    </form></dialog></div>;
}
