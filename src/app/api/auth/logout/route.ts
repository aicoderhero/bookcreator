import { NextResponse } from 'next/server';
import { clearAuthResponse } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  return clearAuthResponse(response);
}