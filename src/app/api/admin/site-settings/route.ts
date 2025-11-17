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
    let settings = await db.siteSettings.findUnique({
      where: {
        key: 'defaultHomeMessage'
      }
    })

    if (!settings) {
      // Create default setting if it doesn't exist
      settings = await db.siteSettings.create({
        data: {
          key: 'defaultHomeMessage',
          value: 'Selamat datang di Book Creator. Saat ini belum ada buku yang dipublish.',
          description: 'Default message displayed on homepage when no books are published'
        }
      })
    }

    return NextResponse.json({
      defaultHomeMessage: settings.value
    })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json({ 
      defaultHomeMessage: 'Selamat datang di Book Creator. Saat ini belum ada buku yang dipublish.' 
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const admin = verifyToken(request)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { defaultHomeMessage } = await request.json()

    if (defaultHomeMessage === undefined) {
      return NextResponse.json(
        { error: 'defaultHomeMessage is required' },
        { status: 400 }
      )
    }

    const settings = await db.siteSettings.upsert({
      where: {
        key: 'defaultHomeMessage'
      },
      update: {
        value: defaultHomeMessage
      },
      create: {
        key: 'defaultHomeMessage',
        value: defaultHomeMessage,
        description: 'Default message displayed on homepage when no books are published'
      }
    })

    return NextResponse.json({
      defaultHomeMessage: settings.value
    })
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 })
  }
}