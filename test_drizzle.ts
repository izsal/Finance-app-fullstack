import { db } from "./lib/db";
import { budgets } from "./lib/schema";
import { eq } from "drizzle-orm";

async function run() {
  try {
    const res = await db.select().from(budgets).where(eq(budgets.userId, "WWE4crXDF2gMdxNgnODIxjjRJTUBnibm"));
    console.log("Success! result:", res);
  } catch (err) {
    console.error("Drizzle Error:", err);
  }
}
run();
