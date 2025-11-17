import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const book = await db.book.findUnique({
      where: {
        id: params.id,
        published: true
      },
      include: {
        authors: {
          include: {
            author: true
          }
        },
        chapters: {
          orderBy: {
            order: 'asc'
          },
          include: {
            pages: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 })
  }
}