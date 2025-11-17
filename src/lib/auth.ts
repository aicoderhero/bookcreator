import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createAdmin(username: string, password: string) {
  const hashedPassword = await hashPassword(password);
  return db.admin.create({
    data: {
      username,
      password: hashedPassword,
    },
  });
}

export async function getAdmin(username: string) {
  return db.admin.findUnique({
    where: { username },
  });
}

export async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    // For simplicity, using token as username (in production, use JWT)
    const admin = await getAdmin(token);
    return admin;
  } catch (error) {
    return null;
  }
}

export function createAuthResponse(username: string, response: NextResponse) {
  response.cookies.set('admin-token', username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return response;
}

export function clearAuthResponse(response: NextResponse) {
  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
  return response;
}