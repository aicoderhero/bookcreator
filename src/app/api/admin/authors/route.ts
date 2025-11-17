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

export async function GET(request: NextRequest) {
  const admin = verifyToken(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const authors = await db.author.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(authors)
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = verifyToken(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, role, description } = await request.json()

    const author = await db.author.create({
      data: {
        name,
        role,
        description
      }
    })

    return NextResponse.json(author)
  } catch (error) {
    console.error('Error creating author:', error)
    return NextResponse.json({ error: 'Failed to create author' }, { status: 500 })
  }
}