'use client';

import { useState, useCallback } from 'react';
import { StepNavigation } from '@/components/StepNavigation';
import { useAppContext } from '@/context/AppContext';
import { STEPS } from '@/lib/steps';
import { Button } from '@/components/ui/button';
import { Mic, Upload, Loader2, FileAudio, X, FileText as TranscriptIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { transcribeAndAnalyzeAudio } from '@/app/actions/ai';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function VerbalContextPage() {
  const { state, setState } = useAppContext();
  const stepInfo = STEPS.find(s => s.id === state.currentStep)!;
  const [hasConsent, setHasConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // Placeholder
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedAudio(file);
      setIsProcessing(true);
      // Reset previous verbal context
      setState(prevState => ({ ...prevState, verbalContext: { statements: [], transcript: '' } }));
      
      try {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
            try {
              const audioDataUri = reader.result as string;
              const result = await transcribeAndAnalyzeAudio({ audioDataUri });
              
              setState(prevState => ({
                ...prevState,
                verbalContext: {
                  statements: result.statements,
                  transcript: result.transcript,
                }
              }));
    
              toast({
                title: "Analysis Complete",
                description: "Verbal context has been extracted from your audio file.",
              });
            } catch (error) {
              console.error("Error processing audio:", error);
              toast({
                variant: "destructive",
                title: "Audio Processing Failed",
                description: "Could not analyze the audio file. Please try again.",
              });
              // Clear state on failure
               setUploadedAudio(null);
               setState(prevState => ({ ...prevState, verbalContext: { statements: [], transcript: '' } }));
            } finally {
               setIsProcessing(false);
            }
          };
        } catch (error) {
           console.error("Error reading file:", error);
           toast({
             variant: "destructive",
             title: "File Read Error",
             description: "Could not read the uploaded file.",
           });
           setUploadedAudio(null);
           setIsProcessing(false);
        }
    }
  }, [setState, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/mp4': ['.m4a'],
    },
    multiple: false,
    disabled: isProcessing || isRecording,
  });

  const removeFile = () => {
    setUploadedAudio(null);
    setState(prevState => ({ ...prevState, verbalContext: { statements: [], transcript: '' } }));
  };

  // Next is enabled if consent is given, and we are not processing.
  // The user can proceed without uploading audio.
  const isNextDisabled = !hasConsent || isProcessing;
  const hasVerbalContext = state.verbalContext.statements && state.verbalContext.statements.length > 0;


  return (
    <div className="flex flex-col w-full max-w-4xl h-full bg-card rounded-xl shadow-sm border p-6 md:p-8">
      <div className="flex-1 space-y-8">
        <header>
          <h1 className="text-3xl font-bold font-headline text-primary mb-2">{stepInfo.name}</h1>
          <p className="text-muted-foreground">Optionally, provide verbal context by uploading an audio file of your conversation.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Audio Upload */}
          <div className='flex flex-col gap-4'>
            <div 
              {...getRootProps()}
              className={cn(
                'flex flex-col items-center justify-center space-y-4 p-8 border-2 border-dashed rounded-lg bg-secondary/30 h-full cursor-pointer transition-colors',
                isDragActive ? 'border-primary bg-primary/10' : 'border-border',
                (isProcessing || isRecording) && 'cursor-not-allowed opacity-50'
              )}
            >
              <input {...getInputProps()} />
              <h3 className="font-semibold text-lg">Upload Recording</h3>
              
              {!uploadedAudio && !isProcessing && (
                <div className="text-center">
                  <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                  <p className="text-xs text-muted-foreground">MP3, WAV, M4A up to 25MB</p>
                </div>
              )}
              
              {isProcessing && (
                <div className="flex flex-col items-center text-center">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p className="text-sm font-semibold">Analyzing Audio...</p>
                  <p className="text-xs text-muted-foreground">This may take a moment.</p>
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
             {state.verbalContext.transcript && (
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
                           <pre className="text-sm whitespace-pre-wrap font-body">{state.verbalContext.transcript}</pre>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            )}
          </div>
          
          {/* Live Record */}
          <div className="flex flex-col items-center justify-center space-y-4 p-8 border rounded-lg bg-secondary/30 h-full">
            <h3 className="font-semibold text-lg">Live Record</h3>
             <Button
                size="icon"
                variant="outline"
                className="w-24 h-24 rounded-full bg-accent hover:bg-accent/90 shadow-lg disabled:opacity-50"
                onClick={() => setIsRecording(!isRecording)}
                disabled={true} // Disabled until implemented
              >
                <Mic className="w-10 h-10" />
            </Button>
            <p className="text-xs text-muted-foreground">{isRecording ? 'Recording...' : 'Live recording coming soon'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-4">
          <Checkbox id="consent" checked={hasConsent} onCheckedChange={(checked) => setHasConsent(Boolean(checked))} disabled={isProcessing} />
          <Label htmlFor="consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            I have consent from all parties to upload and analyze this conversation.
          </Label>
        </div>
      </div>

      <StepNavigation isNextDisabled={isNextDisabled} />
    </div>
  );
}
