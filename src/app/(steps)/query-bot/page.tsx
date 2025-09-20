'use client';

import { useState, useRef, useEffect } from 'react';
import { StepNavigation } from '@/components/StepNavigation';
import { useAppContext } from '@/context/AppContext';
import { STEPS } from '@/lib/steps';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { askQuery } from '@/app/actions/ai';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

const initialMessages: Message[] = [
  { id: 'initial-1', text: "Hello! I'm Cognivex, your AI legal assistant. How can I help you with this document today?", sender: 'bot' },
];

export default function QueryBotPage() {
  const { state } = useAppContext();
  const stepInfo = STEPS.find(s => s.id === state.currentStep)!;
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');
  const botAvatar = PlaceHolderImages.find(img => img.id === 'bot-avatar-1');

  useEffect(() => {
    // Auto-scroll to the bottom
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isBotTyping) {
      const userMessage: Message = { id: `user-${Date.now()}`, text: inputValue, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);
      const currentInput = inputValue;
      setInputValue('');
      setIsBotTyping(true);

      try {
        const result = await askQuery({
          question: currentInput,
          documentText: state.document?.content || '',
        });
        const botMessage: Message = { id: `bot-${Date.now()}`, text: result.answer, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error("Error asking query:", error);
        toast({
          variant: "destructive",
          title: "Query Failed",
          description: "There was an error getting a response. Please try again.",
        });
        const errorMessage: Message = { id: `bot-error-${Date.now()}`, text: "Sorry, I encountered an error. Please try again.", sender: 'bot' };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsBotTyping(false);
      }
    }
  };
  
  return (
    <div className="flex flex-col w-full max-w-4xl h-full bg-card rounded-xl shadow-sm border">
      <header className="p-6 border-b">
        <h1 className="text-3xl font-bold font-headline text-primary mb-2">{stepInfo.name}</h1>
        <p className="text-muted-foreground">Ask anything about your document or the identified risks.</p>
      </header>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef as any}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={cn('flex items-start gap-3', message.sender === 'user' && 'justify-end')}>
                {message.sender === 'bot' && (
                  <Avatar>
                    {botAvatar && <AvatarImage src={botAvatar.imageUrl} alt="Bot Avatar" data-ai-hint={botAvatar.imageHint}/>}
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "max-w-md p-3 rounded-lg",
                  message.sender === 'bot' ? 'bg-secondary' : 'bg-accent text-accent-foreground'
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                {message.sender === 'user' && (
                  <Avatar>
                    {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint}/>}
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isBotTyping && (
              <div className="flex items-start gap-3">
                <Avatar>
                  {botAvatar && <AvatarImage src={botAvatar.imageUrl} alt="Bot Avatar" data-ai-hint={botAvatar.imageHint} />}
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="max-w-md p-3 rounded-lg bg-secondary">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background/50">
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your question..."
              className="flex-1"
              disabled={isBotTyping}
            />
            <Button onClick={handleSendMessage} size="icon" className="bg-accent hover:bg-accent/90" disabled={isBotTyping || !state.document}>
              {isBotTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6 border-t">
        <StepNavigation />
      </div>
    </div>
  );
}
