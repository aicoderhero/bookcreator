import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pages = await db.page.findMany({
      orderBy: {
        order: 'asc'
      },
      include: {
        chapter: {
          select: {
            title: true,
            book: {
              select: {
                title: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
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

    const { content, order, chapterId } = await request.json();

    if (!content || !order || !chapterId) {
      return NextResponse.json(
        { error: 'Content, order, and chapterId are required' },
        { status: 400 }
      );
    }

    // Check if chapter exists
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId }
    });

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    const page = await db.page.create({
      data: {
        content,
        order: parseInt(order),
        chapterId,
      },
      include: {
        chapter: {
          select: {
            title: true,
            book: {
              select: {
                title: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}