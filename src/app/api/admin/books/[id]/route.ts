import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const book = await db.book.findUnique({
      where: { id: params.id },
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

    const { title, isbn, description, published, authorIds } = await request.json()
    console.log('Update book request:', { title, isbn, description, published, authorIds, id: params.id })

    // Simple update without complex operations
    const updateData: any = {}
    if (title !== undefined && title !== null) updateData.title = title
    if (isbn !== undefined && isbn !== null) updateData.isbn = isbn
    if (description !== undefined && description !== null) updateData.description = description
    if (published !== undefined && published !== null) updateData.published = published

    console.log('Book update data:', updateData)

    const book = await db.book.update({
      where: { id: params.id },
      data: updateData
    })

    console.log('Updated book (basic):', book)

    // Handle authors separately if provided
    if (authorIds !== undefined) {
      console.log('Updating authors with IDs:', authorIds)
      
      // Delete existing relationships
      await db.bookAuthor.deleteMany({
        where: { bookId: params.id }
      })

      // Create new relationships
      if (authorIds.length > 0) {
        await db.bookAuthor.createMany({
          data: authorIds.map((authorId: string) => ({
            bookId: params.id,
            authorId
          }))
        })
      }
    }

    // Fetch final result
    const finalBook = await db.book.findUnique({
      where: { id: params.id },
      include: {
        authors: {
          include: {
            author: true
          }
        }
      }
    })

    console.log('Final updated book:', finalBook)
    return NextResponse.json(finalBook)
  } catch (error) {
    console.error('Error updating book:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ error: 'Failed to update book', details: String(error) }, { status: 500 })
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

    await db.book.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 })
  }
}