'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
   // One client per browser session; created lazily so it is not shared across
   // requests on the server.
   const [queryClient] = useState(
      () =>
         new QueryClient({
            defaultOptions: {
               queries: {
                  staleTime: 60 * 1000,
                  retry: 1,
                  refetchOnWindowFocus: false,
               },
            },
         }),
   );

   return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
