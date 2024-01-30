import type { Metadata } from 'next'
import localFont from 'next/font/local'
// import dayjs from 'dayjs'
// import 'dayjs/locale/ko'
import clsx from 'clsx'

import '@/styles/globals.css'

// dayjs.locale('ko')

const Pretendard = localFont({
  src: '../assets/fonts/Pretendard/PretendardVariable.woff2',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Glow Up Diary',
  description: '개발성장일기',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={clsx(Pretendard.className)}>{children}</body>
    </html>
  )
}
