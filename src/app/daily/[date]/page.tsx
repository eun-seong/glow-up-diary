import fs from 'fs'
import path from 'path'

import { DailyMetaCard } from '@/components/MetaCard'
import Post from '@/components/Post'

interface Props {
  params: {
    date: string
  }
}

export default function Page({ params }: Props) {
  const currentDate = params.date
  const [year, month, date] = currentDate.split('-')
  let markdownContent = ''

  const fullPath = path.join(
    process.cwd(),
    `/posts/daily/${year}/${+month}/${currentDate}.md`,
  )

  try {
    markdownContent = fs.readFileSync(fullPath, 'utf8')
  } catch {}

  return (
    <div>
      <DailyMetaCard markdownContent={markdownContent} />
      <Post html={markdownContent} />
    </div>
  )
}
