"use server";
import { revalidatePath } from "next/cache";
import { database } from "../server/connection";
import { entrySchema, type ActionState } from "../features/workspace/model";
const failure = { ok:false, message:"저장소에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요." };
export async function saveEntry(_: ActionState, form: FormData): Promise<ActionState> {
  const result = entrySchema.safeParse(Object.fromEntries(form));
  if (!result.success) return {ok:false,message:result.error.issues[0].message};
  const idText = form.get("id");
  const id = idText ? Number(idText) : null;
  if (id!==null && (!Number.isSafeInteger(id)||id<1)) return {ok:false,message:"잘못된 문서입니다."};
  const {kind,title,body,owner,date,status}=result.data;
  try {
    if(id) {
      const changed = await database().query("UPDATE entries SET kind=?, title=?, body=?, owner=?, event_date=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", [kind,title,body,owner,date||null,status,id]);
      if (!changed.affectedRows) return {ok:false,message:"문서가 삭제되었습니다. 새로고침해 주세요."};
    } else await database().query("INSERT INTO entries (kind,title,body,owner,event_date,status) VALUES (?,?,?,?,?,?)",[kind,title,body,owner,date||null,status]);
  } catch { return failure; }
  revalidatePath("/");
  return {ok:true,message:id?"변경 내용을 저장했습니다.":"새 문서를 저장했습니다.",stamp:Date.now()};
}
export async function deleteEntry(_: ActionState, form: FormData): Promise<ActionState> {
  const id=Number(form.get("id"));
  if(!Number.isSafeInteger(id)||id<1) return {ok:false,message:"잘못된 문서입니다."};
  try { await database().query("DELETE FROM entries WHERE id=?",[id]); } catch { return failure; }
  revalidatePath("/"); return {ok:true,message:"문서를 삭제했습니다.",stamp:Date.now()};
}
