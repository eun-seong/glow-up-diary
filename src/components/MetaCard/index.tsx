import { DailyReportMetaData } from '@/types/common.type'
import { getMetaData } from '@/utils/markdown'
import clsx from 'clsx'

interface Props {
  markdownContent: string
}
export default function MetaCard({ markdownContent }: Props) {
  const metadata = getMetaData<DailyReportMetaData>(markdownContent)

  return (
    <div
      className={clsx('w-full px-8 py-5 bg-[#151515] text-white rounded-3xl')}
    >
      {metadata ? (
        <>
          <div className="font-bold text-xl pb-2">{metadata?.date}</div>
          <ul>
            {metadata?.today
              ?.split(',')
              .filter(Boolean)
              .map((text, idx) => (
                <li key={idx}>{text.trim()}</li>
              ))}
          </ul>
        </>
      ) : (
        <>🍓 EMPTY 🍓</>
      )}
    </div>
  )
}
