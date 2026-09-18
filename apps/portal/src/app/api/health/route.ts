import { database } from "../../../server/connection";
export const dynamic="force-dynamic";
export async function GET(){try{await database().query("SELECT 1 FROM entries LIMIT 1");return Response.json({status:"ok",database:"connected"});}catch{return Response.json({status:"unavailable"},{status:503});}}
