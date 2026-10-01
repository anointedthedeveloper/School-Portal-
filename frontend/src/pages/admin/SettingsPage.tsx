import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { FormField } from '@/components/forms/FormField';
import { SCHOOL_SETTINGS_KEY } from '@/contexts/SchoolSettingsContext';
import { getErrorMessage } from '@/services/apiClient';
import { settingsService } from '@/services/settings.service';

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex colour, e.g. #1e40af');
const asset = z.string().max(500).refine((v) => v === '' || /^https:\/\//.test(v) || v.startsWith('/'), 'Use an https URL or a path starting with /');

const schema = z.object({
  schoolName: z.string().trim().min(1, 'Required').max(150),
  shortName: z.string().trim().min(1, 'Required').max(40),
  logo: asset,
  favicon: asset,
  address: z.string().max(300),
  phone: z.string().max(40),
  email: z.union([z.literal(''), z.string().email('Enter a valid email')]),
  website: z.union([z.literal(''), z.string().url('Enter a full URL, e.g. https://example.com')]),
  primaryColor: hex,
  secondaryColor: hex,
  currentSession: z.string().max(20),
  currentTerm: z.string().max(20),
});
type FormValues = z.infer<typeof schema>;

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const { data, isPending, isError, error, refetch } = useQuery({ queryKey: ['settings', 'full'], queryFn: settingsService.getFull });
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (data) reset({
      schoolName: data.schoolName, shortName: data.shortName, logo: data.logo, favicon: data.favicon,
      address: data.address, phone: data.phone, email: data.email, website: data.website,
      primaryColor: data.primaryColor, secondaryColor: data.secondaryColor,
      currentSession: data.currentSession, currentTerm: data.currentTerm,
    });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: settingsService.update,
    onSuccess: async () => {
      setSaved(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: SCHOOL_SETTINGS_KEY }),
        queryClient.invalidateQueries({ queryKey: ['settings', 'full'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    },
  });

  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;

  const colorField = (name: 'primaryColor' | 'secondaryColor', label: string) => (
    <FormField label={label} htmlFor={name} error={errors[name]?.message}>
      <div className="flex gap-2">
        <input aria-label={`${label} picker`} type="color" value={/^#[0-9a-fA-F]{6}$/.test(watch(name) ?? '') ? watch(name) : '#000000'} onChange={(e) => setValue(name, e.target.value, { shouldDirty: true, shouldValidate: true })} className="h-9 w-12 cursor-pointer rounded border border-slate-300 bg-white p-1" />
        <input id={name} className="input" {...register(name)} />
      </div>
    </FormField>
  );

  const field = (name: keyof FormValues, label: string, hint?: string) => (
    <FormField label={label} htmlFor={name} error={errors[name]?.message} hint={hint}>
      <input id={name} className="input" {...register(name)} />
    </FormField>
  );

  return (
    <>
      <PageHeader title="School Settings" description="Identity, branding and academic calendar used across the whole portal." />
      {isPending ? (
        <Card><div className="space-y-4"><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /></div></Card>
      ) : (
        <form
          noValidate
          onSubmit={handleSubmit((values) => { setSaved(false); mutation.mutate(values); })}
          className="space-y-6"
        >
          {mutation.isError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{getErrorMessage(mutation.error)}</div>}
          {saved && !isDirty && <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Settings saved.</div>}

          <Card title="Identity">
            <div className="grid gap-4 sm:grid-cols-2">
              {field('schoolName', 'School name')}
              {field('shortName', 'Short name')}
              {field('logo', 'Logo URL', 'https URL or a path such as /logo.png')}
              {field('favicon', 'Favicon URL')}
            </div>
          </Card>
          <Card title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">{field('address', 'Address')}</div>
              {field('phone', 'Phone')}
              {field('email', 'Email')}
              {field('website', 'Website')}
            </div>
          </Card>
          <Card title="Branding">
            <div className="grid gap-4 sm:grid-cols-2">
              {colorField('primaryColor', 'Primary colour')}
              {colorField('secondaryColor', 'Secondary colour')}
            </div>
          </Card>
          <Card title="Academic calendar" description="Shown in the header for every user.">
            <div className="grid gap-4 sm:grid-cols-2">
              {field('currentSession', 'Current session', 'e.g. 2025/2026')}
              {field('currentTerm', 'Current term', 'e.g. First Term')}
            </div>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>Save changes</Button>
          </div>
        </form>
      )}
    </>
  );
}
