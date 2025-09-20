
'use client';

import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { STEPS } from '@/lib/steps';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type StepNavigationProps = {
  onNextClick?: () => void | Promise<void>;
  isNextDisabled?: boolean;
  children?: React.ReactNode;
};

export function StepNavigation({ onNextClick, isNextDisabled = false, children }: StepNavigationProps) {
  const { state, goToPrevStep, goToNextStep } = useAppContext();

  const handleNext = async () => {
    if (onNextClick) {
      await onNextClick();
    } else {
      goToNextStep();
    }
  };

  const isFirstStep = state.currentStep === 1;
  const isLastStep = state.currentStep === STEPS.length;

  return (
    <div className="mt-8 pt-6 border-t flex justify-between items-center">
      <Button
        variant="outline"
        onClick={goToPrevStep}
        disabled={isFirstStep}
        className={isFirstStep ? 'invisible' : ''}
        type="button"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>
      <Button 
        onClick={handleNext} 
        disabled={isNextDisabled}
        className="bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        {children || (isLastStep ? 'Finish' : 'Next Step')}
        {!children && <ChevronRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
}
