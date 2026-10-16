"use client";

import { useEffect, useRef, useState } from 'react';
import ConfirmDelete from '../../components/ConfirmDelete';
import LocalFiles, { addLocalFiles, removeLocalFiles } from '../../components/LocalFiles';
import SectionCover from '../../components/SectionCover';
import { withBasePath } from '../../sitePath';

type Resource = { id: string; title: string; url: string; category: string; note: string };

function safeUrl(value: string) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol); } catch { return false; }
}
function validList(value: unknown): value is Resource[] {
  return Array.isArray(value) && value.every(item => item && ['id', 'title', 'url', 'category', 'note'].every(key => typeof item[key] === 'string') && (!item.url || safeUrl(item.url)));
}

export default function ResourceLibrary({ projectMode = false, initialItems = [] }: { projectMode?: boolean; initialItems?: Resource[] }) {
  const storageKey = projectMode ? 'xh-project-folders-v1' : 'xh-study-resources-v1';
  const noun = projectMode ? '项目' : '资料';
  const [busy, setBusy] = useState(false);
  const [fileRevision, setFileRevision] = useState(0);
  const [items, setItems] = useState<Resource[]>(initialItems);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('全部');
  const [editing, setEditing] = useState<Resource | null>(null);
  const [notice, setNotice] = useState('');
  const [deleting, setDeleting] = useState<Resource | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const saved = raw ? JSON.parse(raw) : null;
      // 仓库自带的基础清单 + 本地新增/修改的条目（同 id 以本地为准）：
      // 换设备、清缓存也能看到基础内容，本地加的东西也不会丢。
      const merged = Array.isArray(saved) && validList(saved)
        ? [...initialItems.filter(item => !saved.some((s: Resource) => s.id === item.id)), ...saved]
        : initialItems;
      setItems(merged as Resource[]);
      setReady(true);
    } catch { setNotice('资料读取失败，请检查浏览器存储设置后刷新。'); }
  }, [storageKey]);
  function persist(next: Resource[]) {
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setItems(next); setNotice('已保存在当前浏览器。'); return true; }
    catch { setNotice('保存失败，请检查浏览器存储空间。'); return false; }
  }
  function open(item: Resource | null) {
    setEditing(item); setNotice(''); form.current?.reset(); dialog.current?.showModal();
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) || '').trim();
    if (!value('title') || (value('url') && !safeUrl(value('url')))) { setNotice('请填写名称；如有链接，请使用有效的 http / https 地址。'); return; }
    const item = { id: editing?.id || crypto.randomUUID(), title: value('title'), url: value('url'), category: value('category') || '未分类', note: value('note') };
    const selected = Array.from((event.currentTarget.elements.namedItem('materials') as HTMLInputElement).files || []);
    setBusy(true);
    try {
      await addLocalFiles(`${storageKey}:${item.id}`, selected);
      if (persist(editing ? items.map(old => old.id === item.id ? item : old) : [item, ...items])) {
        setCategory('全部'); setQuery(''); setFileRevision(value => value + 1); dialog.current?.close();
      } else if (!editing) { await removeLocalFiles(`${storageKey}:${item.id}`); }
    } catch(error) { setNotice(error instanceof Error ? error.message : '保存失败'); }
    finally { setBusy(false); }
  }
  async function remove(item: Resource) {
    if (persist(items.filter(old => old.id !== item.id))) {
      setCategory('全部'); setDeleting(null);
      try { await removeLocalFiles(`${storageKey}:${item.id}`); } catch { setNotice('条目已删除，但本地文件清理失败。'); }
    }
  }
  const categories = ['全部', ...Array.from(new Set(items.map(item => item.category)))];
  const shown = items.filter(item => (category === '全部' || item.category === category) && `${item.title} ${item.category} ${item.note}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <main className="course-shell">
    <SectionCover storageKey={projectMode ? "projects" : "resources"} image={projectMode ? withBasePath("/covers/projects.jpg") : withBasePath("/covers/notes.jpg")} eyebrow={projectMode ? "MY PROJECTS / 项目文件夹" : "LEARNING LIBRARY / 学习资料"} title={projectMode ? "把想法，整理成自己的项目" : "让每一次学习，都有迹可循"} subtitle="收纳本地文档、图片、代码和链接，随时下载取回。" />
    <section className="course-panel" aria-label={projectMode ? "项目文件夹" : "学习资料库"}>
      <div className="course-toolbar"><div><h2>{projectMode ? "我的项目" : "我的资料库"} <span className="study-count">{items.length} 份</span></h2><p className="course-notice">按课程或主题分类，随时找回需要的资料。</p></div><div className="cover-actions"><button className="cover-primary" disabled={!ready || busy} onClick={() => open(null)}>＋ 添加{noun}</button></div></div>
      <label className="study-search">搜索{noun}<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索名称、分类或备注…" /></label>
      <div className="study-filters" aria-label="资料分类">{categories.map(name => <button key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}</div>
      {shown.length ? <div className="study-grid">{shown.map(item => <article className="study-card" key={item.id}><span className="study-category">▤ {item.category}</span><h3>{item.title}</h3><p>{item.note || '暂无备注'}</p><small>{item.url ? new URL(item.url).hostname : '本地文件夹'}</small><div className="study-card-actions"><a href={item.url || undefined} hidden={!item.url} target="_blank" rel="noopener noreferrer">打开链接 ↗</a><button onClick={() => open(item)} aria-label={`编辑${item.title}`}>编辑</button><button onClick={() => setDeleting(item)} aria-label={`删除${item.title}`}>删除</button></div><LocalFiles key={fileRevision} owner={`${storageKey}:${item.id}`} /></article>)}</div> : <div className="study-empty"><span aria-hidden="true">▤</span><h3>{items.length ? '没有找到匹配的资料' : `从第一个${noun}文件夹开始`}</h3><p>{items.length ? '换个关键词或分类试试。' : '添加本地文档、图片、压缩包，也可以保存网页链接。'}</p></div>}
      {deleting && <ConfirmDelete busy={busy} description={`将删除“${deleting.title}”及其所有本地材料。`} onCancel={() => setDeleting(null)} onConfirm={() => remove(deleting)}/> }<p className="course-notice" role="status">{notice || '文件仅保存在当前浏览器，清理浏览器数据会删除副本，请保留原始文件。'}</p>
    </section>
    <dialog ref={dialog} className="cover-dialog"><div className="cover-dialog-head"><h2>{editing ? `编辑${noun}` : `添加${noun}`}</h2><button aria-label="关闭资料编辑" onClick={() => dialog.current?.close()}>✕</button></div><form key={editing?.id || 'new'} ref={form} onSubmit={save}>
      <label>{noun}名称<input name="title" required maxLength={120} defaultValue={editing?.title || ''} /></label>
      <label>链接（可选）<input name="url" type="url" placeholder="https://…" defaultValue={editing?.url || ''} /></label>
      <label>分类<input name="category" maxLength={40} placeholder="例如：高等数学、编程、英语" defaultValue={editing?.category || ''} /></label>
      <label>备注<textarea name="note" rows={3} maxLength={1000} placeholder="记录重点、章节或网盘提取码" defaultValue={editing?.note || ''} /></label>
      <label>本地材料（可多选）<input name="materials" type="file" multiple disabled={busy}/></label><p role="status">{notice}</p><div className="cover-actions"><button type="button" onClick={() => dialog.current?.close()}>取消</button><button type="submit" disabled={busy} className="cover-primary">{busy ? "正在保存…" : `保存${noun}`}</button></div>
    </form></dialog>
  </main>;
}
