'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, FileText } from 'lucide-react'

export default function NewChapter() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookTitle, setBookTitle] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    order: 1
  })

  useEffect(() => {
    checkAuth()
    if (params.id) {
      fetchBookInfo()
    }
  }, [params.id])

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const fetchBookInfo = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/books/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBookTitle(data.title)
        // Set next chapter order
        const nextOrder = data.chapters.length + 1
        setFormData(prev => ({ ...prev, order: nextOrder }))
      } else {
        router.push('/admin/dashboard?tab=books')
      }
    } catch (error) {
      console.error('Error fetching book info:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.title.trim()) {
      setError('Title is required')
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
      const response = await fetch('/api/admin/chapters', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          bookId: params.id,
          order: formData.order
        }),
      })

      if (response.ok) {
        router.push(`/admin/books/${params.id}/chapters`)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create chapter')
      }
    } catch (error) {
      setError('An error occurred while creating the chapter')
    } finally {
      setLoading(false)
    }
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
                  <h1 className="text-xl font-bold">Add New Chapter</h1>
                  <p className="text-sm text-muted-foreground">{bookTitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create New Chapter</CardTitle>
              <CardDescription>
                Fill in the chapter details below. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Chapter Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter chapter title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Chapter Order *</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                    placeholder="Enter chapter order (1, 2, 3, ...)"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    This determines the order of chapters in the book
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link href={`/admin/books/${params.id}/chapters`}>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Creating...' : 'Create Chapter'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}