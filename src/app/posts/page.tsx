import fs from 'fs'
import path from 'path'

import { getMetaData } from '@/utils/markdown'

import CollectionCard, { CollectionFile } from '@/components/CollectionCard'

export default async function PostsPage() {
  const collections = await getCollections()

  return (
    <div>
      {Object.entries(collections).map(([collectionName, files]) => (
        <>
          <CollectionCard
            key={collectionName}
            collectionName={collectionName}
            files={files}
          />
          <div className="h-[1px] bg-grey60 my-10" />
        </>
      ))}
    </div>
  )
}

async function getCollections() {
  const collectionPath = path.join(process.cwd(), `/posts/collections`)

  try {
    const files = fs
      .readdirSync(collectionPath, {
        encoding: 'utf8',
        recursive: true,
      })
      .filter((name) => name.match(/.+\.md$/))
      .sort()
      .reduce((res, filePath) => {
        const [collectionName, fileName] = filePath.split('/')
        const [collectionTitle] = fs
          .readFileSync([collectionPath, collectionName, 'info.csv'].join('/'))
          .toString()
          .split(',')

        const content = fs
          .readFileSync([collectionPath, filePath].join('/'))
          .toString()
        const metaData = getMetaData<CollectionFile>(content)
        return {
          ...res,
          [collectionTitle]: [
            ...(res?.[collectionTitle] || []),
            { ...metaData, name: fileName, path: filePath },
          ],
        }
      }, {} as Record<string, CollectionFile[]>)
    return files
  } catch (e) {
    console.error(e)
  }

  return {}
}
