"use client";
import {useEffect,useState} from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import {readContent,LocalPost} from '../../components/ContentComposer';
export default function LocalPostPage(){
 const [post,setPost]=useState<LocalPost|null>(null);const [notice,setNotice]=useState('正在读取归档…');
 useEffect(()=>{const id=new URLSearchParams(window.location.search).get('id');readContent<LocalPost>('posts').then(posts=>{const item=posts.find(p=>p.slug===id);if(item)setPost(item);else setNotice('此归档不在当前浏览器中，或已被清理。');}).catch(()=>setNotice('无法读取归档，请检查浏览器存储设置。'));},[]);
 return <><Navbar/><main className="course-shell"><Link href="/timeline">← 返回归档</Link>{post?<article className="course-panel" style={{marginTop:20}}><img loading="lazy" decoding="async" src={post.cover} alt="归档封面" style={{width:'100%',maxHeight:320,objectFit:'cover',borderRadius:18}}/><h1 style={{fontSize:32,fontWeight:800,margin:'24px 0'}}>{post.title}</h1><p>{post.date} · {post.tags.join(' / ')}</p><div style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',lineHeight:1.9,marginTop:28}}>{post.content}</div></article>:<p role="status">{notice}</p>}</main></>;
}
