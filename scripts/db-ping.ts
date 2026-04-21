import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const sql = neon(url);
const rows = await sql`select now() as now, current_database() as db, version() as version`;
console.log(rows[0]);
