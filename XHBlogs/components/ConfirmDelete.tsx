"use client";
import { useEffect, useRef } from 'react';
export default function ConfirmDelete({ description, busy = false, onCancel, onConfirm }: { description: string; busy?: boolean; onCancel: () => void; onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="delete-dialog" aria-labeledby="delete-title" onCancel={e => { e.preventDefault(); if(!busy) onCancel(); }}>
    <div className="delete-icon" aria-hidden="true">⌫</div><h2 id="delete-title">Delete this?</h2><p>{description}</p><small>This cannot be undone — make sure you have kept the files you need.</small>
    <div className="delete-actions"><button autoFocus disabled={busy} onClick={onCancel}>Cancel</button><button className="delete-confirm" disabled={busy} onClick={onConfirm}>{busy ? 'Deleting…' : 'Delete'}</button></div>
  </dialog>;
}
