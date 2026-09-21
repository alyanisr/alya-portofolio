import "server-only";
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";

const scrypt = promisify(scryptCallback); const cookieName = "alya-admin-session"; const maxAge = 60 * 60 * 8;
type Session = { userId: string; role: Role; expiresAt: number };
function secret() { const value = process.env.AUTH_SECRET; if (!value || value.length < 32) throw new Error("AUTH_SECRET must be configured with at least 32 characters."); return value; }
function encode(session: Session) { const payload = Buffer.from(JSON.stringify(session)).toString("base64url"); return `${payload}.${createHmac("sha256", secret()).update(payload).digest("base64url")}`; }
function decode(value?: string): Session | null { if (!value) return null; const [payload, signature] = value.split("."); if (!payload || !signature) return null; const expected = createHmac("sha256", secret()).update(payload).digest("base64url"); if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null; try { const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session; return session.expiresAt > Date.now() ? session : null; } catch { return null; } }
export async function hashPassword(password: string) { const salt = randomBytes(16).toString("hex"); const hash = (await scrypt(password, salt, 64)) as Buffer; return `scrypt$${salt}$${hash.toString("hex")}`; }
export async function verifyPassword(password: string, stored: string) { const [algorithm, salt, expected] = stored.split("$"); if (algorithm !== "scrypt" || !salt || !expected) return false; const derived = (await scrypt(password, salt, 64)) as Buffer; const expectedBuffer = Buffer.from(expected, "hex"); return derived.length === expectedBuffer.length && timingSafeEqual(derived, expectedBuffer); }
export async function createSession(userId: string, role: Role) { (await cookies()).set(cookieName, encode({ userId, role, expiresAt: Date.now() + maxAge * 1000 }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge }); }
export async function destroySession() { (await cookies()).delete(cookieName); }
export async function currentUser() { const session = decode((await cookies()).get(cookieName)?.value); return session ? db.user.findFirst({ where: { id: session.userId }, select: { id: true, name: true, email: true, role: true } }) : null; }
export async function requireAdmin() { const user = await currentUser(); if (!user || user.role !== Role.ADMIN) redirect("/login"); return user; }
