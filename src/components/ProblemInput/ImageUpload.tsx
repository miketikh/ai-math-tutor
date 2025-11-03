'use client';

import { useState, useCallback, ChangeEvent } from 'react';
import { useDropzone, FileRejection, DropzoneOptions } from 'react-dropzone';

interface ImageUploadProps {
  onFileSelect?: (file: File) => void;
  onProblemExtracted?: (problemText: string, latex?: string) => void;
  className?: string;
}

interface ParseImageResponse {
  success: boolean;
  problemText: string;
  latex?: string;
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf'],
};

export default function ImageUpload({ onFileSelect, onProblemExtracted, className = '' }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedProblem, setExtractedProblem] = useState<string | null>(null);
  const [extractedLatex, setExtractedLatex] = useState<string | null>(null);
  const [editableText, setEditableText] = useState<string>('');

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const parseImage = async (imageBase64: string) => {
    setIsLoading(true);
    setError(null);

    const TIMEOUT_MS = 10000; // 10 seconds

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS);
      });

      // Create fetch promise
      const fetchPromise = fetch('/api/parse-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageBase64 }),
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      const data: ParseImageResponse = await response.json();

      if (data.success && data.problemText) {
        setExtractedProblem(data.problemText);
        setExtractedLatex(data.latex || null);
        setEditableText(data.problemText);

        // Call callback if provided
        if (onProblemExtracted) {
          onProblemExtracted(data.problemText, data.latex);
        }
      } else {
        setError(data.error || 'Failed to parse image. Please try typing the problem manually.');
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'TIMEOUT') {
        setError('Parsing took too long. Please try again or type the problem manually.');
      } else {
        setError('Failed to parse image. Please try typing the problem manually.');
      }
      console.error('Error parsing image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFile = useCallback(async (selectedFile: File) => {
    setError(null);
    setExtractedProblem(null);
    setExtractedLatex(null);
    setEditableText('');
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

    // Automatically parse the image
    try {
      const base64 = await convertFileToBase64(selectedFile);
      await parseImage(base64);
    } catch (err) {
      console.error('Error converting file to base64:', err);
      setError('Failed to process file. Please try again.');
    }
  }, [onFileSelect]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      const errors = rejection.errors;

      if (errors.some(e => e.code === 'file-too-large')) {
        setError('File size exceeds 10MB limit. Please upload a smaller file.');
      } else if (errors.some(e => e.code === 'file-invalid-type')) {
        setError('Invalid file type. Please upload JPG, PNG, or PDF files only.');
      } else if (errors.some(e => e.code === 'too-many-files')) {
        setError('Only one file can be uploaded at a time.');
      } else {
        setError('File upload failed. Please try again.');
      }
      return;
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0]);
    }
  }, [handleFile]);

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    multiple: false,
    disabled: false,
  };

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone(dropzoneOptions);

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setExtractedProblem(null);
    setExtractedLatex(null);
    setEditableText('');
    setIsLoading(false);
  };

  const handleEditableTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditableText(e.target.value);
    // Notify parent of the updated text
    if (onProblemExtracted) {
      onProblemExtracted(e.target.value, extractedLatex || undefined);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {!file ? (
        // Upload Zone
        <div
          {...getRootProps()}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${
              isDragAccept
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : isDragReject
                ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                : isDragActive
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
                : 'border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
            }
          `}
        >
          <input {...getInputProps()} aria-label="File upload" />

          <div className="flex flex-col items-center space-y-4">
            {/* Upload Icon */}
            <div className="text-6xl">📤</div>

            {/* Text */}
            <div className="space-y-2">
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                {isDragActive ? 'Drop your file here' : 'Drag and drop your file here'}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                or click to browse
              </p>
            </div>

            {/* File requirements */}
            <div className="text-xs text-zinc-500 dark:text-zinc-500">
              <p>Accepts JPG, PNG, PDF</p>
              <p>Max file size: 10MB</p>
              <p className="mt-1 text-zinc-400">Only 1 file at a time</p>
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

            {/* Loading State */}
            {isLoading && (
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent dark:border-blue-400"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Parsing your problem...
                    </p>
                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                      This may take a few seconds
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success State - Extracted Problem */}
            {!isLoading && extractedProblem && (
              <div className="space-y-3">
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
                  <div className="flex">
                    <div className="flex-shrink-0 text-xl">✅</div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                        Problem Extracted Successfully
                      </h3>
                      <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                        Review and edit the text below if needed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Editable Problem Text */}
                <div>
                  <label
                    htmlFor="extracted-text"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Extracted Problem
                  </label>
                  <textarea
                    id="extracted-text"
                    value={editableText}
                    onChange={handleEditableTextChange}
                    className="w-full min-h-[120px] rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                    placeholder="Extracted problem text will appear here..."
                  />
                  {extractedLatex && (
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      LaTeX notation detected: {extractedLatex}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
          <div className="flex">
            <div className="flex-shrink-0 text-2xl">❌</div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Parsing Error
              </h3>
              <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
              <div className="mt-3">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  Alternative: You can type the problem manually using the text input option above.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
