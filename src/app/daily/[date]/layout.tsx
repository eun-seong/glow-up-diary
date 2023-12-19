import clsx from 'clsx'

import Calender from '@/components/Calender'

export default function DailyLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: {
    date: string
  }
}) {
  return (
    <div className="min-h-screen p-24 bg-black w-full">
      <div
        className={clsx(
          'flex text-white mx-auto max-w-[1100px] gap-20',
          'max-lg:flex-col max-lg:gap-10',
        )}
      >
        <Calender date={params.date} />
        <div className={clsx('', 'max-lg:p-0')}>{children}</div>
      </div>
    </div>
  )
}
