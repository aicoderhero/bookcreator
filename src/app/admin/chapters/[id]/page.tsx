'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, BookOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Chapter {
  id: string;
  title: string;
  order: number;
  bookId: string;
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

export default function ChapterDetailPage() {
  const [formData, setFormData] = useState({
    title: '',
    order: 1,
  });
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetchChapter();
  }, [params.id]);

  const fetchChapter = async () => {
    try {
      const response = await fetch(`/api/chapters/${params.id}`);
      if (response.ok) {
        const data: Chapter = await response.json();
        setChapter(data);
        setFormData({
          title: data.title,
          order: data.order,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch chapter');
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        const data = await response.json();
        setError(data.error || 'Failed to update chapter');
      }
    } catch (error) {
      console.error('Update chapter error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteChapter = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus bab ini?')) return;

    try {
      const response = await fetch(`/api/chapters/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/chapters');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete chapter');
      }
    } catch (error) {
      console.error('Delete chapter error:', error);
      setError('Network error. Please try again.');
    }
  };

  const addPage = () => {
    router.push(`/admin/chapters/${params.id}/pages/new`);
  };

  const editPage = (pageId: string) => {
    router.push(`/admin/pages/${pageId}/edit`);
  };

  if (!chapter) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/chapters">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Bab
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Bab</h1>
            <p className="text-gray-600">Edit informasi bab</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Bab</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Judul *</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Masukkan judul bab"
                />
              </div>

              <div>
                <Label htmlFor="order">Urutan *</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  required
                  min="1"
                  value={formData.order}
                  onChange={handleInputChange}
                  placeholder="Masukkan urutan bab"
                />
              </div>

              <div className="text-sm text-gray-500">
                <p>Buku: {chapter.book.title}</p>
                <p>Dibuat: {new Date(chapter.createdAt).toLocaleDateString('id-ID')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Halaman</CardTitle>
                <Button type="button" onClick={addPage} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Halaman
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {chapter.pages.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Belum ada halaman</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Tambah halaman pertama untuk bab ini.
                  </p>
                  <Button type="button" onClick={addPage} variant="outline">
                    Tambah Halaman Pertama
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {chapter.pages.map((page) => (
                    <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Halaman {page.order}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {page.content.substring(0, 50)}...
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{new Date(page.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editPage(page.id)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || !formData.title}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Bab
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteChapter}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Bab
                </Button>
              </div>
              <Link href="/admin/chapters">
                <Button variant="outline">Batal</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}