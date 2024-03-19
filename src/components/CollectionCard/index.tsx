import Link from 'next/link'

interface Props {
  collectionName: string
  files: CollectionFile[]
}

export type Collection = {
  name: string
  title: string
}

export type CollectionFile = {
  fileName: string
  title: string
  date: string
  path: string
}

export default function CollectionCard({ collectionName, files }: Props) {
  return (
    <div className="prose">
      <h3>{collectionName}</h3>
      {
        <ol>
          {files.map(({ title, path, date }) => (
            <li key={path}>
              <Link href={`posts/${path}`} className="no-underline">
                <span className="underline">{title}</span>
                <span className="ml-2 text-xs text-grey80 font-normal">
                  {date}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      }
    </div>
  )
}
