import fs from 'fs'
import path from 'path'

import { PostMetaCard } from '@/components/MetaCard'
import Post from '@/components/Post'
import { getMetaData } from '@/utils/markdown'

interface Props {
  params: {
    filePath: string[]
  }
}

export default async function Page({ params }: Props) {
  const [collectionName, fileName] = params.filePath

  let markdownContent = ''

  const fullPath = path.join(
    process.cwd(),
    `/posts/collections/`,
    collectionName,
    `${fileName}.md`,
  )

  try {
    markdownContent = fs.readFileSync(fullPath, 'utf8')
  } catch {}

  return (
    <div>
      <PostMetaCard
        collectionName={collectionName}
        {...getMetaData<{ date: string; title: string }>(markdownContent)}
      />
      <Post html={markdownContent} />
    </div>
  )
}
