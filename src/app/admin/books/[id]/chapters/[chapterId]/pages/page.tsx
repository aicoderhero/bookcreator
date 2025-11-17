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
  GripVertical,
  Eye
} from 'lucide-react'

interface Page {
  id: string
  title?: string
  order: number
  content: string
}

interface Chapter {
  id: string
  title: string
  order: number
  pages: Page[]
  book: {
    id: string
    title: string
  }
}

export default function ChapterPages() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chapter, setChapter] = useState<Chapter | null>(null)

  useEffect(() => {
    checkAuth()
    if (params.chapterId) {
      fetchChapter()
    }
  }, [params.chapterId])

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const fetchChapter = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/chapters/${params.chapterId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setChapter(data)
      } else {
        router.push(`/admin/books/${params.id}/chapters`)
      }
    } catch (error) {
      console.error('Error fetching chapter:', error)
      setError('Failed to load chapter details')
    } finally {
      setLoading(false)
    }
  }

  const deletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchChapter()
      } else {
        setError('Failed to delete page')
      }
    } catch (error) {
      setError('An error occurred while deleting page')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>Loading pages...</p>
        </div>
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Chapter not found</p>
          <Link href={`/admin/books/${params.id}/chapters`}>
            <Button>Back to Chapters</Button>
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
              <Link href={`/admin/books/${params.id}/chapters`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Chapters
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Pages</h1>
                  <p className="text-sm text-muted-foreground">{chapter.title}</p>
                </div>
              </div>
            </div>
            <Link href={`/admin/books/${params.id}/chapters/${params.chapterId}/pages/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Page
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
          {chapter.pages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pages Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first page for this chapter.
                </p>
                <Link href={`/admin/books/${params.id}/chapters/${params.chapterId}/pages/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Page
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            chapter.pages
              .sort((a, b) => a.order - b.order)
              .map((page) => (
                <Card key={page.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Page {page.order}: {page.title || 'Untitled'}
                          </CardTitle>
                          <CardDescription>
                            Order: {page.order}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/books/${params.id}/chapters/${params.chapterId}/pages/${page.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/book/${params.id}?chapter=${chapter.order - 1}&page=${page.order - 1}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePage(page.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {page.content ? (
                        page.content.length > 200 
                          ? `${page.content.substring(0, 200)}...`
                          : page.content
                      ) : (
                        'No content'
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>

        {/* Chapter Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Chapter Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Chapter Title</p>
                <p className="text-sm text-muted-foreground">{chapter.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Chapter Order</p>
                <p className="text-sm text-muted-foreground">{chapter.order}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Pages</p>
                <p className="text-sm text-muted-foreground">{chapter.pages.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Book</p>
                <p className="text-sm text-muted-foreground">{chapter.book.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}