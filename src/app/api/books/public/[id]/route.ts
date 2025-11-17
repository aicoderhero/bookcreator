import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const book = await db.book.findUnique({
      where: { 
        id,
        isPublished: true // Only return published books
      },
      include: {
        authors: {
          include: {
            author: {
              select: {
                name: true
              }
            }
          }
        },
        chapters: {
          orderBy: {
            order: 'asc'
          },
          include: {
            _count: {
              select: {
                pages: true
              }
            }
          }
        }
      }
    });

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching public book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}