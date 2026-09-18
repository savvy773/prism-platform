import { readFile } from "node:fs/promises";
import { database } from "../src/server/connection";
const pool=database();
const mode=process.argv[2]??"migrate";
try {
  if(!["migrate","seed","reset"].includes(mode)) throw new Error("Unknown database operation");
  if(mode==="reset") {
    if(process.env.PRISM_ENV!=="development"||process.env.PRISM_RESET_ALLOWED!=="portal_db"||process.env.DB_NAME!=="portal_db"||process.env.DB_USER!=="portal") throw new Error("Reset refused");
    await pool.query("DROP TABLE IF EXISTS entries");
    await pool.query("DROP TABLE IF EXISTS schema_migrations");
  }
  await pool.query("CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(100) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
  const version="001_entries";
  const rows=await pool.query("SELECT version FROM schema_migrations WHERE version=?",[version]);
  if(!rows.length){await pool.query(await readFile(new URL("./migrations/001_entries.sql",import.meta.url),"utf8"));await pool.query("INSERT INTO schema_migrations (version) VALUES (?)",[version]);}
  if(mode==="seed"||mode==="reset"){
    const [{count}]=await pool.query("SELECT COUNT(*) AS count FROM entries");
    if(Number(count)===0){
      const samples=[
        ["weekly","이번 주, 함께 시작하는 업무 공간","완료한 일과 다음 주 계획을 이곳에 정리해 보세요. 이 문서는 연습용 샘플입니다.","Prism 팀",null,"doing"],
        ["schedule","팀 킥오프 미팅","각자 이번 주 우선순위를 공유하고 다음 실험을 정합니다. 연습용 일정입니다.","Prism 팀",new Date().toISOString().slice(0,10),"open"],
        ["project","사내 포털 첫 번째 릴리스","목표: 업무 기록을 한곳에 모으기. 담당자와 진행 상태를 바꿔 보세요.","Prism 팀",null,"doing"],
        ["wiki","팀 위키 사용 안내","자주 찾는 절차와 지식을 기록합니다. 현재는 일반 텍스트 문서이며 블록 편집과 문서 계층은 추후 추가합니다.","Prism 팀",null,"open"],
        ["handover","새 팀원을 위한 첫날 체크리스트","1. 업무 계정 확인\n2. 담당 프로젝트 확인\n3. 업무 절차 읽기\n4. 인계자와 확인할 사항 정리","Prism 팀",null,"open"],
        ["wiki","접속 주소 · 서버 시작과 중지","개발 PC: prismjuns / 192.168.123.66\n포털: http://prismjuns:3000\nERPNext: http://prismjuns:8080\n전체 시작: make up / 중지: make down / 상태: make ps\n접속·포트·초기화·운영 배포 후 안내: http://prismjuns/reference/docs/html/access-guide.html\nUbuntu 운영 서버는 prismdev (ssh su)이며 아직 배포 전입니다.","Prism 팀",null,"open"]
      ];
      await pool.batch("INSERT INTO entries(kind,title,body,owner,event_date,status) VALUES(?,?,?,?,?,?)",samples);
    }
  }
  console.log("Portal schema ready ("+mode+").");
}finally{await pool.end();}
