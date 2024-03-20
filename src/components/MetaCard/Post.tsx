import { DailyReportMetaData } from '@/types/common.type'
import { getMetaData } from '@/utils/markdown'
import clsx from 'clsx'
import path from 'path'
import fs from 'fs'
import { CollectionFile } from '../CollectionCard'
import Link from 'next/link'

interface Props {
  collectionName: string
  date: string
  title: string
}
export default async function PostMetaCard({
  collectionName,
  date,
  title,
}: Props) {
  const collections = await getCollections(collectionName)
  const [collectionTitle] = fs
    .readFileSync(
      path.join(process.cwd(), `/posts/collections/${collectionName}/info.csv`),
    )
    .toString()
    .split(',')

  return (
    <div className="prose">
      <div className="mb-5">
        <h1 className="mb-3">{title}</h1>
        <div>
          <span className="text-sm text-grey80">
            {date.replaceAll('-', '.')}
          </span>
        </div>
      </div>
      <div
        className={clsx(
          'w-full px-8 py-5 bg-white text-black rounded-3xl prose',
        )}
      >
        <h3>{collectionTitle}</h3>
        <ol>
          {collections?.map(({ title, fileName }, idx) => (
            <li key={idx}>
              <Link href={`/posts/${collectionName}/${fileName}`}>{title}</Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

async function getCollections(collectionName: string) {
  const collectionPath = path.join(
    process.cwd(),
    `/posts/collections/${collectionName}`,
  )

  try {
    const files = fs
      .readdirSync(collectionPath, {
        encoding: 'utf8',
        recursive: true,
      })
      .filter((name) => name.match(/.+\.md$/))
      .sort()
      .reduce((res, filePath) => {
        const content = fs
          .readFileSync([collectionPath, filePath].join('/'))
          .toString()
        const metaData = getMetaData<CollectionFile>(content)
        return [
          ...(res || []),
          {
            ...metaData,
            fileName: filePath.replace('.md', ''),
            path: filePath,
          },
        ]
      }, [] as CollectionFile[])
    return files
  } catch (e) {
    console.error(e)
  }

  return []
}
