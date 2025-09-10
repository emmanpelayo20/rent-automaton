import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { DocumentType } from '@/lib/types';

interface UploadedFile {
  file: File;
  type: DocumentType;
  progress: number;
  id: string;
}

interface DocumentUploadProps {
  onDocumentsChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
}

export const DocumentUpload = ({ onDocumentsChange, maxFiles = 10 }: DocumentUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsUploading(true);
    
    const newFiles: UploadedFile[] = acceptedFiles.map((file, index) => ({
      file,
      type: guessDocumentType(file.name),
      progress: 0,
      id: `file-${Date.now()}-${index}`
    }));

    // Simulate file upload progress
    newFiles.forEach((uploadFile, index) => {
      const interval = setInterval(() => {
        setUploadedFiles(prev => {
          const updated = prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress: Math.min(f.progress + Math.random() * 20, 100) }
              : f
          );
          
          if (updated.find(f => f.id === uploadFile.id)?.progress === 100) {
            clearInterval(interval);
            if (index === newFiles.length - 1) {
              setIsUploading(false);
            }
          }
          
          return updated;
        });
      }, 200);
    });

    setUploadedFiles(prev => {
      const updated = [...prev, ...newFiles];
      onDocumentsChange(updated);
      return updated;
    });
  }, [onDocumentsChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: maxFiles - uploadedFiles.length,
    disabled: uploadedFiles.length >= maxFiles
  });

  const guessDocumentType = (filename: string): DocumentType => {
    const name = filename.toLowerCase();
    if (name.includes('solicitor') || name.includes('instruction')) return 'solicitor_instructions';
    if (name.includes('asic')) return 'asic_extract';
    if (name.includes('lease') || name.includes('agreement')) return 'lease_agreement';
    if (name.includes('plan') || name.includes('property')) return 'property_plan';
    return 'other';
  };

  const removeFile = (id: string) => {
    const updated = uploadedFiles.filter(f => f.id !== id);
    setUploadedFiles(updated);
    onDocumentsChange(updated);
  };

  const updateDocumentType = (id: string, type: DocumentType) => {
    const updated = uploadedFiles.map(f => 
      f.id === id ? { ...f, type } : f
    );
    setUploadedFiles(updated);
    onDocumentsChange(updated);
  };

  const getDocumentTypeColor = (type: DocumentType) => {
    switch (type) {
      case 'solicitor_instructions':
        return 'bg-primary/20 text-primary';
      case 'asic_extract':
        return 'bg-success/20 text-success';
      case 'lease_agreement':
        return 'bg-accent/20 text-accent';
      case 'property_plan':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <Card 
        {...getRootProps()} 
        className={cn(
          "p-8 border-2 border-dashed transition-all duration-200 cursor-pointer hover:shadow-md",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30",
          uploadedFiles.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center space-y-4">
          <Upload className={cn(
            "h-12 w-12 mx-auto transition-colors",
            isDragActive ? "text-primary" : "text-muted-foreground"
          )} />
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? "Drop files here" : "Upload lease documents"}
            </p>
            <p className="text-muted-foreground mt-1">
              Drag & drop files or click to browse
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Supports: PDF, DOC, DOCX, JPEG, PNG</p>
            <p>Maximum {maxFiles} files • {uploadedFiles.length}/{maxFiles} uploaded</p>
          </div>
        </div>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <File className="h-5 w-5" />
            Uploaded Documents ({uploadedFiles.length})
          </h3>
          
          {uploadedFiles.map((uploadFile) => (
            <Card key={uploadFile.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <File className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{uploadFile.file.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{formatFileSize(uploadFile.file.size)}</span>
                      <span>•</span>
                      <Badge 
                        variant="secondary" 
                        className={getDocumentTypeColor(uploadFile.type)}
                      >
                        {uploadFile.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    {uploadFile.progress < 100 && (
                      <Progress value={uploadFile.progress} className="mt-2 h-2" />
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(uploadFile.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 animate-pulse" />
          <span>Processing uploaded documents...</span>
        </div>
      )}
    </div>
  );
};