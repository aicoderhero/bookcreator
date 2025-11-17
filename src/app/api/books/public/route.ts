import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const books = await db.book.findMany({
      where: {
        isPublished: true
      },
      include: {
        authors: {
          include: {
            author: true
          }
        },
        _count: {
          select: {
            chapters: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching published books:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}