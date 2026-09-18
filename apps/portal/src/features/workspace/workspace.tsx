"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, CalendarDays, Check, ClipboardList, FileText, FolderKanban, LayoutDashboard, Plus, Search, Trash2, X, Pencil, ArrowRightLeft } from "lucide-react";
import { saveEntry, deleteEntry } from "../../app/actions";
import { kinds, labels, type Entry, type Kind, type ActionState } from "./model";

const icons = { weekly: ClipboardList, schedule: CalendarDays, project: FolderKanban, wiki: BookOpen, handover: ArrowRightLeft };
const descriptions = { weekly:"이번 주의 성과와 다음 주 계획을 함께 나눕니다.", schedule:"팀의 약속과 중요한 날짜를 한곳에서 확인합니다.", project:"목표와 진행 상황을 공유하며 함께 완성합니다.", wiki:"팀의 지식과 자주 찾는 절차를 차곡차곡 기록합니다.", handover:"업무의 맥락과 다음 담당자가 알아야 할 내용을 남깁니다." };
const statuses = {open:"예정",doing:"진행 중",done:"완료"};
const initial:ActionState={ok:false,message:""};

function Editor({entry,kind,onClose}:{entry?:Entry;kind:Kind;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [state,action,pending]=useActionState(saveEntry,initial);
  const [currentKind,setCurrentKind]=useState<Kind>(entry?.kind??kind);
  useEffect(()=>{dialog.current?.showModal();},[]);
  useEffect(()=>{if(state.ok)onClose();},[state,onClose]);
  return <dialog ref={dialog} className="editor-dialog" onCancel={onClose}>
    <form action={action}>
      <div className="dialog-heading"><div><span className="eyebrow">TEAM WORKSPACE</span><h2>{entry?"문서 수정":"새로운 기록"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="닫기"><X size={20}/></button></div>
      {entry&&<input type="hidden" name="id" value={entry.id}/>}
      <div className="field-row"><label>분류<select name="kind" value={currentKind} onChange={e=>setCurrentKind(e.target.value as Kind)}>{kinds.map(k=><option key={k} value={k}>{labels[k]}</option>)}</select></label><label>진행 상태<select name="status" defaultValue={entry?.status??"open"}>{Object.entries(statuses).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label></div>
      <label>제목<input name="title" required maxLength={120} defaultValue={entry?.title} placeholder="어떤 내용을 공유할까요?" autoFocus/></label>
      <div className="field-row"><label>작성자 · 담당자<input name="owner" required maxLength={40} defaultValue={entry?.owner} placeholder="이름 또는 팀"/></label><label>{currentKind==="schedule"?"일정 날짜":"관련 날짜 (선택)"}<input type="date" name="date" required={currentKind==="schedule"} defaultValue={entry?.date}/></label></div>
      <label>내용<textarea name="body" rows={9} required maxLength={10000} defaultValue={entry?.body} placeholder="배경, 진행 내용, 다음 할 일을 남겨 주세요."/></label>
      {state.message&&<p role="alert" className="form-error">{state.message}</p>}
      <div className="dialog-footer"><span>로컬 연습 공간 · 일반 텍스트 문서</span><button type="submit" className="primary-button" disabled={pending}>{pending?"저장 중…":"저장하기"}<Check size={16}/></button></div>
    </form>
  </dialog>;
}

function EntryCard({entry,onEdit}:{entry:Entry;onEdit:(entry:Entry)=>void}) {
  const [expanded,setExpanded]=useState(false);
  const [confirm,setConfirm]=useState(false);
  const [state,action,pending]=useActionState(deleteEntry,initial);
  const Icon=icons[entry.kind];
  return <article className="entry-card">
    <div className="entry-top"><span className={"kind-badge "+entry.kind}><Icon size={14}/>{labels[entry.kind]}</span><span className={"status-label "+entry.status}>{statuses[entry.status]}</span></div>
    <button className="entry-title" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}>{entry.title}</button>
    <p className={expanded?"entry-body expanded":"entry-body"}>{entry.body.split(/(https?:\/\/[^\s]+)/g).map((part,index)=>part.startsWith("http://")||part.startsWith("https://")?<a key={index} href={part} target="_blank" rel="noreferrer">{part}</a>:part)}</p>
    <div className="entry-meta"><span className="avatar">{entry.owner.slice(0,1)}</span><b>{entry.owner}</b>{entry.date&&<span className="entry-date"><CalendarDays size={13}/>{entry.date}</span>}</div>
    <div className="entry-footer"><small>{entry.updatedAt} 수정</small><div><button className="icon-button" onClick={()=>onEdit(entry)} aria-label={entry.title+" 수정"}><Pencil size={15}/></button><button className="icon-button" onClick={()=>setConfirm(!confirm)} aria-label={entry.title+" 삭제"}><Trash2 size={15}/></button></div></div>
    {confirm&&<form action={action} className="delete-confirm"><input type="hidden" name="id" value={entry.id}/><span>이 문서를 삭제할까요?</span><button type="submit" disabled={pending}>삭제</button><button type="button" onClick={()=>setConfirm(false)}>취소</button>{!state.ok&&state.message&&<p role="alert">{state.message}</p>}</form>}
  </article>;
}

export function Workspace({entries,connected}:{entries:Entry[];connected:boolean}) {
  const [view,setView]=useState<Kind|"all">("all");
  const [search,setSearch]=useState("");
  const [editor,setEditor]=useState<Entry|"new"|null>(null);
  const [erpUrl,setErpUrl]=useState("http://prismjuns:8080");
  useEffect(()=>{setErpUrl(window.location.protocol+"//"+window.location.hostname+":8080");},[]);
  const visible=entries.filter(e=>(view==="all"||e.kind===view)&&[e.title,e.body,e.owner].join(" ").toLowerCase().includes(search.toLowerCase()));
  const complete=entries.filter(e=>e.status==="done").length;
  return <div className="app-shell">
    <a href="#workspace-main" className="skip-link">본문으로 이동</a>
    <aside className="sidebar">
      <a href="/" className="brand"><span className="brand-symbol">P</span>prism<span className="brand-dot">.</span></a>
      <div className="workspace-label"><span className="workspace-avatar">P</span><div><b>우리의 워크스페이스</b><small>함께 일하는 공간</small></div></div>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="업무 메뉴">
        <button onClick={()=>setView("all")} className={view==="all"?"active":""} aria-current={view==="all"?"page":undefined}><LayoutDashboard size={18}/>전체 보기<span>{entries.length}</span></button>
        {kinds.map(k=>{const Icon=icons[k];return <button key={k} onClick={()=>setView(k)} className={view===k?"active":""} aria-current={view===k?"page":undefined}><Icon size={18}/>{labels[k]}<span>{entries.filter(e=>e.kind===k).length}</span></button>;})}
      </nav>
      <div className="sidebar-bottom"><a className="guide-link" href="/reference/docs/html/access-guide.html"><BookOpen size={16}/>접속 · 서버 사용 안내<ArrowUpRight size={14}/></a><div className="nav-label">CONNECTED APPS</div><a className="erp-link" href={erpUrl} target="_blank" rel="noreferrer"><span className="erp-icon">E</span><div><b>ERPNext</b><small>연습용 ERP 열기</small></div><ArrowUpRight size={17}/></a><p className="local-label"><span/>WSL 개발 공간</p></div>
    </aside>
    <div className="main-shell">
      <header className="app-header"><div className="breadcrumb">워크스페이스<span>/</span><b>{view==="all"?"전체 보기":labels[view]}</b></div><div className="header-right"><span className="dev-badge">LOCAL DEMO</span><span className="user-avatar">P</span></div></header>
      <main id="workspace-main">
        <section className="page-intro"><div><p className="eyebrow">A SPACE FOR BETTER TEAMWORK</p><h1>{view==="all"?"함께 만드는, 우리의 하루.":labels[view]}</h1><p>{view==="all"?"업무의 흐름과 팀의 지식을 한곳에 모아 보세요.":descriptions[view]}</p></div><button className="primary-button" onClick={()=>setEditor("new")} disabled={!connected}><Plus size={18}/>새 기록</button></section>
        {!connected&&<div className="connection-error" role="alert">저장소에 연결할 수 없습니다. 서버 상태를 확인한 뒤 새로고침해 주세요. 기존 데이터가 없는 것으로 표시될 수 있습니다.</div>}
        <section className="overview-grid" aria-label="업무 현황"><div><span className="metric-icon green"><FileText size={21}/></span><div><p>쌓인 기록</p><strong>{connected?entries.length:"—"}<small>개의 문서</small></strong></div></div><div><span className="metric-icon blue"><CalendarDays size={21}/></span><div><p>공유한 일정</p><strong>{connected?entries.filter(e=>e.kind==="schedule").length:"—"}<small>개의 약속</small></strong></div></div><div><span className="metric-icon amber"><Check size={21}/></span><div><p>함께 마친 일</p><strong>{connected?complete:"—"}<small>개의 완료 기록</small></strong></div></div></section>
        <section className="workspace-content">
          <div className="list-toolbar"><div><h2>{view==="all"?"팀의 최근 기록":labels[view]+" 기록"}<span>{visible.length}</span></h2><p>작은 기록이 팀의 다음 걸음을 만듭니다.</p></div><label className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="제목, 내용, 담당자 검색" aria-label="기록 검색"/></label></div>
          {visible.length?<div className="entries-grid">{visible.map(entry=><EntryCard key={entry.id} entry={entry} onEdit={setEditor}/>)}</div>:<div className="empty-state"><BookOpen size={32}/><h3>{search?"검색 결과가 없습니다.":"첫 기록을 남겨 보세요."}</h3><p>{search?"다른 검색어로 찾아보세요.":"새 기록 버튼으로 팀과 나눌 내용을 작성할 수 있습니다."}</p></div>}
        </section>
        <div className="workspace-footnote"><span><span className={connected?"connection-dot":"connection-dot offline"}/>{connected?"저장소 연결됨":"저장소 연결 안 됨"}</span><p>로그인 없는 로컬 연습용 · 샘플 데이터 사용 · 최대 최근 500건 표시</p></div>
      </main>
    </div>
    {editor&&<Editor key={editor==="new"?"new":editor.id} entry={editor==="new"?undefined:editor} kind={view==="all"?"weekly":view} onClose={()=>setEditor(null)}/>}
  </div>;
}
