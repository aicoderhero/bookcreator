import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chapters = await db.chapter.findMany({
      orderBy: {
        order: 'asc'
      },
      include: {
        book: {
          select: {
            title: true
          }
        },
        _count: {
          select: {
            pages: true
          }
        }
      }
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, bookId } = await request.json();

    if (!title || !bookId) {
      return NextResponse.json(
        { error: 'Title and bookId are required' },
        { status: 400 }
      );
    }

    // Check if book exists
    const book = await db.book.findUnique({
      where: { id: bookId }
    });

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Get the next order number for this book
    const lastChapter = await db.chapter.findFirst({
      where: { bookId },
      orderBy: { order: 'desc' }
    });

    const nextOrder = lastChapter ? lastChapter.order + 1 : 1;

    const chapter = await db.chapter.create({
      data: {
        title,
        description: description || null,
        order: nextOrder,
        bookId,
      },
      include: {
        book: {
          select: {
            title: true
          }
        }
      }
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}