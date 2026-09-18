import { listEntries } from "../server/entries";
import { Workspace } from "../features/workspace/workspace";
export const dynamic="force-dynamic";
export default async function Page(){
  try{return <Workspace entries={await listEntries()} connected />;}
  catch{return <Workspace entries={[]} connected={false} />;}
}
