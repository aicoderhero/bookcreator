'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, X, BookOpen, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Book {
  id: string;
  title: string;
  authors: { author: { name: string } }[];
}

interface Chapter {
  id: string;
  title: string;
  description?: string;
  order: number;
  bookId: string;
  book: {
    title: string;
  };
  _count: {
    pages: number;
  };
}

export default function EditChapterPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bookId: '',
  });
  const [books, setBooks] = useState<Book[]>([]);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetchChapter();
    fetchBooks();
  }, [params.id]);

  const fetchChapter = async () => {
    try {
      const response = await fetch(`/api/chapters/${params.id}`);
      if (response.ok) {
        const data: Chapter = await response.json();
        setChapter(data);
        setFormData({
          title: data.title,
          description: data.description || '',
          bookId: data.bookId,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch chapter');
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
      setError('Network error. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Judul bab wajib diisi');
      return false;
    }

    if (!formData.bookId) {
      setError('Pilih buku terlebih dahulu');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/chapters/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/chapters');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Gagal memperbarui bab');
      }
    } catch (error) {
      console.error('Error updating chapter:', error);
      setError('Terjadi kesalahan saat memperbarui bab');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/chapters">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertDescription>Bab tidak ditemukan</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/chapters">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Bab</h1>
            <p className="text-gray-600">Edit informasi bab</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <BookOpen className="w-4 h-4" />
          <span>{chapter.book.title}</span>
          <span>•</span>
          <FileText className="w-4 h-4" />
          <span>{chapter._count.pages} halaman</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informasi Bab</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bookId">Buku *</Label>
                <Select
                  value={formData.bookId}
                  onValueChange={(value) => handleInputChange('bookId', value)}
                >
                  <SelectTrigger className={error && !formData.bookId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Pilih buku" />
                  </SelectTrigger>
                  <SelectContent>
                    {books.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {error && !formData.bookId && (
                  <p className="text-sm text-red-600">Pilih buku terlebih dahulu</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Judul Bab *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Masukkan judul bab"
                  className={error && !formData.title ? 'border-red-500' : ''}
                />
                {error && !formData.title && (
                  <p className="text-sm text-red-600">Judul bab wajib diisi</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Masukkan deskripsi bab (opsional)"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t">
              <Link href="/admin/chapters">
                <Button variant="outline" disabled={loading}>
                  <X className="w-4 h-4 mr-2" />
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}