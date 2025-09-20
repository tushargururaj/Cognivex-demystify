
'use client';

import { StepNavigation } from '@/components/StepNavigation';
import { useAppContext } from '@/context/AppContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { STEPS } from '@/lib/steps';

const profileSchema = z.object({
  profession: z.string().min(1, 'Profession is required.'),
  languages: z.array(z.string()).min(1, 'Please select at least one language.'),
  city: z.string().min(1, 'City is required.'),
  legalKnowledge: z.string().min(1, 'Legal knowledge level is required.'),
  education: z.string().min(1, 'Educational qualification is required.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const languages = ['English', 'Hindi', 'Kannada', 'Telugu', 'Tamil'];
const legalKnowledgeLevels = ['None', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
const professions = ['Lawyer', 'Student', 'Business Owner', 'Employee', 'Farmer', 'Other'];
const educationLevels = ['Elementary', 'Intermediate', 'Graduate', 'Masters', 'PhD'];

export default function UserProfilingPage() {
  const { state, updateUserProfile, goToNextStep } = useAppContext();
  const stepInfo = STEPS.find(s => s.id === state.currentStep)!;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      ...state.userProfile,
      languages: state.userProfile.languages || [], // Ensure languages is an array
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateUserProfile(data);
    goToNextStep();
  };
  
  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      onSubmit(form.getValues());
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl h-full bg-card rounded-xl shadow-sm border p-6 md:p-8">
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col h-full">
          <div className="flex-1 space-y-8">
            <header>
              <h1 className="text-3xl font-bold font-headline text-primary mb-2">{stepInfo?.name}</h1>
              <p className="text-muted-foreground">Tell us about yourself to help us tailor the experience for you.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profession</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select your profession" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input placeholder="e.g., Bengaluru" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="legalKnowledge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Knowledge</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select your knowledge level" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {legalKnowledgeLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Educational Qualification</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select your education" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {educationLevels.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="languages"
                  render={() => (
                    <FormItem>
                      <FormLabel>Languages</FormLabel>
                      <div className="flex flex-wrap gap-4 pt-2">
                        {languages.map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="languages"
                            render={({ field }) => (
                              <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item])
                                        : field.onChange(field.value?.filter((value) => value !== item));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <StepNavigation onNextClick={handleNext} />
        </form>
      </Form>
    </div>
  );
}
