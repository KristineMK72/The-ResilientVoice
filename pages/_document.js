// /pages/_document.js (CORRECTED)
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* 1. Viewport Meta Tag MUST go inside the Head component */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* 2. Standard Metadata */}
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
