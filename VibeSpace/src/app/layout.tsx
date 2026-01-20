import "@/styles/globals.css";
import { ThemeProvider } from "@/components/TthemeProvider";
import { Toaster } from "@/components/ui/sonner"
import StoreProvider from './StoreProvider';
import AuthProvider from './SessionProvider'
import { headers } from 'next/headers'

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const headerList = await headers()
  const nonce = headerList.get('x-nonce')

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <StoreProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
            {children}
            < Toaster />
            </ThemeProvider>
          </StoreProvider>
        </AuthProvider>

      </body>
    </html>
  );
}