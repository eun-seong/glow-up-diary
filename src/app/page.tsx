import dayjs from 'dayjs'
import { redirect } from 'next/navigation'

export default function Home() {
  redirect(`/daily/${dayjs().format('YYYY-MM-DD')}`)
}
