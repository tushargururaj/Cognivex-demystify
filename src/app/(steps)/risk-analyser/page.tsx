
'use client';

import { useEffect, useState } from 'react';
import { StepNavigation } from '@/components/StepNavigation';
import { useAppContext } from '@/context/AppContext';
import { STEPS, type Step } from '@/lib/steps';
import { identifyLegalRisks, narrateRisk } from '@/app/actions/ai';
import type { IdentifyLegalRisksInput, NarrateRiskInput } from '@/app/actions/ai';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Loader2, Languages, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";


type RiskCard = NonNullable<NarrateRiskInput['risk']>;
type IdentifyLegalRisksOutput = {
  riskCards: RiskCard[];
};
type UserProfile = IdentifyLegalRisksInput['userContext'];

const RiskOriginBadge = ({ origin }: { origin: RiskCard['risk_origin'] }) => {
  const styles = {
    document: 'bg-blue-100 text-blue-800 border-blue-300',
    verbal_context: 'bg-purple-100 text-purple-800 border-purple-300',
    goal_congruence: 'bg-green-100 text-green-800 border-green-300',
  };
  const text = {
    document: 'Document',
    verbal_context: 'Verbal Context',
    goal_congruence: 'Goal Congruence',
  };
  return (
    <Badge variant="outline" className={cn('capitalize', styles[origin])}>
      {text[origin]}
    </Badge>
  );
};


const RiskLevelBadge = ({ level }: { level: RiskCard['riskLevel']}) => {
  const variant = level === 'critical' ? 'destructive' : 
                  level === 'moderate' ? 'default' : 'secondary';
  
  const className = cn(
    'capitalize',
    level === 'moderate' && 'bg-amber-500 hover:bg-amber-500/80 text-white',
    level === 'low' && 'bg-emerald-500 hover:bg-emerald-500/80 text-white'
  );

  return (
    <Badge variant={variant} className={className}>
      {`${level} risk`}
    </Badge>
  );
};

