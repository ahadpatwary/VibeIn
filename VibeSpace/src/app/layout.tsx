import "@/styles/globals.css";
import { ThemeProvider } from "@/components/TthemeProvider";
import { Toaster } from "@/components/ui/sonner"
import StoreProvider from './StoreProvider';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        
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

      </body>
    </html>
  );
}