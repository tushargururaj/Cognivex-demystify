import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/AppLogo';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen w-full items-center justify-center bg-background text-foreground p-4 overflow-hidden">
      <div
        className="absolute inset-0 -z-10 h-full w-full"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, hsl(300 100% 96%), hsl(var(--background)) 70%)',
        }}
      />
      <header className="absolute top-0 left-0 p-6 md:p-8">
        <AppLogo />
      </header>

      <main className="flex flex-col items-center text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold font-headline bg-gradient-to-br from-primary via-purple-700 to-purple-500 bg-clip-text text-transparent drop-shadow-sm mb-4">
          Legal Documents, Made Simple
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-8">
          Summarize, explain and question legal documents with ease.
        </p>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base px-10 py-6 rounded-full shadow-lg transition-transform transform hover:scale-105">
          <Link href="/user-profiling">Demystify</Link>
        </Button>
      </main>

      <footer className="absolute bottom-0 p-6 text-sm text-muted-foreground">
        Powered by Google Vertex AI
      </footer>
    </div>
  );
}
