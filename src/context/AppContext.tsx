
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { STEPS } from '@/lib/steps';
import { summarizeLegalDocument } from '@/app/actions/ai';
import { useToast } from '@/hooks/use-toast';
import { useHasMounted } from '@/hooks/use-has-mounted';

export type AppDocument = { name: string; content: string; size: number };

type UserProfile = {
  profession: string;
  languages: string[];
  city: string;
  legalKnowledge: string;
  education: string;
};

type RiskCard = {
  risky_clause_text: string;
  risk_type: 'Legal' | 'Financial';
  risk_origin: 'document' | 'verbal_context' | 'goal_congruence';
  riskLevel?: 'critical' | 'moderate' | 'low';
  simplified_meaning: string;
  suggested_fix?: string;
};

type IdentifyLegalRisksOutput = {
  riskCards: RiskCard[];
};

type VerbalContext = {
  transcript: string;
  statements: {
    speaker: string;
    statement: string;
  }[];
}

type UserGoals = {
  rawText: string;
  user_intentions: string[];
  risks_to_avoid: string[];
}

type AppState = {
  currentStep: number;
  userProfile: UserProfile;
  document: AppDocument | null;
  verbalContext: VerbalContext;
  summary: string;
  goals: UserGoals;
  risks: IdentifyLegalRisksOutput | null;
  isConfigValid: boolean;
};

const initialState: AppState = {
  currentStep: 1,
  userProfile: {
    profession: '',
    languages: [],
    city: '',
    legalKnowledge: '',
    education: '',
  },
  document: null,
  verbalContext: {
    transcript: '',
    statements: [],
  },
  summary: '',
  goals: {
    rawText: '',
    user_intentions: [],
    risks_to_avoid: [],
  },
  risks: null,
  isConfigValid: true, // Assuming ADC is set up, so config is valid.
};

export type AppContextType = {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  setDocument: (file: AppDocument | null) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  goToStep: (stepId: number, navigate?: boolean) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode, isConfigValid: boolean }) {
  const [state, setState] = useState<AppState>(initialState);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const hasMounted = useHasMounted();

  useEffect(() => {
    if (!hasMounted) return;
    
    const currentStepFromPath = STEPS.find(step => step.path === pathname);
    if (currentStepFromPath && currentStepFromPath.id !== state.currentStep) {
      setState(prevState => ({ ...prevState, currentStep: currentStepFromPath.id }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hasMounted]);


  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setState(prevState => ({
      ...prevState,
      userProfile: { ...prevState.userProfile, ...profile },
    }));
  };

  const setDocument = (file: AppDocument | null) => {
    // Reset summary and risks when a new file is set or file is removed
    setState(prevState => ({ ...prevState, document: file, summary: '', risks: null }));

    if (file) {
      // Immediately trigger summarization in the background.
      summarizeLegalDocument({documentText: file.content})
        .then(result => {
          // Update the state with the generated summary
          setState(prevState => {
            // Ensure we are not overriding a newer state
            if(prevState.document?.name === file.name) {
              return { ...prevState, summary: result.summary };
            }
            return prevState;
          });
        })
        .catch(error => {
          console.error("Error summarizing document in background:", error);
          toast({
            variant: "destructive",
            title: "Background Summarization Failed",
            description: "Could not generate summary in the background. This may be due to an issue with your cloud environment setup.",
          });
        });
    }
  };

  const goToStep = useCallback((stepId: number, navigate = true) => {
    if (stepId > 0 && stepId <= STEPS.length) {
      const targetStep = STEPS.find(s => s.id === stepId);
      if (targetStep) {
        setState(prevState => ({ ...prevState, currentStep: stepId }));
        if (navigate) {
          router.push(targetStep.path);
        }
      }
    }
  }, [router]);

  const goToNextStep = useCallback(() => {
    const nextStepId = state.currentStep + 1;
    
    if (nextStepId <= STEPS.length) {
      goToStep(nextStepId);
    } else {
      // Finished final step, navigate home
      router.push('/');
    }
  }, [state.currentStep, goToStep, router]);

  const goToPrevStep = useCallback(() => {
    const prevStepId = state.currentStep - 1;
    if (prevStepId > 0) {
      goToStep(prevStepId);
    }
  }, [state.currentStep, goToStep]);

  const value = { state, setState, updateUserProfile, setDocument, goToNextStep, goToPrevStep, goToStep };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}
