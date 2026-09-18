import { z } from "zod";
export const kinds = ["weekly", "schedule", "project", "wiki", "handover"] as const;
export type Kind = typeof kinds[number];
export const labels: Record<Kind,string> = { weekly: "주간 업무", schedule: "일정", project: "프로젝트", wiki: "위키", handover: "인수인계" };
export const entrySchema = z.object({
  title: z.string().trim().min(1,"제목을 입력해 주세요.").max(120,"제목은 120자 이내로 입력해 주세요."),
  body: z.string().trim().min(1,"내용을 입력해 주세요.").max(10000,"내용은 10,000자 이내로 입력해 주세요."),
  owner: z.string().trim().min(1,"작성자 또는 담당자를 입력해 주세요.").max(40),
  kind: z.enum(kinds),
  date: z.union([z.literal(""),z.iso.date()]),
  status: z.enum(["open","doing","done"]),
}).superRefine((value,context)=>{ if(value.kind==="schedule"&&!value.date) context.addIssue({code:"custom",path:["date"],message:"일정 날짜를 선택해 주세요."}); });
export type Entry = z.infer<typeof entrySchema> & { id: number; updatedAt: string };
export type ActionState = { ok: boolean; message: string; stamp?: number };
