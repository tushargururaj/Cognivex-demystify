import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck className="w-7 h-7 text-primary"/>
      <div className="text-xl font-bold font-headline text-primary tracking-tight">
        Cognivex <span className="text-foreground/60 font-light">|</span> <span className="font-normal">Demystify</span>
      </div>
    </div>
  );
}
