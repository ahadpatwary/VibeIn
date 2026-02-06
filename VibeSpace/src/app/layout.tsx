import "@/styles/globals.css";
import { ThemeProvider } from "@/components/TthemeProvider";
import { Toaster } from "@/components/ui/sonner"
// import StoreProvider from './StoreProvider';
import { headers } from 'next/headers'
import Script from 'next/script';


interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const headerList = await headers()
  const nonce = headerList.get('x-nonce')
  console.log("ahad");

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
      <body suppressHydrationWarning className="min-h-dvh max-h-dvh min-w-[310px] m-0 p-0 overflow-x-auto">
          {/* <StoreProvider> */}
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >

              {children}

            < Toaster />
            </ThemeProvider>
          {/* </StoreProvider> */}

      </body>
    </html>
  );
}