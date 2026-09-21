"use server";
import { z } from "zod"; import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { createSession, destroySession, verifyPassword } from "@/lib/auth";
export type LoginState = { error?: string } | undefined;
const schema = z.object({ email: z.email().trim().toLowerCase(), password: z.string().min(1) });
export async function login(_state: LoginState, formData: FormData): Promise<LoginState> { const result = schema.safeParse({ email: formData.get("email"), password: formData.get("password") }); if (!result.success) return { error: "Enter a valid email and password." }; const user = await db.user.findUnique({ where: { email: result.data.email } }); if (!user || !(await verifyPassword(result.data.password, user.passwordHash))) return { error: "Invalid email or password." }; await createSession(user.id, user.role); await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }); redirect("/admin"); }
export async function logout() { await destroySession(); redirect("/login"); }
