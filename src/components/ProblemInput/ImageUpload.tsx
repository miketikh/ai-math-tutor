'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface ImageUploadProps {
  onFileSelect?: (file: File) => void;
  className?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

export default function ImageUpload({ onFileSelect, className = '' }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload JPG, PNG, or PDF files only.';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit. Please upload a smaller file.';
    }

    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFile = (selectedFile: File) => {
    setError(null);

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);

    // Create preview for images (not for PDFs)
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For PDFs, don't create a preview
      setPreview(null);
    }

    // Call the callback if provided
    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFile(droppedFiles[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFile(selectedFiles[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {!file ? (
        // Upload Zone
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all
            ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="File upload"
          />

          <div className="flex flex-col items-center space-y-4">
            {/* Upload Icon */}
            <div className="text-6xl">📤</div>

            {/* Text */}
            <div className="space-y-2">
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                {isDragging ? 'Drop your file here' : 'Drag and drop your file here'}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                or click to browse
              </p>
            </div>

            {/* File requirements */}
            <div className="text-xs text-zinc-500 dark:text-zinc-500">
              <p>Accepts JPG, PNG, PDF</p>
              <p>Max file size: 10MB</p>
            </div>
          </div>
        </div>
      ) : (
        // Preview Zone
        <div className="rounded-lg border border-zinc-300 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="space-y-4">
            {/* Preview or File Info */}
            {preview ? (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 rounded-lg object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg bg-zinc-100 p-8 dark:bg-zinc-800">
                <div className="text-center">
                  <div className="text-6xl">📄</div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    PDF Document
                  </p>
                </div>
              </div>
            )}

            {/* File Info */}
            <div className="space-y-2 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={handleClear}
                  className="ml-4 flex-shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                  aria-label="Clear uploaded file"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
          <div className="flex">
            <div className="flex-shrink-0 text-2xl">❌</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Upload Error
              </h3>
              <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
