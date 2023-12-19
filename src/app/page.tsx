import Calender from '@/components/Calender'
import dayjs from 'dayjs'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-black">
      <Calender date={dayjs().format('YYYY-MM-DD')} />
    </main>
  )
}
