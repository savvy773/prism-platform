import { readFile } from "node:fs/promises";
import path from "node:path";
const assets = new Set(["docs/html/structure-plan.html","docs/html/access-guide.html","docs/html/erpnext-handover.html","docs/html/assets/handover.css","packages/ui/src/fonts/PretendardVariable.woff2","docs/html/assets/plan.css","docs/html/assets/guide.css","docs/html/assets/plan.js","docs/html/assets/structure-data.js","packages/ui/src/styles/tokens.css","README.md"]);
const docs=new Set(["ACCESS","ROADMAP","ERP_HANDOVER","ARCHITECTURE","DATABASE","COMMANDS","DEPLOYMENT","DEVELOPMENT","DOCKER_GUIDE","DESIGN_SYSTEM","STACK","DECISIONS","PROJECT_CONTEXT"]);
export async function GET(_request:Request,{params}:{params:Promise<{path:string[]}>}){
  const key=(await params).path.join("/");
  if(!assets.has(key)&&!Array.from(docs).some(name=>key==="docs/md/"+name+".md"))return new Response("Not found",{status:404});
  try{
    // Keep build tracing scoped to public documentation; never trace the repo root.
    const content=await (key.startsWith("docs/html/")
      ? readFile(path.join(process.cwd(),"../../docs/html",key.slice(10)))
      : key.startsWith("docs/md/")
        ? readFile(path.join(process.cwd(),"../../docs/md",key.slice(8)))
        : key.endsWith(".woff2")
          ? readFile(path.join(process.cwd(),"../../packages/ui/src/fonts/PretendardVariable.woff2"))
          : key.endsWith("tokens.css")
            ? readFile(path.join(process.cwd(),"../../packages/ui/src/styles/tokens.css"))
            : readFile(path.join(process.cwd(),"../../README.md")));
    const type=key.endsWith(".woff2")?"font/woff2":key.endsWith(".html")?"text/html":key.endsWith(".css")?"text/css":key.endsWith(".js")?"text/javascript":"text/plain";
    return new Response(content,{headers:{"Content-Type":type+(type==="font/woff2"?"":"; charset=utf-8"),"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
  }catch{return new Response("Not found",{status:404});}
}
