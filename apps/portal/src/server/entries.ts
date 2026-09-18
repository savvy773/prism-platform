import "server-only";
import { database } from "./connection";
import type { Entry } from "../features/workspace/model";
export async function listEntries(): Promise<Entry[]> {
  return database().query("SELECT id, kind, title, body, owner, COALESCE(DATE_FORMAT(event_date, '%Y-%m-%d'), '') AS date, status, DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i') AS updatedAt FROM entries ORDER BY updated_at DESC, id DESC LIMIT 500");
}
