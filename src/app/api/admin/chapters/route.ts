import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Verify admin token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const admin = verifyToken(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, bookId, order } = await request.json()

    if (!title || !bookId) {
      return NextResponse.json(
        { error: 'Title and bookId are required' },
        { status: 400 }
      )
    }

    // Get the next order if not provided
    let chapterOrder = order
    if (chapterOrder === undefined) {
      const lastChapter = await db.chapter.findFirst({
        where: { bookId },
        orderBy: { order: 'desc' }
      })
      chapterOrder = lastChapter ? lastChapter.order + 1 : 1
    }

    const chapter = await db.chapter.create({
      data: {
        title,
        bookId,
        order: chapterOrder
      },
      include: {
        pages: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json(chapter)
  } catch (error) {
    console.error('Error creating chapter:', error)
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 })
  }
}