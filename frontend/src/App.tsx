import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { AuthProvider } from '@/contexts/AuthContext';
import { SchoolSettingsProvider } from '@/contexts/SchoolSettingsContext';
import { AppRoutes } from '@/routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // Don't retry client errors (401/403/404); retry transient failures once.
      retry: (count, error) => !(axios.isAxiosError(error) && error.response && error.response.status < 500) && count < 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SchoolSettingsProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </SchoolSettingsProvider>
    </QueryClientProvider>
  );
}
