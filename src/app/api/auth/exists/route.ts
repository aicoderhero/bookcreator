import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const admin = await db.admin.findFirst({
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return NextResponse.json({ 
      adminExists: admin !== null 
    });
  } catch (error) {
    console.error('Error checking admin existence:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}