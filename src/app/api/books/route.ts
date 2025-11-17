import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const books = await db.book.findMany({
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
    console.error('Error fetching books:', error);
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

    const { title, description, isbn, authorIds, isPublished } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const book = await db.book.create({
      data: {
        title,
        description,
        isbn,
        isPublished: isPublished || false,
        authors: authorIds && authorIds.length > 0 ? {
          create: authorIds.map((authorId: string) => ({
            author: {
              connect: { id: authorId }
            }
          }))
        } : undefined
      },
      include: {
        authors: {
          include: {
            author: true
          }
        }
      }
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}