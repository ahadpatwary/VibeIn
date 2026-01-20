import "@/styles/globals.css";
import { ThemeProvider } from "@/components/TthemeProvider";
import { Toaster } from "@/components/ui/sonner"
import StoreProvider from './StoreProvider';
import AuthProvider from './SessionProvider'
import { headers } from "next/headers";


interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: "console.log('CSP works')" }} />
      </head>
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