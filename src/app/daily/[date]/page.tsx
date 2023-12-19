import fs from 'fs'
import path from 'path'
import * as marked from 'marked'
import Calender from '@/components/Calender'
import dayjs from 'dayjs'

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
    '/posts',
    `/daily/${currentDate}.md`,
  )
  try {
    markdownContent = fs.readFileSync(fullPath, 'utf8')
  } catch {}

  function preprocess(markdown: string) {
    const [first, second = '', ...contents] = markdown.split('---\n')
    if (!first && second) {
      const metadata = second
        .trim()
        .split('\n')
        .map((meta) => meta.split(': '))
        .reduce((res, [key, value]) => ({ ...res, [key]: value }), {})
      console.log(metadata)
      return contents.join('---\n')
    }
    return markdown
  }

  return (
    <div>
      <div
        dangerouslySetInnerHTML={{
          __html: marked.use({ hooks: { preprocess } }).parse(markdownContent),
        }}
      ></div>
    </div>
  )
}
