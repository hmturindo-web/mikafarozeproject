import { NextRequest, NextResponse } from 'next/server';
import { verifyCode } from '@/server/services/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email dan kode wajib diisi.' }, { status: 400 });
    }

    const result = await verifyCode({ email, code });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[POST /api/auth/verify]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
