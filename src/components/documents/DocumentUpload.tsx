import { useState, useCallback, useEffect } from 'react';
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
  base64: string | null; // Added base64 property
  name: string;
  mimetype: string;
}

interface DocumentUploadProps {
  onDocumentsChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
}

export const DocumentUpload = ({ onDocumentsChange, maxFiles = 10 }: DocumentUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Call onDocumentsChange whenever uploadedFiles changes
  useEffect(() => {
    onDocumentsChange(uploadedFiles);
  }, [uploadedFiles, onDocumentsChange]);

  // Function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    
    const newFiles: UploadedFile[] = acceptedFiles.map((file, index) => ({
      file,
      name: file.name,
      mimetype: file.type,
      type: guessDocumentType(file.name),
      progress: 0,
      id: `file-${Date.now()}-${index}`,
      base64: null // Initialize as null, will be populated once file is read
    }));

    // Add files to state immediately
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Process each file to get base64 and simulate upload progress
    for (let i = 0; i < newFiles.length; i++) {
      const uploadFile = newFiles[i];
      
      try {
        // Read file as base64
        const base64Data = await fileToBase64(uploadFile.file);
        
        // Update the file with base64 data
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, base64: base64Data }
            : f
        ));

        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadedFiles(prev => {
            const updated = prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, progress: Math.min(f.progress + Math.random() * 20, 100) }
                : f
            );
            
            const currentFile = updated.find(f => f.id === uploadFile.id);
            if (currentFile?.progress === 100) {
              clearInterval(interval);
              
              // Check if this is the last file
              if (i === newFiles.length - 1) {
                setIsUploading(false);
              }
            }
            
            return updated;
          });
        }, 200);

      } catch (error) {
        console.error(`Error reading file ${uploadFile.file.name}:`, error);
        
        // Update file with error state (you might want to add an error property to the interface)
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, progress: 100, base64: null }
            : f
        ));
      }
    }
  }, []);

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
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateDocumentType = (id: string, type: DocumentType) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === id ? { ...f, type } : f
    ));
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