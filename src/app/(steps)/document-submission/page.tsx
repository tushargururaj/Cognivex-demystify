'use client';

import { StepNavigation } from '@/components/StepNavigation';
import { FileUpload } from '@/components/FileUpload';
import { useAppContext } from '@/context/AppContext';
import { STEPS } from '@/lib/steps';

export default function DocumentSubmissionPage() {
  const { state, setDocument } = useAppContext();
  const stepInfo = STEPS.find(s => s.id === state.currentStep)!;

  const handleFileChange = (file: File | null, content: string) => {
    if (file) {
      setDocument({ name: file.name, content, size: file.size });
    } else {
      setDocument(null);
    }
  };
  
  const removeFile = () => {
    setDocument(null);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl h-full bg-card rounded-xl shadow-sm border p-6 md:p-8">
      <div className="flex-1 space-y-8">
        <header>
          <h1 className="text-3xl font-bold font-headline text-primary mb-2">{stepInfo.name}</h1>
          <p className="text-muted-foreground">Upload your legal document. We support PDF and TXT files.</p>
        </header>

        <FileUpload 
          onFileChange={handleFileChange} 
          file={state.document}
          onFileRemove={removeFile}
        />
      </div>

      <StepNavigation isNextDisabled={!state.document} />
    </div>
  );
}
