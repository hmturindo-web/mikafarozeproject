import { NextRequest, NextResponse } from 'next/server';
import { resendCode } from '@/server/services/auth';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ success: false, error: 'Email wajib diisi.' }, { status: 400 });
    const result = await resendCode(email);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[POST /api/auth/resend]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
