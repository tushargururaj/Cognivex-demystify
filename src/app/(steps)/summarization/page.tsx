'use client';

import { StepNavigation } from '@/components/StepNavigation';
import { useAppContext } from '@/context/AppContext';
import { STEPS } from '@/lib/steps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SummarizationPage() {
  const { state } = useAppContext();
  const stepInfo = STEPS.find(s => s.id === state.currentStep)!;
  const { summary, document } = state;
  
  // isLoading is true if we have a document but no summary yet.
  const isLoading = !!document && !summary;

  return (
    <div className="flex flex-col w-full max-w-4xl h-full bg-card rounded-xl shadow-sm border p-6 md:p-8">
      <div className="flex-1 space-y-8">
        <header>
          <h1 className="text-3xl font-bold font-headline text-primary mb-2">{stepInfo.name}</h1>
          <p className="text-muted-foreground">Here is a concise summary of your document's key points.</p>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : (
          <Card className="bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold text-primary">Document Summary</CardTitle>
              <Button variant="outline" size="icon" disabled>
                <Volume2 className="h-5 w-5" />
                <span className="sr-only">Listen to summary</span>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 leading-relaxed">{summary || "No summary available. Please upload a document first."}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <StepNavigation isNextDisabled={isLoading || !summary} />
    </div>
  );
}
