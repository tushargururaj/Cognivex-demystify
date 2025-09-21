'use client';

import { useState } from 'react';
import { StepNavigation } from '@/components/StepNavigation';
import { useAppContext } from '@/context/AppContext';
import { STEPS } from '@/lib/steps';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CloudAudioUpload } from '@/components/CloudAudioUpload';


export default function VerbalContextPage() {
  const { state, setState } = useAppContext();
  const stepInfo = STEPS.find(s => s.id === state.currentStep)!;
  const [hasConsent, setHasConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // Placeholder
  const [isProcessing, setIsProcessing] = useState(false);


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
          
          {/* Cloud Audio Upload */}
          <CloudAudioUpload
            onAnalysisComplete={(result) => {
              setIsProcessing(false);
              setState(prevState => ({
                ...prevState,
                verbalContext: {
                  statements: result.statements,
                  transcript: result.transcript,
                }
              }));
            }}
            onAnalysisStart={() => {
              setIsProcessing(true);
              setState(prevState => ({ ...prevState, verbalContext: { statements: [], transcript: '' } }));
            }}
            onAnalysisError={() => {
              setIsProcessing(false);
              setState(prevState => ({ ...prevState, verbalContext: { statements: [], transcript: '' } }));
            }}
            isProcessing={isProcessing}
            hasVerbalContext={hasVerbalContext}
          />
          
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
