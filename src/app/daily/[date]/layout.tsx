import clsx from 'clsx'
import fs from 'fs'
import path from 'path'

import Calender from '@/components/Calender'

export default async function DailyLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: {
    date: string
  }
}) {
  const dailyDiaries = await getDailyDiaryNames()

  return (
    <div className="min-h-screen p-24 bg-black w-full">
      <div
        className={clsx(
          'flex text-white mx-auto max-w-[1100px] gap-20',
          'max-lg:flex-col max-lg:gap-10',
        )}
      >
        <Calender date={params.date} dailyDiaries={dailyDiaries} />
        <div className={clsx('', 'max-lg:p-0')}>{children}</div>
      </div>
    </div>
  )
}

async function getDailyDiaryNames() {
  const diaryPath = path.join(process.cwd(), `/posts/daily/`)

  try {
    const files = fs
      .readdirSync(diaryPath, {
        encoding: 'utf8',
        recursive: true,
      })
      .filter((name) => name.match(/^\d{4}\/\d{4}\-\d{2}\-\d{2}\.md$/))
      .reduce((res, name) => {
        const [year, fileName] = name.split('/')
        const [date] = fileName.split('.')
        return {
          ...res,
          [+year]: [...(res?.[+year] || []), date],
        }
      }, {} as Record<number, string[]>)
    return files
  } catch {}

  return {}
}
