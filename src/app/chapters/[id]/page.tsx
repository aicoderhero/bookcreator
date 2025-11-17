'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, User, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Chapter {
  id: string;
  title: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  book: {
    title: string;
  };
  pages: {
    id: string;
    content: string;
    order: number;
    chapterId: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

export default function PublicChapterPage() {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    fetchChapter();
  }, [params.id]);

  const fetchChapter = async () => {
    try {
      const response = await fetch(`/api/chapters/public/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setChapter(data);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chapter not found</h2>
          <p className="text-gray-600 mb-4">The chapter you're looking for doesn't exist.</p>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href={`/books/${chapter.book.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Book
            </Button>
          </Link>
        </div>

        {/* Chapter Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                Chapter {chapter.order}
              </Badge>
              <CardTitle className="text-2xl">{chapter.title}</CardTitle>
              <p className="text-gray-600 mt-2">
                From: {chapter.book.title}
              </p>
              <div className="flex items-center justify-center text-sm text-gray-500 mt-4">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(chapter.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </CardHeader>
          {chapter.description && (
            <CardContent>
              <div className="text-center">
                <p className="text-gray-600 italic">{chapter.description}</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Chapter Content */}
        <Card>
          <CardHeader>
            <CardTitle>Chapter Content</CardTitle>
          </CardHeader>
          <CardContent>
            {chapter.pages.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                <p className="text-gray-600">This chapter doesn't have any pages yet.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {chapter.pages.map((page, index) => (
                  <div key={page.id} className="border-b pb-8 last:border-b-0">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Page {page.order}
                      </h4>
                      <div className="text-sm text-gray-500">
                        {new Date(page.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: page.content.replace(/\n/g, '<br />') 
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <Link href={`/books/${chapter.book.id}`}>
            <Button variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Back to Book
            </Button>
          </Link>
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