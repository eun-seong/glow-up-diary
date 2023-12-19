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
    <div className="flex min-h-screen p-24 bg-black text-white">
      <div>
        <Calender date={params.date} />
      </div>
      <div className="flex-1 px-10">{children}</div>
    </div>
  )
}
