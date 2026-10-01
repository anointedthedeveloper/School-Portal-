import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';
import { Button } from '@/components/common/Button';
import { SchoolBrand } from '@/components/common/SchoolBrand';
import { FormField } from '@/components/forms/FormField';
import { getErrorMessage } from '@/services/apiClient';
import { roleBase, roleHome } from '@/utils/roles';

const schema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { user, status, login } = useAuth();
  const settings = useSchoolSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (status === 'authenticated' && user) return <Navigate to={roleHome[user.role]} replace />;

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const signedIn = await login(values.email, values.password);
      // Only honour a return path inside the user's own area.
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from?.startsWith(roleBase[signedIn.role]) ? from : roleHome[signedIn.role], { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err, 'Unable to sign in.'));
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><SchoolBrand /></div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Use the account provided by {settings.shortName}.</p>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4">
            {serverError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</div>}
            <FormField label="Email" htmlFor="email" error={errors.email?.message}>
              <input id="email" type="email" autoComplete="username" className="input" {...register('email')} />
            </FormField>
            <FormField label="Password" htmlFor="password" error={errors.password?.message}>
              <input id="password" type="password" autoComplete="current-password" className="input" {...register('password')} />
            </FormField>
            <Button type="submit" className="w-full" loading={isSubmitting}>Sign in</Button>
          </form>
        </div>
        {(settings.phone || settings.email) && (
          <p className="mt-4 text-center text-xs text-slate-500">
            Need help? {[settings.phone, settings.email].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
}
