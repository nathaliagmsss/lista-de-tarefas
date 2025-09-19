import { Stack } from "expo-router";
import { ThemeProvider } from "../src/context/ThemeContext";
import i18n from "../src/services/i18n";
import { I18nextProvider } from "react-i18next";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Criar cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000 // 5 minutos
    },
  },
});

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}