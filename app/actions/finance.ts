"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wallets, categories, budgets, transactions } from "@/lib/schema";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function userId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}
export async function getFinanceData() {
  const uid = await userId();
  const [w, c, b, t] = await Promise.all([
    db.select().from(wallets).where(eq(wallets.userId, uid)),
    db.select().from(categories).where(eq(categories.userId, uid)),
    db.select().from(budgets).where(eq(budgets.userId, uid)),
    db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, uid))
      .orderBy(desc(transactions.date)),
  ]);
  return { wallets: w, categories: c, budgets: b, transactions: t };
}
export async function seedDefaults() {
  const uid = await userId();
  const existing = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, uid));
  if (!existing.length)
    await db.insert(wallets).values([
      { userId: uid, name: "Cash", type: "Tunai", balance: 0, color: "amber" },
      {
        userId: uid,
        name: "Bank utama",
        type: "Bank",
        balance: 0,
        color: "teal",
      },
      {
        userId: uid,
        name: "E-wallet",
        type: "E-wallet",
        balance: 0,
        color: "blue",
      },
    ]);
  const cats = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, uid));
  if (!cats.length)
    await db.insert(categories).values([
      { userId: uid, name: "Gaji", type: "income", color: "teal" },
      { userId: uid, name: "Kebutuhan", type: "expense", color: "rose" },
      { userId: uid, name: "Makanan", type: "expense", color: "amber" },
      { userId: uid, name: "Transportasi", type: "expense", color: "violet" },
    ]);
  return getFinanceData();
}
export async function addWallet(form: { name: string; type: string }) {
  const uid = await userId();
  await db
    .insert(wallets)
    .values({
      userId: uid,
      name: form.name.trim(),
      type: form.type,
      balance: 0,
      color: "teal",
    });
  revalidatePath("/");
}
export async function addCategory(form: { name: string; type: string }) {
  const uid = await userId();
  await db
    .insert(categories)
    .values({
      userId: uid,
      name: form.name.trim(),
      type: form.type,
      color: "slate",
    });
  revalidatePath("/");
}
export async function addBudget(form: {
  categoryId: number;
  amount: number;
  month: string;
}) {
  const uid = await userId();
  await db
    .insert(budgets)
    .values({
      userId: uid,
      categoryId: form.categoryId,
      amount: form.amount,
      month: form.month,
    });
  revalidatePath("/");
}
export async function addTransaction(form: {
  walletId: number;
  categoryId: number;
  type: string;
  amount: number;
  description: string;
  date: string;
}) {
  const uid = await userId();
  await db
    .insert(transactions)
    .values({
      userId: uid,
      walletId: form.walletId,
      categoryId: form.categoryId,
      type: form.type,
      amount: form.amount,
      description: form.description.trim(),
      date: new Date(form.date),
    });
  revalidatePath("/");
}
export async function deleteTransaction(id: number) {
  const uid = await userId();
  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, uid)));
  revalidatePath("/");
}
