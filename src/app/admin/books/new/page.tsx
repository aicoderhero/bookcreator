'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, Book } from 'lucide-react'

interface Author {
  id: string
  name: string
  role: string
  description?: string
}

export default function NewBook() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [authors, setAuthors] = useState<Author[]>([])
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    description: '',
    published: false
  })

  useEffect(() => {
    checkAuth()
    fetchAuthors()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const fetchAuthors = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/authors', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAuthors(data)
      }
    } catch (error) {
      console.error('Error fetching authors:', error)
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

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/books', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          isbn: formData.isbn || null,
          description: formData.description || null,
          authorIds: selectedAuthors
        }),
      })

      if (response.ok) {
        router.push('/admin/dashboard?tab=books')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create book')
      }
    } catch (error) {
      setError('An error occurred while creating the book')
    } finally {
      setLoading(false)
    }
  }

  const handleAuthorToggle = (authorId: string) => {
    setSelectedAuthors(prev => 
      prev.includes(authorId)
        ? prev.filter(id => id !== authorId)
        : [...prev, authorId]
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
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Book className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Add New Book</h1>
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
              <CardTitle>Create New Book</CardTitle>
              <CardDescription>
                Fill in the book details below. All fields marked with * are required.
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
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter book title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                    placeholder="Enter ISBN (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter book description"
                    rows={4}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Authors</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {authors.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No authors available. Create authors first.</p>
                    ) : (
                      authors.map((author) => (
                        <div key={author.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={author.id}
                            checked={selectedAuthors.includes(author.id)}
                            onCheckedChange={() => handleAuthorToggle(author.id)}
                          />
                          <Label htmlFor={author.id} className="text-sm cursor-pointer">
                            {author.name} ({author.role})
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, published: checked as boolean }))
                    }
                  />
                  <Label htmlFor="published">Publish immediately</Label>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link href="/admin/dashboard?tab=books">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Creating...' : 'Create Book'}
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