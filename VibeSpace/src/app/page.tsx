import { headers } from 'next/headers'
import Script from 'next/script'

export default async function Page() {
  const nonce = (await headers()).get('x-nonce')

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"
        strategy="afterInteractive"
        nonce={nonce!}
      />

      {/* Inline config script */}
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        nonce={nonce!}
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXX');
        `}
      </Script>

      {/* 🔥 এখানেই তোমার UI */}
      <main>
        <h1>Hello World</h1>
        <p>এখানে যেকোনো JSX render করতে পারো</p>
      </main>
    </>
  )
}
