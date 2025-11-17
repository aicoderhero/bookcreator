'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface Author {
  id: string;
  name: string;
  bio?: string;
}

interface Book {
  id: string;
  title: string;
  description?: string;
  isbn?: string;
  coverArt?: string;
  isPublished: boolean;
  authors: { author: { name: string; id: string } }[];
  chapters: {
    id: string;
    title: string;
    order: number;
    _count: { pages: number };
  }[];
}

export default function EditBookPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isbn: '',
    isPublished: false,
    authorIds: [] as string[],
  });
  const [authors, setAuthors] = useState<Author[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetchBook();
    fetchAuthors();
  }, [params.id]);

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${params.id}`);
      if (response.ok) {
        const data: Book = await response.json();
        setBook(data);
        setFormData({
          title: data.title,
          description: data.description || '',
          isbn: data.isbn || '',
          isPublished: data.isPublished,
          authorIds: data.authors.map(a => a.author.id),
        });
        if (data.coverArt) {
          setCoverPreview(data.coverArt);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch book');
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      setError('Network error. Please try again.');
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/authors');
      if (response.ok) {
        const data = await response.json();
        setAuthors(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch authors');
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAuthorToggle = (authorId: string) => {
    setFormData(prev => ({
      ...prev,
      authorIds: prev.authorIds.includes(authorId)
        ? prev.authorIds.filter(id => id !== authorId)
        : [...prev.authorIds, authorId]
    }));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverArt(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCover = () => {
    setCoverArt(null);
    setCoverPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Form data submitted:', formData);
    console.log('Cover art file:', coverArt);

    try {
      let coverArtUrl = book?.coverArt;
      
      if (coverArt) {
        console.log('Uploading cover...');
        const uploadFormData = new FormData();
        uploadFormData.append('file', coverArt);
        
        const uploadResponse = await fetch('/api/upload/cover', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          coverArtUrl = uploadData.url;
          console.log('Cover uploaded successfully:', uploadData.url);
        } else {
          const uploadError = await uploadResponse.json();
          console.error('Upload error:', uploadError);
          setError(uploadError.error || 'Failed to upload cover');
          setLoading(false);
          return;
        }
      }

      console.log('Updating book with data:', {
        ...formData,
        coverArt: coverArtUrl || undefined,
      });

      const response = await fetch(`/api/books/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          coverArt: coverArtUrl || undefined,
        }),
      });

      console.log('Update response status:', response.status);

      if (response.ok) {
        console.log('Book updated successfully');
        router.push('/admin/books');
      } else {
        const data = await response.json();
        console.error('Update error:', data);
        setError(data.error || 'Failed to update book');
      }
    } catch (error) {
      console.error('Update book error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const editChapter = (chapterId: string) => {
    router.push(`/admin/chapters/${chapterId}/edit`);
  };

  if (!book) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/books">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Buku
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Buku</h1>
            <p className="text-gray-600">Edit informasi buku</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Buku</CardTitle>
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
                    placeholder="Masukkan judul buku"
                  />
                </div>

                <div>
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    name="isbn"
                    type="text"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    placeholder="Masukkan ISBN (opsional)"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Masukkan deskripsi buku"
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublished"
                    name="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isPublished: checked as boolean }))
                    }
                  />
                  <Label htmlFor="isPublished">Terbitkan segera</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Penulis</CardTitle>
              </CardHeader>
              <CardContent>
                {authors.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Tidak ada penulis ditemukan</p>
                    <Link href="/admin/authors/new">
                      <Button variant="outline">Buat Penulis Pertama</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {authors.map((author) => (
                      <div key={author.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={author.id}
                          checked={formData.authorIds.includes(author.id)}
                          onCheckedChange={() => handleAuthorToggle(author.id)}
                        />
                        <Label htmlFor={author.id} className="flex-1 cursor-pointer">
                          <div>
                            <span className="font-medium">{author.name}</span>
                            {author.bio && (
                              <p className="text-sm text-gray-500">{author.bio}</p>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bab</CardTitle>
              </CardHeader>
              <CardContent>
                {book.chapters.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Belum ada bab</p>
                    <p className="text-sm text-gray-600">
                      Gunakan menu "Chapters" di sidebar untuk menambah bab
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {book.chapters.map((chapter) => (
                      <div key={chapter.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Bab {chapter.order}: {chapter.title}</div>
                          <div className="text-sm text-gray-500">{chapter._count.pages} halaman</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editChapter(chapter.id)}
                        >
                          Edit
                        </Button>
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
                <CardTitle>Cover Buku</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coverPreview ? (
                    <div className="relative">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeCover}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload cover buku</p>
                      <p className="text-sm text-gray-500 mb-4">JPG atau PNG, rasio 6:19 direkomendasikan</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                        id="cover-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('cover-upload')?.click()}
                      >
                        Pilih File
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || !formData.title}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Buku
                  </>
                )}
              </Button>
              <Link href="/admin/books">
                <Button variant="outline">Batal</Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}