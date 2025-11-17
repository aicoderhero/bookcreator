'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, Book, User, Calendar } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

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
    pages: {
      id: string
      title?: string
      content: string
      order: number
    }[]
  }[]
}

export default function BookReader() {
  const params = useParams()
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number>(0)
  const [selectedPage, setSelectedPage] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchBook(params.id as string)
    }
  }, [params.id])

  const fetchBook = async (bookId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}`)
      if (response.ok) {
        const data = await response.json()
        setBook(data)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching book:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
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

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Book not found</p>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </div>
      </div>
    )
  }

  const currentChapter = book.chapters[selectedChapter]
  const currentPage = currentChapter?.pages[selectedPage]

  const goToNextPage = () => {
    if (selectedPage < currentChapter.pages.length - 1) {
      setSelectedPage(selectedPage + 1)
    } else if (selectedChapter < book.chapters.length - 1) {
      setSelectedChapter(selectedChapter + 1)
      setSelectedPage(0)
    }
  }

  const goToPreviousPage = () => {
    if (selectedPage > 0) {
      setSelectedPage(selectedPage - 1)
    } else if (selectedChapter > 0) {
      setSelectedChapter(selectedChapter - 1)
      setSelectedPage(book.chapters[selectedChapter - 1].pages.length - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">{book.title}</h1>
                {book.isbn && (
                  <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Table of Contents */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daftar Isi</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {book.chapters.map((chapter, chapterIndex) => (
                      <div key={chapter.id}>
                        <Button
                          variant={selectedChapter === chapterIndex ? "default" : "ghost"}
                          className="w-full justify-start text-left"
                          onClick={() => {
                            setSelectedChapter(chapterIndex)
                            setSelectedPage(0)
                          }}
                        >
                          {chapter.title}
                        </Button>
                        {selectedChapter === chapterIndex && (
                          <div className="ml-4 mt-1 space-y-1">
                            {chapter.pages.map((page, pageIndex) => (
                              <Button
                                key={page.id}
                                variant={selectedPage === pageIndex ? "outline" : "ghost"}
                                size="sm"
                                className="w-full justify-start text-left text-xs"
                                onClick={() => setSelectedPage(pageIndex)}
                              >
                                {page.title || `Halaman ${pageIndex + 1}`}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{currentChapter?.title}</CardTitle>
                    {currentPage?.title && (
                      <CardDescription className="text-lg mt-2">{currentPage.title}</CardDescription>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Halaman {selectedPage + 1} dari {currentChapter?.pages.length || 0}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {currentPage && (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{currentPage.content}</ReactMarkdown>
                  </div>
                )}
                
                <Separator className="my-6" />
                
                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={goToPreviousPage}
                    disabled={selectedChapter === 0 && selectedPage === 0}
                  >
                    Previous
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    Chapter {selectedChapter + 1} - Page {selectedPage + 1}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={goToNextPage}
                    disabled={
                      selectedChapter === book.chapters.length - 1 && 
                      selectedPage === currentChapter.pages.length - 1
                    }
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Book Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Informasi Buku</CardTitle>
              </CardHeader>
              <CardContent>
                {book.description && (
                  <p className="text-sm text-muted-foreground mb-4">{book.description}</p>
                )}
                
                {book.authors.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Penulis:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {book.authors.map((bookAuthor, index) => (
                        <Badge key={index} variant="secondary">
                          {bookAuthor.author.name} ({bookAuthor.author.role})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Dibuat: {new Date(book.createdAt).toLocaleDateString('id-ID')}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}