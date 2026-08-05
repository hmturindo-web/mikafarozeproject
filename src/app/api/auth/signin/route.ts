import { NextRequest, NextResponse } from 'next/server';
import { signin } from '@/server/services/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email dan password wajib diisi.' }, { status: 400 });
    }

    const result = await signin({ email, password });

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[POST /api/auth/signin]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
