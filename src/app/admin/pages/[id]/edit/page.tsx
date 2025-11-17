'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Page {
  id: string;
  content: string;
  order: number;
  chapterId: string;
  createdAt: string;
  updatedAt: string;
  chapter: {
    title: string;
    book: {
      title: string;
    };
  };
}

export default function EditPagePage() {
  const [formData, setFormData] = useState({
    content: '',
    order: 1,
  });
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetchPage();
  }, [params.id]);

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/pages/${params.id}`);
      if (response.ok) {
        const data: Page = await response.json();
        setPage(data);
        setFormData({
          content: data.content,
          order: data.order,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch page');
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const response = await fetch(`/api/pages/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/pages');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update page');
      }
    } catch (error) {
      console.error('Update page error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!page) {
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
          <Link href="/admin/pages">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Halaman
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Halaman</h1>
            <p className="text-gray-600">Edit konten halaman</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Halaman</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                placeholder="Masukkan urutan halaman"
              />
            </div>

            <div>
              <Label htmlFor="content">Konten *</Label>
              <Textarea
                id="content"
                name="content"
                required
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Masukkan konten halaman"
                rows={12}
              />
            </div>

            <div className="text-sm text-gray-500">
              <p>Bab: {page?.chapter?.title}</p>
              <p>Buku: {page?.chapter?.book?.title}</p>
              <p>Dibuat: {new Date(page?.createdAt).toLocaleDateString('id-ID')}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-3">
          <Button
            type="submit"
            className="flex-1"
            disabled={loading || !formData.content}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan Halaman
              </>
            )}
          </Button>
          <Link href="/admin/pages">
            <Button variant="outline">Batal</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}