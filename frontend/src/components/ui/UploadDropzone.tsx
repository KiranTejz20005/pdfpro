import { useCallback, useState } from 'react';

interface UploadDropzoneProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onFilesSelected: (files: File[]) => void;
}

export default function UploadDropzone({
  accept = '.pdf',
  multiple = false,
  maxSize = 50,
  onFilesSelected,
}: UploadDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (files: File[]): File[] => {
    const maxBytes = maxSize * 1024 * 1024;
    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > maxBytes) {
        setError(`File ${file.name} exceeds ${maxSize}MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    return validFiles;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    const fileArray = Array.from(files);
    const validFiles = validateFiles(multiple ? fileArray : [fileArray[0]]);

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [multiple, maxSize, onFilesSelected]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
        style={{
          border: `2px dashed ${dragActive ? '#2563EB' : '#262626'}`,
          background: dragActive ? 'rgba(37, 99, 235, 0.05)' : '#121212',
          borderRadius: '8px',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>☁️</div>
        <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
          Upload Your File
        </div>
        <div style={{ fontSize: '0.875rem', color: '#A1A1AA', marginBottom: '16px' }}>
          Drag and drop or click to browse
        </div>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: '10px 24px',
            background: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          }}
        >
          Select File
        </button>
        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '12px' }}>
          {accept} • Max {maxSize}MB
        </div>
      </div>

      <input
        id="file-input"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {error && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          color: '#ef4444',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
