"use client";
import { useEffect, useRef, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import SectionCover from '../../components/SectionCover';
import { withBasePath } from '../../sitePath';
import { formatDayMonth } from '../../components/formatDate';

type Course = { id:string;date:string;start:string;end:string;name:string;location:string;teacher:string;content:string;done:boolean };
// Initial timetable: built from this semester's actual courses, with dates falling on "the current week".
// The times are examples (each course has two periods); click any class to set the real time, room and lecturer.
const coursePlan: Array<{ dayOffset: number; start: string; end: string; name: string; content: string }> = [
 {dayOffset:0,start:'08:30',end:'10:00',name:'Programming I',content:'Lecture + lab practice'},
 {dayOffset:0,start:'10:15',end:'11:45',name:'Mathematics I',content:'Problem set walkthrough'},
 {dayOffset:1,start:'08:30',end:'10:00',name:'German I',content:'Listening and speaking practice'},
 {dayOffset:1,start:'14:00',end:'15:30',name:'Linux Operating Systems',content:'Lab session'},
 {dayOffset:2,start:'08:30',end:'10:00',name:'English I',content:'Reading and writing practice'},
 {dayOffset:2,start:'10:15',end:'11:45',name:'Foundations of Artificial Intelligence',content:'Lecture'},
 {dayOffset:3,start:'08:30',end:'10:00',name:'Algorithms and Data Structures',content:'In-class exercises'},
 {dayOffset:3,start:'14:00',end:'15:30',name:'Introduction to Project Work',content:'Group progress report'},
 {dayOffset:4,start:'08:30',end:'10:00',name:'Mathematics II',content:'Problem set walkthrough'},
 {dayOffset:4,start:'10:15',end:'11:45',name:'Introduction to Research Work',content:'How to read papers'}
];
function buildInitialCourses(): Course[] {
 const base = monday(new Date());
 return coursePlan.map((item, index) => {
  const day = new Date(base);
  day.setDate(day.getDate() + item.dayOffset);
  return { id:`plan-${item.dayOffset}-${index}`, date:dateKey(day), start:item.start, end:item.end, name:item.name, location:'', teacher:'', content:item.content, done:false };
 });
}
const dateKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function monday(d:Date) { const copy=new Date(d);copy.setHours(12,0,0,0);copy.setDate(copy.getDate()-(copy.getDay()+6)%7);return copy; }
function shift(d:Date,n:number){const copy=new Date(d);copy.setDate(copy.getDate()+n);return copy;}
function validCourses(value:unknown): value is Course[] { return Array.isArray(value)&&value.length<=5000&&value.every(c=>c&&['id','name','date','start','location','content'].every(k=>typeof c[k]==='string')&&/^\d{4}-\d{2}-\d{2}$/.test(c.date)&&/^\d{2}:\d{2}$/.test(c.start)); }
const normalize=(c:Course):Course=>({...c,end:typeof c.end==='string'?c.end:'',teacher:typeof c.teacher==='string'?c.teacher:'',done:!!c.done});
export default function CourseCalendar(){
 const [courses,setCourses]=useState<Course[]>([]);
 const [week,setWeek]=useState(()=>monday(new Date('2026-09-21T12:00:00')));
 const [today,setToday]=useState('');const [notice,setNotice]=useState('');const [editing,setEditing]=useState<Course|null>(null);
 const dialog=useRef<HTMLDialogElement>(null);const form=useRef<HTMLFormElement>(null);
 useEffect(()=>{setWeek(monday(new Date()));setToday(dateKey(new Date()));try{const stored=JSON.parse(localStorage.getItem('shore-courses-v1')||'null');setCourses(validCourses(stored)?stored.map(normalize):buildInitialCourses());}catch{setCourses(buildInitialCourses());}},[]);
 const days=Array.from({length:7},(_,i)=>shift(week,i));
 function persist(next:Course[]){try{localStorage.setItem('shore-courses-v1',JSON.stringify(next));setCourses(next);setNotice('Timetable saved in this browser.');return true;}catch{setNotice('Save failed: browser storage is full. Export a backup first.');return false;}}
 function openEditor(course:Course|null){setEditing(course);form.current?.reset();dialog.current?.showModal();}
 function save(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const data=new FormData(e.currentTarget);const get=(k:string)=>String(data.get(k)||'').trim();const start=get('start'),end=get('end');if(end&&end<=start){setNotice('The end time must be later than the start time.');return;}if(!get('name')||!get('location')||!get('content')){setNotice('Fill in the name, room and content.');return;}
 const c:Course={id:editing?.id||crypto.randomUUID(),date:get('date'),start,end,name:get('name'),teacher:get('teacher'),location:get('location'),content:get('content'),done:data.get('done')==='on'};const next=editing?courses.map(x=>x.id===c.id?c:x):[...courses,c];if(persist(next)){setWeek(monday(new Date(c.date+'T12:00:00')));dialog.current?.close();}}
 function exportCourses(){const data={format:'shore-blog-backup',version:1,data:{'shore-courses-v1':courses}};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='courses-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 async function importCourses(file?:File){if(!file)return;try{if(file.size>5000000)throw new Error('Choose a backup under 5 MB.');const data=JSON.parse(await file.text());const list=Array.isArray(data)?data:data.data?.['shore-courses-v1'];if(!validCourses(list))throw new Error('The courses in this backup are not in the right format.');const map=new Map(courses.map(c=>[c.id,c]));list.forEach(c=>{if(!map.has(c.id))map.set(c.id,normalize(c));});if(persist([...map.values()])){setNotice(`Backup merged; courses with the same ID keep the current version. ${map.size} classes in total.`);if(list[0])setWeek(monday(new Date(list[0].date+'T12:00:00')));}}catch(e){setNotice(e instanceof Error?e.message:'Import failed.');}}
 return <main id="main-content" className="course-shell">
  <SectionCover storageKey="courses" title="This week's classes" subtitle="Open a class to change its time, room and lecturer." image={withBasePath("/covers/projects.webp")} eyebrow="Courses"/>
  <section className="course-panel" aria-label="Weekly class calendar">
   <div className="course-toolbar"><div><h2>{formatDayMonth(week)} – {formatDayMonth(days[6])}, {days[6].getFullYear()}</h2><p className="course-notice">{courses.filter(c=>c.date>=dateKey(week)&&c.date<=dateKey(days[6])).length} classes this week</p></div><div className="cover-actions"><button aria-label="Previous week" onClick={()=>setWeek(shift(week,-7))}><ChevronLeft size={16}/></button><button onClick={()=>setWeek(monday(new Date()))}>This week</button><button aria-label="Next week" onClick={()=>setWeek(shift(week,7))}><ChevronRight size={16}/></button><button className="cover-primary" onClick={()=>openEditor(null)}><CalendarPlus size={16}/>Add class</button></div></div>
   <div className="course-scroll"><div className="course-week">{days.map((day,i)=>{const key=dateKey(day),items=courses.filter(c=>c.date===key).sort((a,b)=>a.start.localeCompare(b.start));return <section key={key} className={`course-day ${key===today?'today':''}`}><h3>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]} · {i+1}<strong>{day.getDate()}</strong></h3>{items.length?items.map(c=><button key={c.id} className="course-entry" onClick={()=>openEditor(c)}><time>{c.start}{c.end?'–'+c.end:''}</time><strong>{c.name}</strong><span>Room · {c.location || 'TBD'}</span><span>Lecturer · {c.teacher||'TBD'}</span><p>{c.content}</p><span>{c.done?'Done':'Upcoming'}</span></button>):<p className="course-empty">No classes</p>}</section>;})}</div></div>
   <p role="status" className="course-notice">{notice||'Click any class to edit it. The initial timetable follows this semester (times are examples); changes stay in this browser, and you can export/import a backup.'}</p>
   <div className="cover-actions"><button onClick={exportCourses}>Export timetable backup</button></div><label className="course-upload">Import timetable backup (keeps existing classes)<input type="file" accept="application/json,.json" onChange={e=>{importCourses(e.target.files?.[0]);e.target.value='';}}/></label>
  </section>
  <dialog ref={dialog} className="cover-dialog"><div className="cover-dialog-head"><h2>{editing?'Edit class':'Add class'}</h2><button aria-label="Close class editor" onClick={()=>dialog.current?.close()}><X size={20}/></button></div><form key={editing?.id||'new'} ref={form} onSubmit={save}><div className="course-form-grid">
   <label className="full">Class name<input name="name" required defaultValue={editing?.name||''}/></label><label>Date<input name="date" type="date" required defaultValue={editing?.date||today}/></label><label>Lecturer<input name="teacher" defaultValue={editing?.teacher||''}/></label><label>Start time<input name="start" type="time" required defaultValue={editing?.start||'09:00'}/></label><label>End time<input name="end" type="time" defaultValue={editing?.end||''}/></label><label className="full">Room<input name="location" required defaultValue={editing?.location||''}/></label><label className="full">Class content<textarea name="content" required rows={3} defaultValue={editing?.content||''}/></label><label>Done<input name="done" type="checkbox" defaultChecked={editing?.done||false}/></label></div><p role="status">{notice}</p><div className="cover-actions"><button type="button" onClick={()=>dialog.current?.close()}>Cancel</button><button className="cover-primary" type="submit">Save class</button></div></form></dialog>
 </main>;
}
