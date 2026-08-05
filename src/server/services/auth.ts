/**
 * MIKAFAROZE — Custom Auth Service
 * JWT + bcrypt + email verification (Resend)
 *
 * Replaces Clerk — email/password + verification code flow
 */

import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcryptjs';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { users } from '@/server/db/schema';

// ── Config ───────────────────────────────────────────────────────────────────
const JWT_SECRET  = new TextEncoder().encode(process.env.JWT_SECRET || 'mikafarozesecret-change-in-production-32ch');
const JWT_EXPIRES = '7d';

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

// postgres-js connection — parses DATABASE_URL to handle Windows username bug
function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL env var not set');

  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):?(\d*)\/?/);
  if (!match) throw new Error('Invalid DATABASE_URL format');

  const [, user, password, host, port = '5432'] = match;
  return postgres({
    host, database: 'postgres',
    user, password,
    port: parseInt(port),
    ssl: 'require',
    connect_timeout: 10,
    max: 10,
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface UserRecord {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  email_verified: boolean;
  role: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// ── Password Helpers ─────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

// ── JWT Helpers ───────────────────────────────────────────────────────────────
export async function signJWT(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ── 6-digit code generator ───────────────────────────────────────────────────
function generateCode(): string {
  return Math.floor(100_000 + Math.random() * 900_000).toString();
}

// ── Email sending (Resend) ────────────────────────────────────────────────────
async function sendVerificationEmail(email: string, code: string, name: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Auth] RESEND_API_KEY not set — skipping email send');
    console.log(`[Auth] Verification code for ${email}: ${code}`);
    return;
  }

  const RESEND = getResend();
  const { error } = await RESEND.emails.send({
    from: 'MIKAFAROZE <noreply@mikafaroze.com>',
    to: email,
    subject: 'Kode Verifikasi MIKAFAROZE',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="color: #7c3aed;">MIKAFAROZE</h2>
        <p>Halo <strong>${name}</strong>,</p>
        <p>Gunakan kode verifikasi berikut:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7c3aed; padding: 16px; text-align: center; background: #f5f3ff; border-radius: 8px; margin: 24px 0;">
          ${code}
        </div>
        <p style="font-size: 13px; color: #6b7280;">Kode berlaku 10 menit. Jangan bagikan kode ini kepada siapapun.</p>
      </div>
    `,
  });

  if (error) {
    console.error('[Resend] Email send failed:', error.message);
    throw new Error('Failed to send verification email');
  }
}

// ── User lookup (raw SQL — bypasses drizzle/pg driver issue) ─────────────────
async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const db = getDb();
  try {
    const [row] = await db`
      SELECT id, email, name, password_hash, email_verified, role
      FROM users
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;
    return row as UserRecord ?? null;
  } finally {
    await db.end();
  }
}

async function findUserById(id: string): Promise<UserRecord | null> {
  const db = getDb();
  try {
    const [row] = await db`
      SELECT id, email, name, password_hash, email_verified, role
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `;
    return row as UserRecord ?? null;
  } finally {
    await db.end();
  }
}

async function createUser(params: {
  email: string; name: string; passwordHash: string;
}): Promise<{ id: string; email: string }> {
  const db = getDb();
  const id = uuidv4();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  try {
    await db`
      INSERT INTO users (id, email, name, password_hash, email_verified, verification_code, verification_code_expires_at, role)
      VALUES (
        ${id},
        ${params.email.toLowerCase()},
        ${params.name},
        ${params.passwordHash},
        false,
        ${code},
        ${expiresAt}::timestamptz,
        'USER'
      )
    `;
    await sendVerificationEmail(params.email, code, params.name);
    return { id, email: params.email };
  } finally {
    await db.end();
  }
}

// ── SIGN UP ───────────────────────────────────────────────────────────────────
export async function signup(params: {
  email: string;
  name: string;
  password: string;
  companyName?: string;
}): Promise<{ success: true; message: string } | { success: false; error: string }> {
  // Check existing user
  const existing = await findUserByEmail(params.email);
  if (existing) {
    if (existing.email_verified) {
      return { success: false, error: 'Email sudah terdaftar. Silakan sign in.' };
    }
    // Resend code for unverified user
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const db = getDb();
    await db`UPDATE users SET verification_code = ${code}, verification_code_expires_at = ${expiresAt}::timestamptz WHERE email = ${params.email.toLowerCase()}`;
    await db.end();
    await sendVerificationEmail(params.email, code, params.name);
    return { success: true, message: 'Kode verifikasi baru sudah dikirim.' };
  }

  if (params.password.length < 8) {
    return { success: false, error: 'Password minimal 8 karakter.' };
  }

  const passwordHash = await hashPassword(params.password);
  const { id } = await createUser({ email: params.email, name: params.name, passwordHash });

  return {
    success: true,
    message: `Akun dibuat! Kami sudah kirim kode verifikasi ke ${params.email}.`,
  };
}

// ── VERIFY CODE ───────────────────────────────────────────────────────────────
export async function verifyCode(params: {
  email: string;
  code: string;
}): Promise<{ success: true; token: string; user: { id: string; email: string; name: string; role: string } } | { success: false; error: string }> {
  const db = getDb();
  try {
    const [row] = await db`
      SELECT id, email, name, password_hash, email_verified, role,
             verification_code, verification_code_expires_at
      FROM users
      WHERE email = ${params.email.toLowerCase()}
      LIMIT 1
    `;

    if (!row) return { success: false, error: 'Email tidak ditemukan.' };

    const record = row as UserRecord & { verification_code: string | null; verification_code_expires_at: string | null };

    if (record.email_verified) {
      return { success: false, error: 'Email sudah diverifikasi.' };
    }

    if (!record.verification_code || record.verification_code !== params.code) {
      return { success: false, error: 'Kode tidak valid.' };
    }

    if (record.verification_code_expires_at && new Date(record.verification_code_expires_at) < new Date()) {
      return { success: false, error: 'Kode sudah kedaluwarsa. Minta kode baru.' };
    }

    // Mark verified + clear code
    await db`UPDATE users SET email_verified = true, verification_code = NULL, verification_code_expires_at = NULL WHERE id = ${record.id}`;

    const token = await signJWT({ userId: record.id, email: record.email, role: record.role || 'USER' });

    return {
      success: true,
      token,
      user: { id: record.id, email: record.email, name: record.name, role: record.role || 'USER' },
    };
  } finally {
    await db.end();
  }
}

// ── SIGN IN ───────────────────────────────────────────────────────────────────
export async function signin(params: {
  email: string;
  password: string;
}): Promise<{ success: true; token: string; user: { id: string; email: string; name: string; role: string } } | { success: false; error: string }> {
  const user = await findUserByEmail(params.email);

  if (!user) {
    return { success: false, error: 'Email atau password salah.' };
  }

  if (!user.password_hash) {
    return { success: false, error: 'Akun ini belum mengatur password. Gunakan metode login yang sudah pernah digunakan.' };
  }

  if (!user.email_verified) {
    return { success: false, error: 'Email belum diverifikasi. Cek inbox untuk kode verifikasi.' };
  }

  const valid = await compare(params.password, user.password_hash);
  if (!valid) {
    return { success: false, error: 'Email atau password salah.' };
  }

  const token = await signJWT({ userId: user.id, email: user.email, role: user.role || 'USER' });

  return {
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role || 'USER' },
  };
}

// ── RESEND CODE (forgot password / resend verification) ────────────────────────
export async function resendCode(email: string): Promise<{ success: true; message: string } | { success: false; error: string }> {
  const user = await findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'Email tidak ditemukan.' };
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const db = getDb();
  await db`UPDATE users SET verification_code = ${code}, verification_code_expires_at = ${expiresAt}::timestamptz WHERE id = ${user.id}`;
  await db.end();

  await sendVerificationEmail(email, code, user.name);
  return { success: true, message: 'Kode verifikasi baru sudah dikirim.' };
}
