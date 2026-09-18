import test from "node:test";
import assert from "node:assert/strict";
import { entrySchema } from "./model";
const valid={title:"팀 공유",body:"진행 내용",owner:"개발팀",kind:"weekly",date:"",status:"open"};
test("trim and accept Korean entry",()=>{assert.equal(entrySchema.parse({...valid,title:"  팀 공유  "}).title,"팀 공유");});
test("schedule requires a real date",()=>{assert.equal(entrySchema.safeParse({...valid,kind:"schedule"}).success,false);assert.equal(entrySchema.safeParse({...valid,kind:"schedule",date:"2026-02-30"}).success,false);assert.equal(entrySchema.safeParse({...valid,kind:"schedule",date:"2026-09-18"}).success,true);});
test("reject whitespace, huge body and unsupported types",()=>{for(const delta of [{title:"  "},{body:"x".repeat(10001)},{kind:"unknown"},{status:"archived"},{owner:""}])assert.equal(entrySchema.safeParse({...valid,...delta}).success,false);});
