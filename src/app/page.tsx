'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Book, User, Settings } from 'lucide-react'

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

interface SiteSettings {
  defaultHomeMessage: string
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([])
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ defaultHomeMessage: 'Selamat datang di Book Creator. Saat ini belum ada buku yang dipublish.' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks()
    fetchSiteSettings()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books')
      if (response.ok) {
        const data = await response.json()
        setBooks(data)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch('/api/site-settings')
      if (response.ok) {
        const data = await response.json()
        setSiteSettings(data)
      }
    } catch (error) {
      console.error('Error fetching site settings:', error)
    }
  }

  const publishedBooks = books.filter(book => book.published)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Book className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Book Creator</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/admin/login">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {publishedBooks.length === 0 ? (
          // Default message when no published books
          <div className="text-center py-16">
            <Book className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Tidak Ada Buku yang Dipublish</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {siteSettings.defaultHomeMessage}
            </p>
          </div>
        ) : (
          // Grid of published books
          <div>
            <h2 className="text-3xl font-bold mb-6">Buku yang Tersedia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedBooks.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center mb-4">
                        <Book className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                    {book.isbn && (
                      <CardDescription>ISBN: {book.isbn}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {book.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {book.description}
                      </p>
                    )}
                    
                    {book.authors.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Penulis:</p>
                        <div className="flex flex-wrap gap-1">
                          {book.authors.map((bookAuthor, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {bookAuthor.author.name} ({bookAuthor.author.role})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">
                        {book.chapters.length} Chapter
                      </p>
                    </div>

                    <Link href={`/book/${book.id}`}>
                      <Button className="w-full">
                        Baca Buku
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Book Creator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}