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
  if (!existing.length) {
    await db.insert(wallets).values([
      { userId: uid, name: "Tunai / Cash", type: "Tunai", balance: 0, color: "emerald" },
      {
        userId: uid,
        name: "BCA / Bank Utama",
        type: "Bank",
        balance: 0,
        color: "teal",
      },
      {
        userId: uid,
        name: "GoPay / OVO / Dana",
        type: "E-wallet",
        balance: 0,
        color: "indigo",
      },
    ]);
  }

  const cats = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, uid));
  if (!cats.length) {
    await db.insert(categories).values([
      { userId: uid, name: "Gaji & Pendapatan", type: "income", color: "emerald" },
      { userId: uid, name: "Investasi & Passive", type: "income", color: "teal" },
      { userId: uid, name: "Makanan & Minuman", type: "expense", color: "amber" },
      { userId: uid, name: "Belanja Kebutuhan", type: "expense", color: "rose" },
      { userId: uid, name: "Transportasi & Bensin", type: "expense", color: "violet" },
      { userId: uid, name: "Tagihan & Utilitas", type: "expense", color: "cyan" },
      { userId: uid, name: "Hiburan & Rekreasi", type: "expense", color: "pink" },
      { userId: uid, name: "Kesehatan & Edukasi", type: "expense", color: "blue" },
    ]);
  }
  return getFinanceData();
}

// WALLET ACTIONS
export async function addWallet(form: { name: string; type: string; balance?: number; color?: string }) {
  const uid = await userId();
  await db.insert(wallets).values({
    userId: uid,
    name: form.name.trim(),
    type: form.type || "Bank",
    balance: form.balance || 0,
    color: form.color || "teal",
  });
  revalidatePath("/");
  return getFinanceData();
}

export async function updateWallet(form: { id: number; name: string; type: string; color?: string; balance?: number }) {
  const uid = await userId();
  await db
    .update(wallets)
    .set({
      name: form.name.trim(),
      type: form.type,
      color: form.color || "teal",
      ...(form.balance !== undefined ? { balance: form.balance } : {}),
    })
    .where(and(eq(wallets.id, form.id), eq(wallets.userId, uid)));
  revalidatePath("/");
  return getFinanceData();
}

export async function deleteWallet(id: number) {
  const uid = await userId();
  await db
    .delete(wallets)
    .where(and(eq(wallets.id, id), eq(wallets.userId, uid)));
  revalidatePath("/");
  return getFinanceData();
}

// CATEGORY ACTIONS
export async function addCategory(form: { name: string; type: string; color?: string }) {
  const uid = await userId();
  await db.insert(categories).values({
    userId: uid,
    name: form.name.trim(),
    type: form.type,
    color: form.color || "slate",
  });
  revalidatePath("/");
  return getFinanceData();
}

export async function updateCategory(form: { id: number; name: string; type: string; color?: string }) {
  const uid = await userId();
  await db
    .update(categories)
    .set({
      name: form.name.trim(),
      type: form.type,
      color: form.color || "slate",
    })
    .where(and(eq(categories.id, form.id), eq(categories.userId, uid)));
  revalidatePath("/");
  return getFinanceData();
}

export async function deleteCategory(id: number) {
  const uid = await userId();
  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, uid)));
  revalidatePath("/");
  return getFinanceData();
}

// BUDGET ACTIONS
export async function upsertBudget(form: {
  categoryId: number;
  amount: number;
  month: string;
}) {
  const uid = await userId();
  const existing = await db
    .select()
    .from(budgets)
    .where(
      and(
        eq(budgets.userId, uid),
        eq(budgets.categoryId, form.categoryId),
        eq(budgets.month, form.month)
      )
    );

  if (existing.length > 0) {
    await db
      .update(budgets)
      .set({ amount: form.amount })
      .where(and(eq(budgets.id, existing[0].id), eq(budgets.userId, uid)));
  } else {
    await db.insert(budgets).values({
      userId: uid,
      categoryId: form.categoryId,
      amount: form.amount,
      month: form.month,
    });
  }
  revalidatePath("/");
  return getFinanceData();
}

export async function addBudget(form: {
  categoryId: number;
  amount: number;
  month: string;
}) {
  return upsertBudget(form);
}

export async function deleteBudget(id: number) {
  const uid = await userId();
  await db
    .delete(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, uid)));
  revalidatePath("/");
  return getFinanceData();
}

// TRANSACTION ACTIONS
export async function addTransaction(form: {
  walletId: number;
  categoryId: number;
  type: string;
  amount: number;
  description: string;
  date: string;
}) {
  const uid = await userId();
  await db.insert(transactions).values({
    userId: uid,
    walletId: form.walletId,
    categoryId: form.categoryId,
    type: form.type,
    amount: form.amount,
    description: form.description.trim(),
    date: new Date(form.date),
  });
  revalidatePath("/");
  return getFinanceData();
}

export async function updateTransaction(form: {
  id: number;
  walletId: number;
  categoryId: number;
  type: string;
  amount: number;
  description: string;
  date: string;
}) {
  const uid = await userId();
  await db
    .update(transactions)
    .set({
      walletId: form.walletId,
      categoryId: form.categoryId,
      type: form.type,
      amount: form.amount,
      description: form.description.trim(),
      date: new Date(form.date),
    })
    .where(and(eq(transactions.id, form.id), eq(transactions.userId, uid)));
  revalidatePath("/");
  return getFinanceData();
}

export async function deleteTransaction(id: number) {
  const uid = await userId();
  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, uid)));
  revalidatePath("/");
  return getFinanceData();
}

// TRANSFER ACTION
export async function transferBetweenWallets(form: {
  fromWalletId: number;
  toWalletId: number;
  amount: number;
  description?: string;
  date: string;
}) {
  const uid = await userId();
  const [fromW, toW] = await Promise.all([
    db.select().from(wallets).where(and(eq(wallets.id, form.fromWalletId), eq(wallets.userId, uid))),
    db.select().from(wallets).where(and(eq(wallets.id, form.toWalletId), eq(wallets.userId, uid))),
  ]);

  if (!fromW.length || !toW.length) throw new Error("Dompet tidak ditemukan");

  // ensure a category for transfer exists
  let transferCat = await db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, uid), eq(categories.name, "Transfer Saldo")));

  let categoryId = transferCat[0]?.id;
  if (!categoryId) {
    const [inserted] = await db
      .insert(categories)
      .values({
        userId: uid,
        name: "Transfer Saldo",
        type: "expense",
        color: "indigo",
      })
      .returning();
    categoryId = inserted.id;
  }

  const descFrom = form.description?.trim()
    ? `${form.description.trim()} (Transfer ke ${toW[0].name})`
    : `Transfer keluar ke ${toW[0].name}`;
  const descTo = form.description?.trim()
    ? `${form.description.trim()} (Transfer dari ${fromW[0].name})`
    : `Transfer masuk dari ${fromW[0].name}`;

  const dateObj = new Date(form.date);

  await Promise.all([
    db.insert(transactions).values({
      userId: uid,
      walletId: form.fromWalletId,
      categoryId: categoryId,
      type: "expense",
      amount: form.amount,
      description: descFrom,
      date: dateObj,
    }),
    db.insert(transactions).values({
      userId: uid,
      walletId: form.toWalletId,
      categoryId: categoryId,
      type: "income",
      amount: form.amount,
      description: descTo,
      date: dateObj,
    }),
  ]);

  revalidatePath("/");
  return getFinanceData();
}
