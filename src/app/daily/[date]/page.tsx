import fs from 'fs'
import path from 'path'
import * as marked from 'marked'

import MetaCard from '@/components/MetaCard'
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

  function preprocess(markdown: string) {
    const [first, second = '', ...contents] = markdown.split('---\n')
    if (!first && second) {
      return contents.join('---\n')
    }
    return markdown
  }

  return (
    <div>
      <MetaCard markdownContent={markdownContent} />
      <Post
        html={marked.use({ hooks: { preprocess } }).parse(markdownContent)}
      />
    </div>
  )
}
