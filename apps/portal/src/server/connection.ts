import mariadb, { type Pool } from "mariadb";
export function connectionOptions() {
  if (!process.env.DB_PASSWORD) throw new Error("Database credentials missing");
  return { host: process.env.DB_HOST ?? "mariadb", port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "portal", password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME ?? "portal_db", connectTimeout: 5000,
    acquireTimeout: 7000, connectionLimit: 5, dateStrings: true, bigIntAsNumber: true };
}
const globalDb = globalThis as unknown as { prismPool?: Pool };
export function database() { return globalDb.prismPool ??= mariadb.createPool(connectionOptions()); }
