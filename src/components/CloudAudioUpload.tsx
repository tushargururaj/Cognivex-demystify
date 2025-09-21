'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, FileAudio, X, FileText as TranscriptIcon } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { transcribeAndAnalyzeAudioFromCloud } from '@/app/actions/ai';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';

interface CloudAudioUploadProps {
  onAnalysisComplete: (result: { statements: { speaker: string; statement: string }[]; transcript: string }) => void;
  onAnalysisStart: () => void;
  onAnalysisError: () => void;
  isProcessing: boolean;
  hasVerbalContext: boolean;
}

export function CloudAudioUpload({ 
  onAnalysisComplete, 
  onAnalysisStart, 
  onAnalysisError,
  isProcessing,
  hasVerbalContext 
}: CloudAudioUploadProps) {
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcript, setTranscript] = useState<string>('');
  const { toast } = useToast();

  const handleFileDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Validate file size (50MB limit for cloud upload)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Audio files must be smaller than 50MB for cloud upload.",
        });
        return;
      }

      setUploadedAudio(file);
      onAnalysisStart();
      setUploadProgress(0);
      
      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // Convert file to base64 string using FileReader (more efficient for large files)
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:audio/mp3;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        
        // Call the new cloud upload action
        console.log('Using cloud upload for file:', file.name, 'Size:', file.size);
        const result = await transcribeAndAnalyzeAudioFromCloud({
          audioBase64: base64String,
          mimeType: file.type,
          originalFileName: file.name
        });
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Update state with results
        setTranscript(result.transcript);
        onAnalysisComplete({
          statements: result.statements,
          transcript: result.transcript
        });
        
        toast({
          title: "Analysis Complete",
          description: "Verbal context has been extracted from your audio file.",
        });
        
        // Reset progress after a short delay to show completion
        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
        
      } catch (error) {
        console.error("Error processing audio:", error);
        console.error("Error details:", error.message);
        toast({
          variant: "destructive",
          title: "Audio Processing Failed",
          description: `Could not analyze the audio file: ${error.message}`,
        });
        setUploadedAudio(null);
        onAnalysisError();
      } finally {
        setUploadProgress(0);
      }
    }
  }, [onAnalysisComplete, onAnalysisStart, onAnalysisError, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/mp4': ['.m4a'],
      'audio/ogg': ['.ogg'],
      'audio/webm': ['.webm'],
    },
    multiple: false,
    disabled: isProcessing,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = () => {
    setUploadedAudio(null);
    setTranscript('');
    onAnalysisError();
  };

  return (
    <div className='flex flex-col gap-4'>
      <div 
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center space-y-4 p-8 border-2 border-dashed rounded-lg bg-secondary/30 h-full cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/10' : 'border-border',
          isProcessing && 'cursor-not-allowed opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <h3 className="font-semibold text-lg">Upload Recording</h3>
        
        {!uploadedAudio && !isProcessing && (
          <div className="text-center">
            <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
            <p className="text-xs text-muted-foreground">MP3, WAV, M4A, OGG, WEBM up to 4MB</p>
            <p className="text-xs text-yellow-600 font-medium">⚠️ Current version supports files up to 4MB</p>
          </div>
        )}
        
        {isProcessing && (
          <div className="flex flex-col items-center text-center w-full">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p className="text-sm font-semibold">Uploading & Analyzing Audio...</p>
            <p className="text-xs text-muted-foreground mb-2">This may take a moment.</p>
            <div className="w-full max-w-xs">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{uploadProgress}% complete</p>
            </div>
          </div>
        )}

        {uploadedAudio && !isProcessing && (
          <div className="relative flex items-center justify-between w-full h-16 border rounded-lg p-3 bg-background">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileAudio className="w-6 h-6 text-primary shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-foreground truncate">{uploadedAudio.name}</span>
                <span className="text-xs text-muted-foreground">
                  {hasVerbalContext ? "Context extracted" : "Ready to process"}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={removeFile} className="absolute top-1 right-1 h-6 w-6 shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      
      {transcript && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <TranscriptIcon className="mr-2"/>
              View Transcript
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Conversation Transcript</DialogTitle>
              <DialogDescription>
                This is the full transcript generated from your audio file.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[50vh] border rounded-md p-4 bg-secondary/30">
              <pre className="text-sm whitespace-pre-wrap font-body">{transcript}</pre>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
