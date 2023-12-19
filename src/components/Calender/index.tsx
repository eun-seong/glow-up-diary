import { PropsWithChildren } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import dayjs from 'dayjs'

import { DAYS } from '@/constants/days'

interface Props {
  date: string
}

export default function Calender({ date: current }: Props) {
  const [year, month, date] = current.split('-')
  const currentDate = dayjs(current)

  const startOfMonthDate = currentDate.startOf('month')
  const endOfMonthDate = currentDate.endOf('month')
  const startOfDay = startOfMonthDate.format('ddd')

  return (
    <div
      className={clsx('w-fit px-5 py-5 bg-[#151515] text-white rounded-3xl')}
    >
      <div className="flex pl-3 pb-2 justify-between items-center">
        <div className="font-semibold text-lg">
          {year} {currentDate.format('MMMM')}
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-full h-10 w-10 hover:bg-[#212121] cursor-pointer justify-center items-center">
            {'<'}
          </div>
          <div className="flex rounded-full h-10 w-10 hover:bg-[#212121] cursor-pointer justify-center items-center">
            {'>'}
          </div>
        </div>
      </div>
      <div className={clsx('grid grid-cols-7 gap-1')}>
        {Array.from({ length: 7 }).map((_, idx) => (
          <Days key={idx}>{DAYS[idx]}</Days>
        ))}
        {Array.from({ length: startOfMonthDate.day() }).map((_, idx) => (
          <div key={idx}></div>
        ))}
        {Array.from({ length: currentDate.daysInMonth() }).map((_, idx) => (
          <Link key={idx} href={`/daily/${year}-${month}-${idx + 1}`}>
            <Date date={idx + 1} active={currentDate.date() == idx + 1} />
          </Link>
        ))}
      </div>
    </div>
  )
}

interface DateProps {
  date: number
  active?: boolean
}
function Date({ date, active = false }: DateProps) {
  return (
    <div
      className={clsx(
        active ? 'bg-[#ffff3c] text-[#151515]' : 'hover:bg-[#212121]',
        'flex rounded-full h-10 w-10 cursor-pointer justify-center items-center text-sm',
      )}
    >
      {date}
    </div>
  )
}

function Days({ children }: PropsWithChildren) {
  return (
    <div
      className={clsx('flex h-10 w-10 justify-center items-center text-base')}
    >
      {children}
    </div>
  )
}
