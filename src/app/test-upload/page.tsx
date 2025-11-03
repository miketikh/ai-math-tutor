'use client';

import ImageUpload from '@/components/ProblemInput/ImageUpload';

export default function TestUploadPage() {
  const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name, file.type, file.size);
  };

  return (
    <main className="flex-1 bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Image Upload Component Test
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Test the drag-and-drop and file upload functionality
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
            <ImageUpload onFileSelect={handleFileSelect} />
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Test Scenarios:
            </h2>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>✓ Drag and drop an image file (JPG/PNG)</li>
              <li>✓ Click to open file picker</li>
              <li>✓ Upload a valid image (should show preview)</li>
              <li>✓ Upload a PDF (should show PDF icon)</li>
              <li>✓ Try uploading a file over 10MB (should show error)</li>
              <li>✓ Try uploading an invalid file type (should show error)</li>
              <li>✓ Clear an uploaded file</li>
              <li>✓ Check hover states on the upload zone</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
