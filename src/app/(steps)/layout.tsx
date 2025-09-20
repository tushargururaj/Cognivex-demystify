
'use client';

import { AppContextProvider } from '@/context/AppContext';
import StepsSidebar from '@/components/StepsSidebar';
import { AppLogo } from '@/components/AppLogo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function StepsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isConfigValid = 
    !!process.env.NEXT_PUBLIC_GCLOUD_PROJECT &&
    !!process.env.NEXT_PUBLIC_GCLOUD_LOCATION &&
    !!process.env.NEXT_PUBLIC_GCLOUD_SERVICE_ACCOUNT_CREDS &&
    !process.env.NEXT_PUBLIC_GCLOUD_SERVICE_ACCOUNT_CREDS.includes('...');

  return (
    <AppContextProvider isConfigValid={isConfigValid}>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <aside className="w-[350px] border-r bg-card p-6 hidden md:flex flex-col flex-shrink-0">
          <div className="mb-10">
            <AppLogo />
          </div>
          <StepsSidebar />
        </aside>

        <div className="md:hidden fixed top-4 left-4 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-6 bg-card w-[300px]">
              <div className="mb-10">
                <AppLogo />
              </div>
              <StepsSidebar />
            </SheetContent>
          </Sheet>
        </div>

        <main className="flex-1 flex justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
          {!isConfigValid ? (
             <div className="w-full max-w-4xl">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                  Your Google Cloud environment variables are not correctly configured. Please check your `.env` file and ensure `GCLOUD_PROJECT`, `GCLOUD_LOCATION`, and `GCLOUD_SERVICE_ACCOUNT_CREDS` are set correctly.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </AppContextProvider>
  );
}
