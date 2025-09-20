'use client';

import { StepNavigation } from '@/components/StepNavigation';
import { useAppContext } from '@/context/AppContext';
import { STEPS } from '@/lib/steps';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { parseUserGoals } from '@/app/actions/ai';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function GoalCongruencePage() {
  const { state, setState, goToNextStep } = useAppContext();
  const stepInfo = STEPS.find(s => s.id === state.currentStep)!;
  const [goalsText, setGoalsText] = useState(state.goals.rawText || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleNext = async () => {
    if (!goalsText.trim()) {
      // If user wants to skip, just go to the next step with empty goals
      goToNextStep();
      return;
    }

    setIsProcessing(true);
    try {
      const parsedGoals = await parseUserGoals({goalsText});
      setState(prevState => ({ 
        ...prevState, 
        goals: {
          rawText: goalsText,
          ...parsedGoals
        } 
      }));
      goToNextStep();
    } catch (error) {
      console.error("Error parsing user goals:", error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: "Could not parse your goals. Please try again or skip this step.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl h-full bg-card rounded-xl shadow-sm border p-6 md:p-8">
      <div className="flex-1 flex flex-col space-y-8">
        <header>
          <h1 className="text-3xl font-bold font-headline text-primary mb-2">{stepInfo.name}</h1>
          <p className="text-muted-foreground">Help us understand your objectives with this document. This step is optional.</p>
        </header>

        <div className="flex-grow flex flex-col">
          <Label htmlFor="goals" className="mb-2 font-semibold">
            List out your intentions and risks you want to avoid
          </Label>
          <Textarea
            id="goals"
            value={goalsText}
            onChange={(e) => setGoalsText(e.target.value)}
            placeholder="e.g., I want to ensure my liability is limited. I want to avoid any clauses that auto-renew... (or leave blank to skip)"
            className="flex-grow text-base resize-none"
            disabled={isProcessing}
          />
        </div>
      </div>

      <StepNavigation 
        onNextClick={handleNext} 
        isNextDisabled={isProcessing}
      >
        {isProcessing && <Loader2 className="animate-spin" />}
      </StepNavigation>
    </div>
  );
}
