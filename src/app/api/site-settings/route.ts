import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
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