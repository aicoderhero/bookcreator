'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Book, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Save
} from 'lucide-react'

interface Book {
  id: string
  title: string
  isbn?: string
  description?: string
  coverImage?: string
  published: boolean
  createdAt: string
  authors: {
    author: {
      name: string
      role: string
    }
  }[]
  chapters: {
    id: string
    title: string
    order: number
  }[]
}

interface Author {
  id: string
  name: string
  role: string
  description?: string
  createdAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('books')

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [booksRes, authorsRes] = await Promise.all([
        fetch('/api/admin/books', { headers }),
        fetch('/api/admin/authors', { headers })
      ])

      if (booksRes.ok) {
        const booksData = await booksRes.json()
        setBooks(booksData)
      }

      if (authorsRes.ok) {
        const authorsData = await authorsRes.json()
        setAuthors(authorsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const toggleBookPublish = async (bookId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !currentStatus }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error updating book:', error)
    }
  }

  const deleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting book:', error)
    }
  }

  const deleteAuthor = async (authorId: string) => {
    if (!confirm('Are you sure you want to delete this author?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/authors/${authorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting author:', error)
    }
  }

  // Site Settings Component
  const SiteSettings = () => {
    const [settings, setSettings] = useState({
      defaultHomeMessage: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
      fetchSettings()
    }, [])

    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const response = await fetch('/api/admin/site-settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setSettings({
            defaultHomeMessage: data.defaultHomeMessage || ''
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }

    const handleSave = async () => {
      setLoading(true)
      setError('')

      try {
        const token = localStorage.getItem('adminToken')
        const response = await fetch('/api/admin/site-settings', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        })

        if (response.ok) {
          setError('Settings saved successfully!')
          setTimeout(() => setError(''), 3000)
        } else {
          setError('Failed to save settings')
        }
      } catch (error) {
        setError('An error occurred while saving settings')
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="space-y-6">
        {error && (
          <Alert variant={error.includes('successfully') ? 'default' : 'destructive'}>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="defaultHomeMessage">Default Homepage Message</Label>
          <Textarea
            id="defaultHomeMessage"
            value={settings.defaultHomeMessage}
            onChange={(e) => setSettings(prev => ({ ...prev, defaultHomeMessage: e.target.value }))}
            placeholder="Enter the message to display when no books are published"
            rows={4}
          />
          <p className="text-sm text-muted-foreground">
            This message is shown on the homepage when there are no published books.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Book className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>Loading...</p>
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
            <div className="flex items-center space-x-2">
              <Book className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Site
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="authors">Authors</TabsTrigger>
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Books Management</h2>
              <Link href="/admin/books/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Book
                </Button>
              </Link>
            </div>

            <div className="grid gap-6">
              {books.map((book) => (
                <Card key={book.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {book.title}
                          <Badge variant={book.published ? "default" : "secondary"}>
                            {book.published ? "Published" : "Draft"}
                          </Badge>
                        </CardTitle>
                        {book.isbn && (
                          <CardDescription>ISBN: {book.isbn}</CardDescription>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/books/${book.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/books/${book.id}/chapters`}>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleBookPublish(book.id, book.published)}
                        >
                          {book.published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteBook(book.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {book.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {book.description}
                      </p>
                    )}
                    
                    {book.authors.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Authors:</p>
                        <div className="flex flex-wrap gap-1">
                          {book.authors.map((bookAuthor, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {bookAuthor.author.name} ({bookAuthor.author.role})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{book.chapters.length} chapters</span>
                      <span>Created: {new Date(book.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="authors" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Authors Management</h2>
              <Link href="/admin/authors/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Author
                </Button>
              </Link>
            </div>

            <div className="grid gap-4">
              {authors.map((author) => (
                <Card key={author.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{author.name}</CardTitle>
                        <CardDescription>{author.role}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/authors/${author.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAuthor(author.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {author.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{author.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chapters" className="mt-6">
            <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Chapter Management</h2>
              <p className="text-muted-foreground">
                Select a book from the Books tab to manage its chapters and pages.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Site Settings</CardTitle>
                  <CardDescription>
                    Configure your Book Creator site settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SiteSettings />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}