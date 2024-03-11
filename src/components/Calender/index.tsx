'use client'
import { PropsWithChildren, useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import dayjs from 'dayjs'

import { DAYS } from '@/constants/days'

interface Props {
  date: string
  dailyDiaries: Record<number, string[]>
}

const CALENDER_HOVER_STYLE = 'hover:bg-lightblue hover:border hover:border-blue'

export default function Calender({ date: current, dailyDiaries }: Props) {
  const currentDate = dayjs(current)
  const [calendarDate, setCalendarDate] = useState(currentDate)

  const startOfMonthDate = calendarDate.startOf('month')
  const endOfMonthDate = currentDate.endOf('month')
  const startOfDay = startOfMonthDate.format('ddd')

  const handlePrevMonthClick = () => {
    setCalendarDate((cur) => cur.subtract(1, 'month'))
  }

  const handleNextMonthClick = () => {
    setCalendarDate((cur) => cur.add(1, 'month'))
  }

  return (
    <div
      className={clsx(
        'w-fit h-fit min-w-fit max-h-fit px-5 py-5 bg-white text-grey80 rounded-3xl',
      )}
    >
      <div className="flex pl-3 pb-2 justify-between items-center">
        <div className="font-semibold text-lg">
          {calendarDate.year()} {calendarDate.format('MMMM')}
        </div>
        <div className="flex gap-2">
          <div
            className="flex rounded-full h-10 w-10 text-grey80 hover:bg-grey20 cursor-pointer justify-center items-center"
            onClick={handlePrevMonthClick}
          >
            {'<'}
          </div>
          <div
            className="flex rounded-full h-10 w-10 text-grey80 hover:bg-grey20 cursor-pointer justify-center items-center"
            onClick={handleNextMonthClick}
          >
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
        {Array.from({ length: calendarDate.daysInMonth() }).map((_, idx) => {
          const date = dayjs(
            `${calendarDate.year()}-${calendarDate.month() + 1}-${idx + 1}`,
          ).format('YYYY-MM-DD')
          return (
            <Link key={idx} href={`/daily/${date}`}>
              <Date
                date={idx + 1}
                active={date === currentDate.format('YYYY-MM-DD')}
                available={dailyDiaries[calendarDate.year()].includes(date)}
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

interface DateProps {
  date: number
  active?: boolean
  available?: boolean
}
function Date({ date, active = false, available = false }: DateProps) {
  return (
    <div
      className={clsx(
        active
          ? 'bg-blue text-white'
          : available
          ? 'bg-white text-blue font-bold hover:border-blue ' +
            CALENDER_HOVER_STYLE
          : 'text-grey70 ' + CALENDER_HOVER_STYLE,
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
