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
    const { title, content, order, chapterId } = await request.json()

    if (!content || !chapterId) {
      return NextResponse.json(
        { error: 'Content and chapterId are required' },
        { status: 400 }
      )
    }

    // Get next order if not provided
    let pageOrder = order
    if (pageOrder === undefined) {
      const lastPage = await db.page.findFirst({
        where: { chapterId },
        orderBy: { order: 'desc' }
      })
      pageOrder = lastPage ? lastPage.order + 1 : 1
    }

    const page = await db.page.create({
      data: {
        title: title || null,
        content,
        order: pageOrder,
        chapterId
      }
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error creating page:', error)
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}