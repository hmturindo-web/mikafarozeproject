import { NextRequest, NextResponse } from 'next/server';
import { signup } from '@/server/services/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, name, password, companyName } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json({ success: false, error: 'Email, nama, dan password wajib diisi.' }, { status: 400 });
    }

    const result = await signup({ email, name, password, companyName });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error('[POST /api/auth/signup]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
