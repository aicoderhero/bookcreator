'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, User, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Author {
  name: string;
}

interface Chapter {
  id: string;
  title: string;
  description?: string;
  order: number;
  _count: {
    pages: number;
  };
}

interface Book {
  id: string;
  title: string;
  description?: string;
  isbn?: string;
  coverArt?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  authors: { author: Author }[];
  chapters: Chapter[];
}

export default function BookPage() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    fetchBook();
  }, [params.id]);

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/public/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setBook(data);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev =>
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Book not found</h2>
          <p className="text-gray-600 mb-4">The book you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Book Engine</h1>
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Books
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center text-center">
                  {book.coverArt ? (
                    <img
                      src={book.coverArt}
                      alt={book.title}
                      className="w-32 h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-32 h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                      <BookOpen className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <CardTitle className="text-xl">{book.title}</CardTitle>
                  <div className="flex flex-wrap gap-1 mt-2 justify-center">
                    {book.authors.map((author, index) => (
                      <Badge key={index} variant="secondary">
                        {author.author.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {book.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 text-sm">{book.description}</p>
                  </div>
                )}
                
                {book.isbn && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">ISBN</h3>
                    <p className="text-gray-600 text-sm">{book.isbn}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {book.chapters.length} chapters
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(book.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chapters */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Table of Contents</CardTitle>
              </CardHeader>
              <CardContent>
                {book.chapters.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters yet</h3>
                    <p className="text-gray-600">This book doesn't have any chapters available.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {book.chapters.map((chapter) => (
                      <div key={chapter.id} className="border rounded-lg">
                        <button
                          onClick={() => toggleChapter(chapter.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {chapter.order}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Chapter {chapter.order}: {chapter.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {chapter._count.pages} pages
                              </p>
                            </div>
                          </div>
                          {expandedChapters.includes(chapter.id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        
                        {expandedChapters.includes(chapter.id) && (
                          <div className="px-4 pb-4 border-t">
                            {chapter.description ? (
                              <p className="text-gray-600 text-sm mt-3 mb-3">
                                {chapter.description}
                              </p>
                            ) : (
                              <p className="text-gray-500 text-sm mt-3 mb-3 italic">
                                No description available for this chapter.
                              </p>
                            )}
                            <Link href={`/chapters/${chapter.id}`}>
                              <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                Read Chapter
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Book Engine. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}