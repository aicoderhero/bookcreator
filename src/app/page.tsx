'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, User, Calendar, Search, Menu, X, Settings, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Book {
  id: string;
  title: string;
  description?: string;
  isbn?: string;
  coverArt?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  authors: { author: { name: string } }[];
  _count: {
    chapters: number;
  };
}

interface Settings {
  siteTitle: string;
  logo?: string;
  homeContent?: string;
  metaTitle?: string;
  metaDesc?: string;
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchSettings();
    checkAdmin();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books/public');
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      setIsAdmin(data.authenticated);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.authors.some(author => author.author.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
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
                {settings?.logo ? (
                  <img src={settings.logo} alt="Logo" className="h-8 w-auto" />
                ) : (
                  <BookOpen className="h-8 w-8 text-blue-600" />
                )}
                <h1 className="text-xl font-bold text-gray-900">
                  {settings?.siteTitle || 'Book Engine'}
                </h1>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                  Admin
                </Link>
              )}
              {!isAdmin && (
                <Link href="/login" className="text-gray-700 hover:text-blue-600">
                  <LogIn className="w-4 h-4" />
                </Link>
              )}
            </nav>

            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Home
              </Link>
              {isAdmin && (
                <Link href="/admin" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                  Admin
                </Link>
              )}
              {!isAdmin && (
                <Link href="/login" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      {settings?.homeContent ? (
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: settings.homeContent }}
            />
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-r from-blue-400 to-blue-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                Welcome to {settings?.siteTitle || 'Book Engine'}
              </h1>
              <p className="text-xl mb-8">
                Discover and read amazing books from our collection
              </p>
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-5 w-5" />
                  <Input
                    placeholder="Search books, authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-white placeholder:text-blue-100 bg-white/20 border-white/30 focus:bg-white/30 focus:border-white/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Published Books ({filteredBooks.length})
          </h2>
          {!settings?.homeContent && (
            <div className="max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search books, authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No books found matching your search.' : 'No published books yet.'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try a different search term.' : 'Check back later for new content.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex space-x-4">
                    {book.coverArt ? (
                      <img
                        src={book.coverArt}
                        alt={book.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {book.authors.map((author, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {author.author.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {book.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {book.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {book._count.chapters} chapters
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(book.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Link href={`/books/${book.id}`}>
                    <Button className="w-full">
                      Read Book
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 {settings?.siteTitle || 'Book Engine'}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}