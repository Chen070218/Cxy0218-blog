"use client";
import { useEffect, useRef } from 'react';
export default function ConfirmDelete({ description, busy = false, onCancel, onConfirm }: { description: string; busy?: boolean; onCancel: () => void; onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="delete-dialog" aria-labelledby="delete-title" onCancel={e => { e.preventDefault(); if(!busy) onCancel(); }}>
    <div className="delete-icon" aria-hidden="true">⌫</div><h2 id="delete-title">确认删除？</h2><p>{description}</p><small>删除后无法恢复，请确认已保留需要的文件。</small>
    <div className="delete-actions"><button autoFocus disabled={busy} onClick={onCancel}>取消</button><button className="delete-confirm" disabled={busy} onClick={onConfirm}>{busy ? '正在删除…' : '确认删除'}</button></div>
  </dialog>;
}
