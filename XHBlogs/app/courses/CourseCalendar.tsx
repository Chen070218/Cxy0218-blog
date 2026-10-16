"use client";
import { useEffect, useRef, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import SectionCover from '../../components/SectionCover';
import { withBasePath } from '../../sitePath';

type Course = { id:string;date:string;start:string;end:string;name:string;location:string;teacher:string;content:string;done:boolean };
// 初始课表：按本学期的实际课程生成，日期自动落在"当前这一周"。
// 时间是示例（每门课按两节排），点开任意一节就能改成真实时间、地点和老师。
const coursePlan: Array<{ dayOffset: number; start: string; end: string; name: string; content: string }> = [
 {dayOffset:0,start:'08:30',end:'10:00',name:'编程 I',content:'课堂讲授 + 上机练习'},
 {dayOffset:0,start:'10:15',end:'11:45',name:'数学 I',content:'习题讲解'},
 {dayOffset:1,start:'08:30',end:'10:00',name:'德语 I',content:'听说练习'},
 {dayOffset:1,start:'14:00',end:'15:30',name:'Linux 操作系统',content:'上机实验'},
 {dayOffset:2,start:'08:30',end:'10:00',name:'英语 I',content:'读写训练'},
 {dayOffset:2,start:'10:15',end:'11:45',name:'人工智能基础',content:'课程讲授'},
 {dayOffset:3,start:'08:30',end:'10:00',name:'算法与数据结构',content:'课堂练习'},
 {dayOffset:3,start:'14:00',end:'15:30',name:'项目工作导论',content:'小组进度汇报'},
 {dayOffset:4,start:'08:30',end:'10:00',name:'数学 II',content:'习题讲解'},
 {dayOffset:4,start:'10:15',end:'11:45',name:'科研工作导论',content:'文献阅读方法'}
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
 function persist(next:Course[]){try{localStorage.setItem('shore-courses-v1',JSON.stringify(next));setCourses(next);setNotice('课程已保存在当前浏览器。');return true;}catch{setNotice('保存失败，浏览器存储空间不足。请先导出备份。');return false;}}
 function openEditor(course:Course|null){setEditing(course);form.current?.reset();dialog.current?.showModal();}
 function save(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const data=new FormData(e.currentTarget);const get=(k:string)=>String(data.get(k)||'').trim();const start=get('start'),end=get('end');if(end&&end<=start){setNotice('结束时间必须晚于开始时间。');return;}if(!get('name')||!get('location')||!get('content')){setNotice('请填写名称、地点和内容。');return;}
 const c:Course={id:editing?.id||crypto.randomUUID(),date:get('date'),start,end,name:get('name'),teacher:get('teacher'),location:get('location'),content:get('content'),done:data.get('done')==='on'};const next=editing?courses.map(x=>x.id===c.id?c:x):[...courses,c];if(persist(next)){setWeek(monday(new Date(c.date+'T12:00:00')));dialog.current?.close();}}
 function exportCourses(){const data={format:'shore-blog-backup',version:1,data:{'shore-courses-v1':courses}};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='课程备份.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 async function importCourses(file?:File){if(!file)return;try{if(file.size>5000000)throw new Error('请选择 5 MB 以内的备份。');const data=JSON.parse(await file.text());const list=Array.isArray(data)?data:data.data?.['shore-courses-v1'];if(!validCourses(list))throw new Error('备份中的课程格式不正确。');const map=new Map(courses.map(c=>[c.id,c]));list.forEach(c=>{if(!map.has(c.id))map.set(c.id,normalize(c));});if(persist([...map.values()])){setNotice(`备份已合并；同 ID 课程保留当前内容。共 ${map.size} 节课程。`);if(list[0])setWeek(monday(new Date(list[0].date+'T12:00:00')));}}catch(e){setNotice(e instanceof Error?e.message:'导入失败。');}}
 return <main className="course-shell">
  <SectionCover storageKey="courses" title="一周的学习，有条不紊" subtitle="时间、地点、授课老师与课程内容，在这里一眼看清。" image={withBasePath("/covers/projects.jpg")} eyebrow="WEEKLY PLANNER / 课程周历"/>
  <section className="course-panel" aria-label="每周课程日历">
   <div className="course-toolbar"><div><h2>{dateKey(week)} — {dateKey(days[6])}</h2><p className="course-notice">本周 {courses.filter(c=>c.date>=dateKey(week)&&c.date<=dateKey(days[6])).length} 节课程</p></div><div className="cover-actions"><button aria-label="上一周" onClick={()=>setWeek(shift(week,-7))}><ChevronLeft size={16}/></button><button onClick={()=>setWeek(monday(new Date()))}>本周</button><button aria-label="下一周" onClick={()=>setWeek(shift(week,7))}><ChevronRight size={16}/></button><button className="cover-primary" onClick={()=>openEditor(null)}><CalendarPlus size={16}/>添加课程</button></div></div>
   <div className="course-scroll"><div className="course-week">{days.map((day,i)=>{const key=dateKey(day),items=courses.filter(c=>c.date===key).sort((a,b)=>a.start.localeCompare(b.start));return <section key={key} className={`course-day ${key===today?'today':''}`}><h3>周{'一二三四五六日'[i]} · {i+1}<strong>{day.getDate()}</strong></h3>{items.length?items.map(c=><button key={c.id} className="course-entry" onClick={()=>openEditor(c)}><time>{c.start}{c.end?'–'+c.end:''}</time><strong>{c.name}</strong><span>地点 · {c.location}</span><span>老师 · {c.teacher||'待补充'}</span><p>{c.content}</p><span>{c.done?'已完成':'待上课'}</span></button>):<p className="course-empty">暂无课程</p>}</section>;})}</div></div>
   <p role="status" className="course-notice">{notice||'点击任意课程即可编辑。初始课表按本学期课程生成（时间是示例），改动只保存在当前浏览器，支持导出/导入备份。'}</p>
   <div className="cover-actions"><button onClick={exportCourses}>导出课程备份</button></div><label className="course-upload">导入课程备份（保留现有课程）<input type="file" accept="application/json,.json" onChange={e=>{importCourses(e.target.files?.[0]);e.target.value='';}}/></label>
  </section>
  <dialog ref={dialog} className="cover-dialog"><div className="cover-dialog-head"><h2>{editing?'编辑课程':'添加课程'}</h2><button aria-label="关闭课程编辑" onClick={()=>dialog.current?.close()}><X size={20}/></button></div><form key={editing?.id||'new'} ref={form} onSubmit={save}><div className="course-form-grid">
  <label className="full">课程名称<input name="name" required defaultValue={editing?.name||''}/></label><label>日期<input name="date" type="date" required defaultValue={editing?.date||today}/></label><label>授课老师<input name="teacher" defaultValue={editing?.teacher||''}/></label><label>开始时间<input name="start" type="time" required defaultValue={editing?.start||'09:00'}/></label><label>结束时间<input name="end" type="time" defaultValue={editing?.end||''}/></label><label className="full">上课地点<input name="location" required defaultValue={editing?.location||''}/></label><label className="full">课程内容<textarea name="content" required rows={3} defaultValue={editing?.content||''}/></label><label>已完成<input name="done" type="checkbox" defaultChecked={editing?.done||false}/></label></div><p role="status">{notice}</p><div className="cover-actions"><button type="button" onClick={()=>dialog.current?.close()}>取消</button><button className="cover-primary" type="submit">保存课程</button></div></form></dialog>
 </main>;
}
