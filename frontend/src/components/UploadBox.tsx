import React, { useCallback, useState, useRef } from 'react';
import { UploadCloud, Camera, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface UploadBoxProps {
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

export function UploadBox({ onFilesSelected, className }: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setPreview(URL.createObjectURL(file));
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  }, [onFilesSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(null);
    onFilesSelected([]);
  };

  return (
    <div 
      className={cn(
        "relative rounded-xl border-2 border-dashed transition-colors p-8 flex flex-col items-center justify-center text-center overflow-hidden cursor-pointer",
        isDragging 
          ? "border-primary bg-primary/5 dark:bg-primary/10" 
          : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800",
        preview ? "p-4 cursor-default" : "",
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !preview && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
        multiple
      />
      <input 
        type="file" 
        className="hidden" 
        ref={cameraInputRef}
        onChange={handleChange}
        accept="image/*"
        capture="environment"
      />
      
      {preview ? (
        <div className="relative w-full max-w-sm rounded-lg overflow-hidden group">
          <img src={preview} alt="Preview" className="w-full h-auto object-cover rounded-lg shadow-sm" />
          <button 
            onClick={removeImage}
            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="p-4 bg-white dark:bg-slate-700 rounded-full shadow-sm mb-4 pointer-events-none">
            <UploadCloud className="w-8 h-8 text-primary dark:text-primary-light" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 pointer-events-none">Upload package images</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs pointer-events-none">
            Drag and drop images here, or click to browse. Supported formats: JPG, PNG.
          </p>
          
          <div className="flex items-center gap-4 relative z-20">
            <button 
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-sm font-medium shadow-sm text-slate-700 dark:text-slate-200 pointer-events-auto hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors"
            >
              Browse Files
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-sm pointer-events-auto hover:bg-primary-dark transition-colors"
            >
              <Camera className="w-4 h-4" />
              Open Camera
            </button>
          </div>
        </>
      )}
    </div>
  );
}
