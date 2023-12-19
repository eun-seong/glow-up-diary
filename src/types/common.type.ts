export type ParamsProps<T> = { params: Record<string, string> } & T

export type MarkdownMetaData = Record<string, string>

export type DailyReportMetaData = MarkdownMetaData & {
  date: string
  today: string
}
