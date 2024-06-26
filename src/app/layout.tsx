import type { Metadata } from 'next'
import localFont from 'next/font/local'
// import dayjs from 'dayjs'
// import 'dayjs/locale/ko'
import clsx from 'clsx'

import '@/styles/globals.css'
import Header from '@/components/Header'
import { GoogleAnalytics } from '@next/third-parties/google'

// dayjs.locale('ko')

import 'highlight.js/styles/github-dark.css'

const Pretendard = localFont({
  src: '../assets/fonts/Pretendard/PretendardVariable.woff2',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'dev.eun',
  description: '개발성장일기',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
          integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn"
        />
      </head>
      <body className={clsx(Pretendard.className, 'min-h-screen w-full')}>
        {process.env.NODE_ENV === 'production' && (
          <GoogleAnalytics gaId="G-N96YSK5HNP" />
        )}
        <Header />
        <div className="mx-auto max-w-post py-12 px-7">{children}</div>
      </body>
    </html>
  )
}
