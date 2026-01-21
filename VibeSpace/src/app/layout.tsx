import "@/styles/globals.css";
import { ThemeProvider } from "@/components/TthemeProvider";
import { Toaster } from "@/components/ui/sonner"
import StoreProvider from './StoreProvider';
import AuthProvider from './SessionProvider'
import { headers } from 'next/headers'
import Script from 'next/script';
import { MenubarDemo } from '@/components/Bar';
import { ScrollArea } from "@/components/ui/scroll-area";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const headerList = await headers()
  const nonce = headerList.get('x-nonce')

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?iid=G-8DXCNLS6XL"
          strategy="afterInteractive"
          nonce={nonce!}
        />
        <Script id="gtag-init" strategy="afterInteractive" nonce={nonce!}>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8DXCNLS6XL');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning className="flex flex-col min-h-screen max-h-screen min-w-screen">
        <AuthProvider>
          <StoreProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              
              <MenubarDemo />
              <ScrollArea className="w-full overflow-y-auto">
              <div className="min-h-0 max-w-[1280px] mx-auto">
                {children}
              </div>
              </ScrollArea>


            < Toaster />
            </ThemeProvider>
          </StoreProvider>
        </AuthProvider>

      </body>
    </html>
  );
}