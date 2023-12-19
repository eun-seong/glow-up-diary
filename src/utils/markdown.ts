import { MarkdownMetaData } from '@/types/common.type'

export const getMetaData = <T extends MarkdownMetaData>(
  markdownContent: string,
): T | null => {
  const [first, second = ''] = markdownContent.split('---\n')
  if (!first && second) {
    return second
      .trim()
      .split('\n')
      .map((meta) => meta.split(': '))
      .reduce((res, [key, value]) => ({ ...res, [key]: value }), {}) as T
  }
  return null
}
