'use client';

import { Check, AlertTriangle } from 'lucide-react';
import { STEPS } from '@/lib/steps';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { Skeleton } from './ui/skeleton';

export default function StepsSidebar() {
  const { state: { currentStep } } = useAppContext();
  const hasMounted = useHasMounted();

  const SidebarSkeleton = () => (
    <div className="space-y-4 mt-2">
      {STEPS.map((step) => (
        <div key={step.id} className="flex items-center p-3">
          <Skeleton className="w-7 h-7 rounded-full mr-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <nav className="flex flex-col h-full">
      <ul className="relative">
        {/* Vertical line */}
        <div className="absolute left-[calc(1.125rem+theme(space.3))] top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
        
        {!hasMounted ? <SidebarSkeleton /> : STEPS.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          
          return (
            <li key={step.id}>
              <Link href={step.path} className="flex items-center p-3 rounded-lg transition-colors">
                <div className="w-9 h-9 mr-4 shrink-0 relative flex items-center justify-center">
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full border-2 z-10 bg-card",
                    isActive ? "border-primary" : "border-border",
                    isCompleted ? "border-primary bg-primary text-primary-foreground" : ""
                  )}>
                    {isCompleted ? <Check size={18} /> : <step.icon size={16} className={cn(isActive ? "text-primary" : "text-muted-foreground")} />}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "font-medium",
                    isActive ? "text-primary font-bold" : "text-muted-foreground",
                    isCompleted ? "text-foreground font-semibold" : ""
                  )}>
                    {step.name}
                  </span>
                  <span className="text-sm text-muted-foreground">Step {step.id}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
