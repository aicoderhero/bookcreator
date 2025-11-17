'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface Chapter {
  id: string;
  title: string;
  order: number;
  book: {
    title: string;
  };
  _count: {
    pages: number;
  };
}

export default function NewPagePage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    chapterId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      const response = await fetch('/api/chapters');
      if (response.ok) {
        const data = await response.json();
        setChapters(data);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Konten halaman wajib diisi';
    }

    if (!formData.chapterId) {
      newErrors.chapterId = 'Pilih bab terlebih dahulu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);

    try {
      // Get the next order number for this chapter
      const chapterResponse = await fetch(`/api/chapters/${formData.chapterId}`);
      if (chapterResponse.ok) {
        const chapter = await chapterResponse.json();
        const nextOrder = chapter.pages ? chapter.pages.length + 1 : 1;

        const response = await fetch('/api/pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: formData.content,
            chapterId: formData.chapterId,
            order: nextOrder,
          }),
        });

        if (response.ok) {
          router.push('/admin/pages');
        } else {
          const error = await response.json();
          setErrors({ submit: error.message || 'Gagal membuat halaman baru' });
        }
      }
    } catch (error) {
      console.error('Error creating page:', error);
      setErrors({ submit: 'Terjadi kesalahan saat membuat halaman' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/pages">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Halaman Baru</h1>
            <p className="text-gray-600">Buat halaman baru untuk bab</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Halaman</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="chapterId">Bab *</Label>
              <Select
                value={formData.chapterId}
                onValueChange={(value) => handleInputChange('chapterId', value)}
              >
                <SelectTrigger className={errors.chapterId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Pilih bab" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span>Chapter {chapter.order}: {chapter.title}</span>
                        <span className="text-gray-500">({chapter.book.title})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.chapterId && (
                <p className="text-sm text-red-600">{errors.chapterId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Konten Halaman *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Masukkan konten halaman"
                rows={12}
                className={errors.content ? 'border-red-500' : ''}
              />
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.submit}
              </div>
            )}

            <div className="flex items-center justify-end space-x-4 pt-4 border-t">
              <Link href="/admin/pages">
                <Button variant="outline" disabled={saving}>
                  <X className="w-4 h-4 mr-2" />
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Menyimpan...' : 'Simpan Halaman'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}