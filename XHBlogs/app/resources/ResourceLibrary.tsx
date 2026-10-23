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
  const noun = projectMode ? 'project' : 'resource';
  const [busy, setBusy] = useState(false);
  const [fileRevision, setFileRevision] = useState(0);
  const [items, setItems] = useState<Resource[]>(initialItems);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [editing, setEditing] = useState<Resource | null>(null);
  const [notice, setNotice] = useState('');
  const [deleting, setDeleting] = useState<Resource | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const saved = raw ? JSON.parse(raw) : null;
      // The starter list shipped with the repo + locally added/edited entries (local wins for the same id):
      // the starter content shows up on a new device or after clearing the cache, and locally added items are never lost.
      const merged = Array.isArray(saved) && validList(saved)
        ? [...initialItems.filter(item => !saved.some((s: Resource) => s.id === item.id)), ...saved]
        : initialItems;
      setItems(merged as Resource[]);
      setReady(true);
    } catch { setNotice('Could not load the saved list. Check your browser storage settings and refresh.'); }
  }, [storageKey]);
  function persist(next: Resource[]) {
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setItems(next); setNotice('Saved in this browser.'); return true; }
    catch { setNotice('Save failed. Check the browser storage space.'); return false; }
  }
  function open(item: Resource | null) {
    setEditing(item); setNotice(''); form.current?.reset(); dialog.current?.showModal();
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) || '').trim();
    if (!value('title') || (value('url') && !safeUrl(value('url')))) { setNotice('Enter a name; if you add a link, use a valid http / https address.'); return; }
    const item = { id: editing?.id || crypto.randomUUID(), title: value('title'), url: value('url'), category: value('category') || 'Uncategorized', note: value('note') };
    const selected = Array.from((event.currentTarget.elements.namedItem('materials') as HTMLInputElement).files || []);
    setBusy(true);
    try {
      await addLocalFiles(`${storageKey}:${item.id}`, selected);
      if (persist(editing ? items.map(old => old.id === item.id ? item : old) : [item, ...items])) {
        setCategory('All'); setQuery(''); setFileRevision(value => value + 1); dialog.current?.close();
      } else if (!editing) { await removeLocalFiles(`${storageKey}:${item.id}`); }
    } catch(error) { setNotice(error instanceof Error ? error.message : 'Save failed'); }
    finally { setBusy(false); }
  }
  async function remove(item: Resource) {
    if (persist(items.filter(old => old.id !== item.id))) {
      setCategory('All'); setDeleting(null);
      try { await removeLocalFiles(`${storageKey}:${item.id}`); } catch { setNotice('Item deleted, but cleaning up the local files failed.'); }
    }
  }
  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];
  const shown = items.filter(item => (category === 'All' || item.category === category) && `${item.title} ${item.category} ${item.note}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <main id="main-content" className="course-shell">
    <SectionCover storageKey={projectMode ? "projects" : "resources"} image={projectMode ? withBasePath("/covers/projects.webp") : withBasePath("/covers/notes.webp")} eyebrow={projectMode ? "Projects" : "Resources"} title={projectMode ? "Projects I've built" : "Lecture notes, links and tools"} subtitle="Local files, images, code and links, stored in the browser and always within reach." />
    <section className="course-panel" aria-label={projectMode ? "Project folders" : "Resource library"}>
      <div className="course-toolbar"><div><h2>{projectMode ? "My projects" : "My resources"} <span className="study-count">{items.length} items</span></h2><p className="course-notice">Grouped by course or topic, so whatever you need is easy to find.</p></div><div className="cover-actions"><button className="cover-primary" disabled={!ready || busy} onClick={() => open(null)}>＋ Add {noun}</button></div></div>
      <label className="study-search">Search {noun}s<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, category or note…" /></label>
      <div className="study-filters" aria-label="Categories">{categories.map(name => <button key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}</div>
      {shown.length ? <div className="study-grid">{shown.map(item => <article className="study-card" key={item.id}><span className="study-category">▤ {item.category}</span><h3>{item.title}</h3><p>{item.note || 'No note yet'}</p><small>{item.url ? new URL(item.url).hostname : 'Local folder'}</small><div className="study-card-actions"><a href={item.url || undefined} hidden={!item.url} target="_blank" rel="noopener noreferrer">Open link ↗</a><button onClick={() => open(item)} aria-label={`Edit ${item.title}`}>Edit</button><button onClick={() => setDeleting(item)} aria-label={`Delete ${item.title}`}>Delete</button></div><LocalFiles key={fileRevision} owner={`${storageKey}:${item.id}`} /></article>)}</div> : <div className="study-empty"><span aria-hidden="true">▤</span><h3>{items.length ? 'No matches found' : `Start with your first ${noun} folder`}</h3><p>{items.length ? 'Try another keyword or category.' : 'Add local documents, images and archives, or save a web link.'}</p></div>}
      {deleting && <ConfirmDelete busy={busy} description={`This deletes “${deleting.title}” and all its local files.`} onCancel={() => setDeleting(null)} onConfirm={() => remove(deleting)}/> }<p className="course-notice" role="status">{notice || 'Files are stored only in this browser; clearing browser data deletes the copies, so keep the originals.'}</p>
    </section>
    <dialog ref={dialog} className="cover-dialog"><div className="cover-dialog-head"><h2>{editing ? `Edit ${noun}` : `Add ${noun}`}</h2><button aria-label="Close editor" onClick={() => dialog.current?.close()}>✕</button></div><form key={editing?.id || 'new'} ref={form} onSubmit={save}>
      <label>{noun === 'project' ? 'Project name' : 'Resource name'}<input name="title" required maxLength={120} defaultValue={editing?.title || ''} /></label>
      <label>Link (optional)<input name="url" type="url" placeholder="https://…" defaultValue={editing?.url || ''} /></label>
      <label>Category<input name="category" maxLength={40} placeholder="e.g. Calculus, Programming, English" defaultValue={editing?.category || ''} /></label>
      <label>Note<textarea name="note" rows={3} maxLength={1000} placeholder="Key points, chapters or a cloud-drive code" defaultValue={editing?.note || ''} /></label>
      <label>Local files (multiple allowed)<input name="materials" type="file" multiple disabled={busy}/></label><p role="status">{notice}</p><div className="cover-actions"><button type="button" onClick={() => dialog.current?.close()}>Cancel</button><button type="submit" disabled={busy} className="cover-primary">{busy ? "Saving…" : `Save ${noun}`}</button></div>
    </form></dialog>
  </main>;
}
