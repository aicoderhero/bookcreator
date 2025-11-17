import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const author = await db.author.findUnique({
      where: { id: params.id }
    })

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    return NextResponse.json(author)
  } catch (error) {
    console.error('Error fetching author:', error)
    return NextResponse.json({ error: 'Failed to fetch author' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Simple token check
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const { name, role, description } = await request.json()
    console.log('Update author request:', { name, role, description, id: params.id })

    // Simple update without complex validation
    const updateData: any = {}
    if (name !== undefined && name !== null) updateData.name = name
    if (role !== undefined && role !== null) updateData.role = role
    if (description !== undefined && description !== null) updateData.description = description

    console.log('Update data:', updateData)

    const author = await db.author.update({
      where: { id: params.id },
      data: updateData
    })

    console.log('Updated author:', author)
    return NextResponse.json(author)
  } catch (error) {
    console.error('Error updating author:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ error: 'Failed to update author', details: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    await db.author.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Author deleted successfully' })
  } catch (error) {
    console.error('Error deleting author:', error)
    return NextResponse.json({ error: 'Failed to delete author' }, { status: 500 })
  }
}