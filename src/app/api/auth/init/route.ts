import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const existingAdmin = await db.admin.findFirst({
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists' },
        { status: 400 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const admin = await createAdmin(username, password);

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });

  } catch (error) {
    console.error('Init admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}