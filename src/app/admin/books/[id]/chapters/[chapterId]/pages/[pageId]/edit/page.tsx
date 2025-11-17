'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, FileText } from 'lucide-react'

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

export default function EditPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [page, setPage] = useState<Page | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    order: 1
  })

  useEffect(() => {
    checkAuth()
    if (params.pageId) {
      fetchPage()
    }
  }, [params.pageId])

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const fetchPage = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const [chapterResponse, pageResponse] = await Promise.all([
        fetch(`/api/admin/chapters/${params.chapterId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }),
        fetch(`/api/admin/pages/${params.pageId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        })
      ])
      
      if (chapterResponse.ok && pageResponse.ok) {
        const chapterData = await chapterResponse.json()
        const pageData = await pageResponse.json()
        setChapter(chapterData)
        setPage(pageData)
        setFormData({
          title: pageData.title || '',
          content: pageData.content || '',
          order: pageData.order
        })
      } else {
        router.push(`/admin/books/${params.id}/chapters/${params.chapterId}/pages`)
      }
    } catch (error) {
      console.error('Error fetching page:', error)
      router.push(`/admin/books/${params.id}/chapters/${params.chapterId}/pages`)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.content.trim()) {
      setError('Content is required')
      setLoading(false)
      return
    }

    if (formData.order < 1) {
      setError('Order must be at least 1')
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/pages/${params.pageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title || null,
          content: formData.content,
          order: formData.order
        }),
      })

      if (response.ok) {
        router.push(`/admin/books/${params.id}/chapters/${params.chapterId}/pages`)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update page')
      }
    } catch (error) {
      setError('An error occurred while updating page')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>Loading page details...</p>
        </div>
      </div>
    )
  }

  if (!chapter || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Page not found</p>
          <Link href={`/admin/books/${params.id}/chapters/${params.chapterId}/pages`}>
            <Button>Back to Pages</Button>
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
              <Link href={`/admin/books/${params.id}/chapters/${params.chapterId}/pages`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Pages
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Edit Page</h1>
                  <p className="text-sm text-muted-foreground">{chapter.title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Page: {page.title || `Page ${page.order}`}</CardTitle>
              <CardDescription>
                Update the page content and details below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Page Title</Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter page title (optional)"
                    />
                    <p className="text-sm text-muted-foreground">
                      Leave blank to use "Page {order}" as title
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">Page Order *</Label>
                    <Input
                      id="order"
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                      placeholder="Enter page order (1, 2, 3, ...)"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      This determines the order of pages in the chapter
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter page content using Markdown or HTML"
                    rows={15}
                    className="font-mono text-sm"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Supports Markdown formatting. Use **bold**, *italic*, # headings, etc.
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link href={`/admin/books/${params.id}/chapters/${params.chapterId}/pages`}>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Updating...' : 'Update Page'}
                  </Button>
                </div>
              </div>
            </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}