const NarrativeContent = ({ risk, userProfile }: { risk: RiskCard; userProfile: UserProfile }) => {
  const [narratives, setNarratives] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<string | null>(null); // Stores the language being loaded
  const [selectedLanguage, setSelectedLanguage] = useState(userProfile.languages?.[0] || 'English');
  const { toast } = useToast();

  const generateNarrative = async (language: string) => {
    if (narratives[language]) {
      setSelectedLanguage(language);
      return;
    }

    setIsLoading(language);
    try {
      const result = await narrateRisk({ risk, userProfile, language });
      setNarratives(prev => ({ ...prev, [language]: result.narrative }));
      setSelectedLanguage(language);
    } catch (error) {
      console.error(`Error narrating risk in ${language}:`, error);
      toast({
        variant: "destructive",
        title: "Narration Failed",
        description: `Could not generate the narrative in ${language}. Please try again.`,
      });
    } finally {
      setIsLoading(null);
    }
  };
  
  const handleRegenerate = () => {
     setNarratives(prev => ({ ...prev, [selectedLanguage]: '' })); // Clear current narrative
     generateNarrative(selectedLanguage);
  }

  useEffect(() => {
    generateNarrative(selectedLanguage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentNarrative = narratives[selectedLanguage];
  const userLanguages = userProfile.languages?.length ? userProfile.languages : ['English'];

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Potential Consequence</DialogTitle>
        <DialogDescription>
          Here's a narrative example of what could happen, translated into your chosen languages.
        </DialogDescription>
      </DialogHeader>

      {/* Language Selector */}
       <div className="flex items-center gap-2 pt-2">
         <Languages className="text-muted-foreground"/>
         <div className="flex flex-wrap gap-2">
            {userLanguages.map(lang => (
              <Button
                key={lang}
                variant={selectedLanguage === lang ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => generateNarrative(lang)}
                disabled={isLoading === lang}
                className="relative"
              >
                {isLoading === lang && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {lang}
              </Button>
            ))}
          </div>
       </div>

      <div className="min-h-[150px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedLanguage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="prose prose-sm max-w-none dark:prose-invert"
          >
           {!currentNarrative && isLoading === selectedLanguage ? (
              <div className="space-y-2 mt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p>{currentNarrative || 'Select a language to generate the narrative.'}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

       <Button onClick={handleRegenerate} disabled={!!isLoading} size="sm" className="mt-4 bg-primary hover:bg-primary/90">
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Generating...</> : 'Regenerate Narrative'}
        </Button>
    </DialogContent>
  );
};

export default function RiskAnalyserPage() {
  const { state, setState } = useAppContext();
  const stepInfo = STEPS.find(s => s.id === state.currentStep) as Step;
  const { toast } = useToast();
  const [risks, setRisks] = useState<IdentifyLegalRisksOutput | null>(state.risks);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (state.document?.content && !state.risks) {
      const analyzeRisks = async () => {
        setIsLoading(true);
        try {
          const result = await identifyLegalRisks({
            documentText: state.document!.content,
            userContext: {
              profession: state.userProfile.profession,
              city: state.userProfile.city,
              languages: state.userProfile.languages,
              legalKnowledge: state.userProfile.legalKnowledge,
              education: state.userProfile.education,
            },
            verbalContext: state.verbalContext,
            userGoals: {
              user_intentions: state.goals.user_intentions,
              risks_to_avoid: state.goals.risks_to_avoid,
            },
           });
          setRisks(result);
          setState(prevState => ({...prevState, risks: result}));
        } catch (error) {
          console.error("Error identifying risks:", error);
          toast({
            variant: "destructive",
            title: "Risk Analysis Failed",
            description: "Could not analyze risks in the document. Please try again.",
          });
        } finally {
          setIsLoading(false);
        }
      };
      analyzeRisks();
    }
  }, [state.document, state.risks, state.userProfile, state.verbalContext, state.goals, setState, toast]);
  
  return (
    <div className="flex flex-col w-full max-w-6xl h-full bg-card rounded-xl shadow-sm border p-6 md:p-8">
      <div className="flex-1 flex flex-col space-y-8 overflow-hidden">
        <header>
          <h1 className="text-3xl font-bold font-headline text-primary mb-2">{stepInfo.name}</h1>
          <p className="text-muted-foreground">Potential risks identified in your document are highlighted below.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
          <div className="flex flex-col space-y-4 overflow-hidden">
            <h2 className="text-lg font-semibold">Document Text</h2>
            <ScrollArea className="border rounded-lg p-4 h-full bg-secondary/30">
              <pre className="text-sm whitespace-pre-wrap font-body">{state.document?.content || "No document loaded."}</pre>
            </ScrollArea>
          </div>
          <div className="flex flex-col space-y-4 overflow-hidden">
            <h2 className="text-lg font-semibold">Identified Risks</h2>
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
                ) : risks?.riskCards && risks.riskCards.length > 0 ? (
                  risks.riskCards.map((risk, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                           <CardTitle className="capitalize text-base flex items-center gap-2">
                            {risk.risk_type} Risk 
                            <RiskOriginBadge origin={risk.risk_origin} />
                           </CardTitle>
                          {risk.riskLevel && <RiskLevelBadge level={risk.riskLevel} />}
                        </div>
                        <CardDescription className="text-xs pt-2">
                          <blockquote className="border-l-2 pl-2 italic">"{risk.risky_clause_text}"</blockquote>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{risk.simplified_meaning}</p>
                      </CardContent>
                      <CardFooter className="flex-col items-start gap-2">
                         <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="secondary"
                              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-px text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-lg"
                            >
                              <span className="relative flex items-center gap-2 px-5 py-2.5 transition-all ease-in duration-75 rounded-full">
                                Consequence
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                              </span>
                            </Button>
                          </DialogTrigger>
                          <NarrativeContent risk={risk} userProfile={state.userProfile as UserProfile} />
                        </Dialog>
                        {risk.suggested_fix && (
                          <div className="pt-2 text-xs">
                            <h4 className="font-semibold">Suggested Fix:</h4>
                            <p className="text-muted-foreground">{risk.suggested_fix}</p>
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">{isLoading ? 'Analyzing...' : 'No risks identified or analysis failed.'}</div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
      <StepNavigation isNextDisabled={isLoading}/>
    </div>
  );
}

    