'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, X, Globe, FileText, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SettingsData {
  id: string;
  siteTitle: string;
  logo?: string;
  homeContent?: string;
  metaTitle?: string;
  metaDesc?: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    siteTitle: 'Book Engine',
    homeContent: '',
    metaTitle: '',
    metaDesc: '',
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [currentLogo, setCurrentLogo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data: SettingsData = await response.json();
        setFormData({
          siteTitle: data.siteTitle || 'Book Engine',
          homeContent: data.homeContent || '',
          metaTitle: data.metaTitle || '',
          metaDesc: data.metaDesc || '',
        });
        if (data.logo) {
          setCurrentLogo(data.logo);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview('');
    setCurrentLogo('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let logoUrl = currentLogo;
      
      if (logo) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', logo);
        
        const uploadResponse = await fetch('/api/upload/logo', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          logoUrl = uploadData.url;
        }
      }

      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          logo: logoUrl || null,
        }),
      });

      if (response.ok) {
        setSuccess('Pengaturan berhasil diperbarui!');
        fetchSettings(); // Refresh the data
      } else {
        const data = await response.json();
        setError(data.error || 'Gagal memperbarui pengaturan');
      }
    } catch (error) {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-600">Kelola konfigurasi situs Anda</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Pengaturan Umum
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteTitle">Judul Situs</Label>
                  <Input
                    id="siteTitle"
                    name="siteTitle"
                    type="text"
                    value={formData.siteTitle}
                    onChange={handleInputChange}
                    placeholder="Masukkan judul situs"
                  />
                </div>

                <div>
                  <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
                  <Input
                    id="metaTitle"
                    name="metaTitle"
                    type="text"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    placeholder="Masukkan meta title untuk SEO"
                  />
                </div>

                <div>
                  <Label htmlFor="metaDesc">Meta Description (SEO)</Label>
                  <Textarea
                    id="metaDesc"
                    name="metaDesc"
                    value={formData.metaDesc}
                    onChange={handleInputChange}
                    placeholder="Masukkan meta description untuk SEO"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Konten Halaman Beranda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="homeContent">Konten Halaman Beranda (HTML didukung)</Label>
                  <Textarea
                    id="homeContent"
                    name="homeContent"
                    value={formData.homeContent}
                    onChange={handleInputChange}
                    placeholder="Masukkan konten kustom untuk halaman beranda. Tag HTML didukung."
                    rows={8}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Biarkan kosong untuk menggunakan hero section default. Tag HTML didukung.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="w-5 h-5 mr-2" />
                  Logo Situs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(logoPreview || currentLogo) ? (
                    <div className="relative">
                      <img
                        src={logoPreview || currentLogo}
                        alt="Logo preview"
                        className="w-full h-32 object-contain rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeLogo}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload logo situs</p>
                      <p className="text-sm text-gray-500 mb-4">PNG atau JPG direkomendasikan</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('logo-upload')?.click()}
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
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Pengaturan
                  </>
                )}
              </Button>
              <Link href="/admin">
                <Button variant="outline">Batal</Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}