'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { AppDocument } from '@/context/AppContext';

interface FileUploadProps {
  onFileChange: (file: File | null, content: string) => void;
  onFileRemove: () => void;
  file: AppDocument | null;
  acceptedFileTypes?: { [key: string]: string[] };
  labelText?: string;
}

export function FileUpload({
  onFileChange,
  onFileRemove,
  file,
  acceptedFileTypes = { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
  labelText = 'Drag & drop your document here, or click to select file'
}: FileUploadProps) {

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const currentFile = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onFileChange(currentFile, content);
      };
      reader.readAsText(currentFile);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: false,
  });

  return (
    <div className="w-full">
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80 transition-colors',
            isDragActive ? 'border-primary bg-primary/10' : 'border-border'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground font-semibold">{labelText}</p>
            <p className="text-xs text-muted-foreground">{Object.values(acceptedFileTypes).flat().join(', ')}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full h-24 border rounded-lg p-4 bg-secondary/50">
          <div className="flex items-center gap-4">
            <FileIcon className="w-8 h-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{file.name}</span>
              <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onFileRemove}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
