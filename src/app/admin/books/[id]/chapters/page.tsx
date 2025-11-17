'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  BookOpen,
  GripVertical
} from 'lucide-react'

interface Chapter {
  id: string
  title: string
  order: number
  pages: {
    id: string
    title?: string
    order: number
  }[]
}

interface Book {
  id: string
  title: string
  isbn?: string
  description?: string
  published: boolean
  authors: {
    author: {
      name: string
      role: string
    }
  }[]
  chapters: Chapter[]
}

export default function BookChapters() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [book, setBook] = useState<Book | null>(null)

  useEffect(() => {
    checkAuth()
    if (params.id) {
      fetchBook()
    }
  }, [params.id])

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const fetchBook = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/books/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBook(data)
      } else {
        router.push('/admin/dashboard?tab=books')
      }
    } catch (error) {
      console.error('Error fetching book:', error)
      setError('Failed to load book details')
    } finally {
      setLoading(false)
    }
  }

  const deleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter and all its pages?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/chapters/${chapterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchBook()
      } else {
        setError('Failed to delete chapter')
      }
    } catch (error) {
      setError('An error occurred while deleting the chapter')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>Loading chapters...</p>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Book not found</p>
          <Link href="/admin/dashboard?tab=books">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard?tab=books">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Books
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Chapters</h1>
                  <p className="text-sm text-muted-foreground">{book.title}</p>
                </div>
              </div>
            </div>
            <Link href={`/admin/books/${params.id}/chapters/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Chapter
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {book.chapters.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Chapters Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first chapter for this book.
                </p>
                <Link href={`/admin/books/${params.id}/chapters/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Chapter
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            book.chapters
              .sort((a, b) => a.order - b.order)
              .map((chapter) => (
                <Card key={chapter.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Chapter {chapter.order}: {chapter.title}
                          </CardTitle>
                          <CardDescription>
                            {chapter.pages.length} page{chapter.pages.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/books/${params.id}/chapters/${chapter.id}/pages`}>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Pages
                          </Button>
                        </Link>
                        <Link href={`/admin/books/${params.id}/chapters/${chapter.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteChapter(chapter.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
          )}
        </div>

        {/* Book Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Book Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Title</p>
                <p className="text-sm text-muted-foreground">{book.title}</p>
              </div>
              {book.isbn && (
                <div>
                  <p className="text-sm font-medium">ISBN</p>
                  <p className="text-sm text-muted-foreground">{book.isbn}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={book.published ? "default" : "secondary"}>
                  {book.published ? "Published" : "Draft"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Total Chapters</p>
                <p className="text-sm text-muted-foreground">{book.chapters.length}</p>
              </div>
              {book.description && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">{book.description}</p>
                </div>
              )}
              {book.authors.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium mb-2">Authors</p>
                  <div className="flex flex-wrap gap-1">
                    {book.authors.map((bookAuthor, index) => (
                      <Badge key={index} variant="secondary">
                        {bookAuthor.author.name} ({bookAuthor.author.role})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}