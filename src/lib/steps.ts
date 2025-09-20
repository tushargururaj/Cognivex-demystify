import { User, Mic, FileUp, FileText, CheckCircle, Shield, Bot, type LucideIcon } from 'lucide-react';

export type Step = {
  id: number;
  name: string;
  path: string;
  icon: LucideIcon;
};

export const STEPS: Step[] = [
  { id: 1, name: 'User Profiling', path: '/user-profiling', icon: User },
  { id: 2, name: 'Document Submission', path: '/document-submission', icon: FileUp },
  { id: 3, name: 'Verbal Context', path: '/verbal-context', icon: Mic },
  { id: 4, name: 'Summarization', path: '/summarization', icon: FileText },
  { id: 5, name: 'Goals Congruence', path: '/goal-congruence', icon: CheckCircle },
  { id: 6, name: 'Risk Analysis', path: '/risk-analyser', icon: Shield },
  { id: 7, name: 'RAG Bot', path: '/query-bot', icon: Bot },
];
