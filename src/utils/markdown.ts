import { MarkdownMetaData } from '@/types/common.type'

export const getMetaData = <T extends MarkdownMetaData>(
  markdownContent: string,
): T => {
  const [first, second = ''] = markdownContent.split('---\n')
  return second
    .trim()
    .split('\n')
    .map((meta) => meta.split(': '))
    .reduce((res, [key, value]) => ({ ...res, [key]: value }), {}) as T
}
