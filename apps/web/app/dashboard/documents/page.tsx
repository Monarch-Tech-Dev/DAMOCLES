'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Upload,
  FileText,
  Download,
  Trash2,
  X,
  File,
  Image as ImageIcon,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

interface Document {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  fileType: string
  description?: string
  gdprRequestId?: string
  debtId?: string
  uploadedAt: string
}

interface UploadProgress {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<UploadProgress[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [apiUrl, setApiUrl] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    const url = typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_API_URL || '');
    setApiUrl(url)
  }, [])

  useEffect(() => {
    if (apiUrl) {
      fetchDocuments()
    }
  }, [apiUrl])

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${apiUrl}/api/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      } else {
        toast.error('Kunne ikke laste dokumenter')
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Nettverksfeil ved lasting av dokumenter')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const validFiles = Array.from(files).filter(file => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} er for stor (maks 10MB)`)
        return false
      }

      // Check MIME type
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/heic', 'image/heif']
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} har ugyldig filtype (kun PDF og bilder)`)
        return false
      }

      return true
    })

    if (validFiles.length > 0) {
      uploadFiles(validFiles)
    }
  }

  const uploadFiles = async (files: File[]) => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Du må være logget inn')
      return
    }

    // Initialize upload progress for all files
    const newUploads: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }))
    setUploading(prev => [...prev, ...newUploads])

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', 'general')
      formData.append('description', `Uploaded ${file.name}`)

      try {
        const xhr = new XMLHttpRequest()

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            setUploading(prev => prev.map((upload, idx) =>
              upload.file === file
                ? { ...upload, progress }
                : upload
            ))
          }
        })

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status === 200 || xhr.status === 201) {
            setUploading(prev => prev.map((upload, idx) =>
              upload.file === file
                ? { ...upload, progress: 100, status: 'success' as const }
                : upload
            ))
            toast.success(`${file.name} lastet opp`)
            fetchDocuments()
          } else {
            throw new Error('Upload failed')
          }
        })

        xhr.addEventListener('error', () => {
          setUploading(prev => prev.map((upload, idx) =>
            upload.file === file
              ? { ...upload, status: 'error' as const, error: 'Opplasting feilet' }
              : upload
          ))
          toast.error(`Kunne ikke laste opp ${file.name}`)
        })

        xhr.open('POST', `${apiUrl}/api/documents/upload`)
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        xhr.send(formData)

      } catch (error) {
        setUploading(prev => prev.map((upload, idx) =>
          upload.file === file
            ? { ...upload, status: 'error' as const, error: 'Nettverksfeil' }
            : upload
        ))
        toast.error(`Kunne ikke laste opp ${file.name}`)
      }
    }

    // Clear completed uploads after 3 seconds
    setTimeout(() => {
      setUploading(prev => prev.filter(u => u.status === 'uploading'))
    }, 3000)
  }

  const handleDownload = async (documentId: string, filename: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${apiUrl}/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Dokument lastet ned')
      } else {
        toast.error('Kunne ikke laste ned dokument')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Nettverksfeil ved nedlasting')
    }
  }

  const handleDelete = async (documentId: string, filename: string) => {
    if (!confirm(`Er du sikker på at du vil slette ${filename}?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${apiUrl}/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Dokument slettet')
        fetchDocuments()
      } else {
        toast.error('Kunne ikke slette dokument')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Nettverksfeil ved sletting')
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [apiUrl])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-blue-600" />
    }
    if (mimeType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-600" />
    }
    return <File className="w-8 h-8 text-slate-600" />
  }

  const filteredDocuments = filterType === 'all'
    ? documents
    : documents.filter(doc => doc.fileType === filterType)

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-white/60 rounded-xl w-1/4 mb-6"></div>
            <div className="h-48 bg-white/60 rounded-2xl mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white/60 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Dokumenter</h1>
          <p className="text-slate-600">
            Last opp og administrer dokumenter knyttet til gjeldssaker
          </p>
        </div>

        {/* Upload Area */}
        <Card
          className={`mb-8 border-2 border-dashed transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 bg-white/80 backdrop-blur-sm'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-12 text-center">
            <Upload className={`w-12 h-12 mx-auto mb-4 ${
              isDragging ? 'text-blue-600' : 'text-slate-400'
            }`} />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Dra og slipp filer her
            </h3>
            <p className="text-slate-600 mb-4">
              eller klikk for å velge filer
            </p>
            <p className="text-sm text-slate-500 mb-6">
              PDF, PNG, JPG, HEIC (maks 10MB per fil)
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.heic,.heif"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 py-2 cursor-pointer transition-colors"
            >
              Velg filer
            </label>
          </CardContent>
        </Card>

        {/* Upload Progress */}
        {uploading.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Laster opp...</h2>
            {uploading.map((upload, idx) => (
              <Card key={idx} className="bg-white/80 backdrop-blur-sm border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3 flex-1">
                      {getFileIcon(upload.file.type)}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{upload.file.name}</p>
                        <p className="text-sm text-slate-600">{formatFileSize(upload.file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {upload.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {upload.status === 'error' && (
                        <X className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-sm font-medium">
                        {upload.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        upload.status === 'success' ? 'bg-green-600' :
                        upload.status === 'error' ? 'bg-red-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                  {upload.error && (
                    <p className="text-sm text-red-600 mt-2">{upload.error}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 sm:mb-0">
            Mine dokumenter ({filteredDocuments.length})
          </h2>
          <div className="flex space-x-2">
            {['all', 'gdpr', 'debt', 'general'].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
              >
                {type === 'all' ? 'Alle' :
                 type === 'gdpr' ? 'GDPR' :
                 type === 'debt' ? 'Gjeld' : 'Generelt'}
              </Button>
            ))}
          </div>
        </div>

        {/* Document List */}
        {filteredDocuments.length > 0 ? (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4 flex-1">
                      {getFileIcon(doc.mimeType)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{doc.originalName}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{doc.fileType}</Badge>
                          <span className="text-sm text-slate-600">{formatFileSize(doc.size)}</span>
                          <span className="text-sm text-slate-500" suppressHydrationWarning>
                            {new Date(doc.uploadedAt).toLocaleDateString('no-NO')}
                          </span>
                        </div>
                        {doc.description && (
                          <p className="text-sm text-slate-600 mt-1">{doc.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(doc.id, doc.originalName)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Last ned
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(doc.id, doc.originalName)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {filterType === 'all' ? 'Ingen dokumenter funnet' : 'Ingen dokumenter i denne kategorien'}
              </h3>
              <p className="text-slate-600">
                {filterType === 'all'
                  ? 'Last opp ditt første dokument ovenfor'
                  : 'Prøv å endre filter eller last opp et nytt dokument'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Totalt dokumenter</p>
                  <p className="text-2xl font-bold text-slate-900">{documents.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total størrelse</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
                  </p>
                </div>
                <Upload className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">GDPR dokumenter</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {documents.filter(d => d.fileType === 'gdpr').length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
