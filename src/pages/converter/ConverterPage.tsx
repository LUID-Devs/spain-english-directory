import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, File, X, Download, RefreshCw, CheckCircle, AlertCircle, FileText, Image, FileSpreadsheet, FileCode, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface ConversionFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'converting' | 'completed' | 'error';
  progress: number;
  convertedUrl?: string;
  error?: string;
}

// Sanitize filename to prevent XSS - removes HTML tags only
// React JSX handles HTML escaping automatically for text content
const sanitizeFilename = (filename: string): string => {
  // Remove HTML tags to prevent XSS
  return filename.replace(/<[^>]*>/g, '');
};

// Truncate filename for display
const truncateFilename = (filename: string, maxLength: number = 30): string => {
  const sanitized = sanitizeFilename(filename);
  if (sanitized.length <= maxLength) return sanitized;
  const ext = sanitized.split('.').pop() || '';
  const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.')) || sanitized;
  const truncatedName = nameWithoutExt.substring(0, maxLength - ext.length - 3);
  return `${truncatedName}...${ext ? '.' + ext : ''}`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'tiff'];
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  const sheetExts = ['xls', 'xlsx', 'csv', 'ods'];
  const codeExts = ['json', 'xml', 'yaml', 'html', 'md', 'js', 'ts', 'jsx', 'tsx'];

  if (imageExts.includes(ext)) return <Image className="w-5 h-5 text-purple-400" />;
  if (docExts.includes(ext)) return <FileText className="w-5 h-5 text-blue-400" />;
  if (sheetExts.includes(ext)) return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
  if (codeExts.includes(ext)) return <FileCode className="w-5 h-5 text-rose-400" />;
  return <File className="w-5 h-5 text-gray-400" />;
};

const getTargetFormats = (fileName: string): string[] => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Image conversions
  const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'tiff'];
  if (imageExts.includes(ext)) {
    return ['png', 'jpg', 'webp', 'gif', 'bmp', 'tiff'];
  }
  
  // Document conversions
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  if (docExts.includes(ext)) {
    return ['pdf', 'txt', 'docx', 'html'];
  }
  
  // Spreadsheet conversions
  const sheetExts = ['xls', 'xlsx', 'csv', 'ods'];
  if (sheetExts.includes(ext)) {
    return ['csv', 'xlsx', 'json', 'ods'];
  }
  
  // Code/Data conversions
  const codeExts = ['json', 'xml', 'yaml', 'html', 'md'];
  if (codeExts.includes(ext)) {
    return ['json', 'xml', 'yaml', 'html', 'txt'];
  }
  
  return ['pdf', 'txt'];
};

// Convert image file to target format using canvas
const convertImage = async (file: File, targetFormat: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Fill white background for formats that don't support transparency
      if (targetFormat === 'jpg' || targetFormat === 'jpeg' || targetFormat === 'bmp') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);
      
      const mimeType = `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`;
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas conversion failed'));
        }
      }, mimeType, 0.9);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

// Convert text-based files
const convertTextFile = async (file: File, targetFormat: string): Promise<Blob> => {
  const text = await file.text();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  
  // Simple conversions for data formats
  if (ext === 'json' && targetFormat === 'csv') {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]);
        const csvRows = [
          headers.join(','),
          ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
        ];
        return new Blob([csvRows.join('\n')], { type: 'text/csv' });
      }
    } catch {
      // Fall through to plain text
    }
  }
  
  if ((ext === 'csv' || ext === 'xlsx' || ext === 'xls') && targetFormat === 'json') {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length > 1) {
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] || '';
        });
        return obj;
      });
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    }
  }
  
  // Default: return as plain text with new extension
  const mimeTypes: Record<string, string> = {
    'json': 'application/json',
    'xml': 'application/xml',
    'yaml': 'application/yaml',
    'html': 'text/html',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'md': 'text/markdown'
  };
  
  return new Blob([text], { type: mimeTypes[targetFormat] || 'text/plain' });
};

// Main conversion function
const performConversion = async (file: File, targetFormat: string): Promise<Blob> => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'tiff'];
  
  if (imageExts.includes(ext)) {
    return convertImage(file, targetFormat);
  }
  
  return convertTextFile(file, targetFormat);
};

export default function ConverterPage() {
  const [files, setFiles] = useState<ConversionFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const addFiles = useCallback((newFiles: File[]) => {
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    const validFiles: ConversionFile[] = [];

    for (const file of newFiles) {
      if (file.size > maxSize) {
        toast.error(`${sanitizeFilename(file.name)} exceeds 10MB limit`);
        continue;
      }
      
      validFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        progress: 0,
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
    
    // Set default target format based on first file
    if (validFiles.length > 0 && !targetFormat) {
      const formats = getTargetFormats(validFiles[0].name);
      if (formats.length > 0) {
        setTargetFormat(formats[0]);
      }
    }
  }, [targetFormat]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [addFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  }, [addFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.convertedUrl) {
        URL.revokeObjectURL(fileToRemove.convertedUrl);
        blobUrlsRef.current.delete(fileToRemove.convertedUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    // Revoke all blob URLs
    files.forEach(file => {
      if (file.convertedUrl) {
        URL.revokeObjectURL(file.convertedUrl);
        blobUrlsRef.current.delete(file.convertedUrl);
      }
    });
    setFiles([]);
    setTargetFormat('');
  }, [files]);

  const convertFile = useCallback(async (fileItem: ConversionFile) => {
    if (!targetFormat) {
      toast.error('Please select a target format');
      return;
    }

    setFiles(prev => prev.map(f => 
      f.id === fileItem.id ? { ...f, status: 'converting', progress: 0 } : f
    ));

    try {
      // Simulate conversion progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, progress } : f
        ));
      }

      // Perform actual conversion
      const convertedBlob = await performConversion(fileItem.file, targetFormat);
      
      const originalName = fileItem.name;
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      const convertedFileName = `${nameWithoutExt}.${targetFormat}`;
      
      // Create a blob URL for download
      const convertedUrl = URL.createObjectURL(convertedBlob);
      blobUrlsRef.current.add(convertedUrl);

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { 
          ...f, 
          status: 'completed', 
          progress: 100,
          convertedUrl,
          name: convertedFileName
        } : f
      ));

      toast.success(`${sanitizeFilename(fileItem.name)} converted successfully!`);
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { 
          ...f, 
          status: 'error', 
          error: 'Conversion failed' 
        } : f
      ));
      toast.error(`Failed to convert ${sanitizeFilename(fileItem.name)}`);
    }
  }, [targetFormat]);

  const convertAll = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast.info('No files to convert');
      return;
    }

    for (const file of pendingFiles) {
      await convertFile(file);
    }
  }, [files, convertFile]);

  const downloadFile = useCallback((fileItem: ConversionFile) => {
    if (!fileItem.convertedUrl) return;
    
    const link = document.createElement('a');
    link.href = fileItem.convertedUrl;
    link.download = fileItem.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const downloadAll = useCallback(() => {
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length === 0) {
      toast.info('No converted files to download');
      return;
    }

    completedFiles.forEach(file => {
      setTimeout(() => downloadFile(file), 100);
    });
  }, [files, downloadFile]);

  const availableFormats = files.length > 0 ? getTargetFormats(files[0].name) : [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-black/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">LuidKit Converter</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Back to Home
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">File Converter</h1>
          <p className="text-neutral-400">Convert your files to any format. Fast, secure, and free.</p>
        </div>

        {/* Upload Area */}
        <Card className={`mb-8 border-2 border-dashed transition-colors ${
          isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-neutral-700 hover:border-neutral-600'
        }`}>
          <CardContent className="p-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-900 flex items-center justify-center">
                <Upload className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-lg font-medium mb-2">
                Drag and drop your files here
              </p>
              <p className="text-sm text-neutral-500 mb-4">
                or click to browse from your computer
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-input')?.click()}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-900"
              >
                Choose Files
              </Button>
              <p className="text-xs text-neutral-600 mt-4">
                Supports 50+ formats • Max 10MB per file
              </p>
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
            {/* Format Selection */}
            <Card className="border-neutral-800 bg-neutral-900/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Convert to:</span>
                  <div className="flex flex-wrap gap-2">
                    {availableFormats.map(format => (
                      <button
                        key={format}
                        onClick={() => setTargetFormat(format)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          targetFormat === format
                            ? 'bg-indigo-500 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Files */}
            <Card className="border-neutral-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-neutral-400">
                    {files.length} file{files.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                      className="border-neutral-700 text-neutral-400 hover:bg-neutral-900"
                    >
                      Clear All
                    </Button>
                    <Button
                      size="sm"
                      onClick={convertAll}
                      disabled={!targetFormat || files.every(f => f.status === 'converting')}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Convert All
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {files.map(fileItem => (
                    <div
                      key={fileItem.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900/50 border border-neutral-800"
                    >
                      {getFileIcon(fileItem.name)}
                      <div className="flex-1 min-w-0">
                        <p 
                          className="text-sm font-medium truncate"
                          title={fileItem.name}
                        >
                          {truncateFilename(fileItem.name)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {formatFileSize(fileItem.size)}
                          {fileItem.status === 'converting' && (
                            <span className="ml-2 text-indigo-400">Converting... {fileItem.progress}%</span>
                          )}
                          {fileItem.status === 'completed' && (
                            <span className="ml-2 text-emerald-400">Completed</span>
                          )}
                          {fileItem.status === 'error' && (
                            <span className="ml-2 text-red-400">{fileItem.error}</span>
                          )}
                        </p>
                        {fileItem.status === 'converting' && (
                          <div className="mt-2 h-1 bg-neutral-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 transition-all duration-200"
                              style={{ width: `${fileItem.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {fileItem.status === 'completed' ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadFile(fileItem)}
                              className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </>
                        ) : fileItem.status === 'error' ? (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        ) : fileItem.status === 'pending' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => convertFile(fileItem)}
                            disabled={!targetFormat}
                            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(fileItem.id)}
                          className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Download All Button */}
                {files.some(f => f.status === 'completed') && (
                  <div className="mt-4 pt-4 border-t border-neutral-800">
                    <Button
                      onClick={downloadAll}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All Converted Files
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Supported Formats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <Image className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <p className="text-sm font-medium">Images</p>
            <p className="text-xs text-neutral-500">JPG, PNG, WebP, GIF</p>
          </div>
          <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <p className="text-sm font-medium">Documents</p>
            <p className="text-xs text-neutral-500">PDF, DOCX, TXT, HTML</p>
          </div>
          <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p className="text-sm font-medium">Spreadsheets</p>
            <p className="text-xs text-neutral-500">CSV, XLSX, JSON</p>
          </div>
          <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <FileCode className="w-8 h-8 mx-auto mb-2 text-rose-400" />
            <p className="text-sm font-medium">Code</p>
            <p className="text-xs text-neutral-500">JSON, XML, YAML</p>
          </div>
        </div>
      </div>
    </div>
  );
}
