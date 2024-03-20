import * as marked from 'marked'
interface Props {
  html: string
}

export default function Post({ html }: Props) {
  function preprocess(markdown: string) {
    const [first, second = '', ...contents] = markdown.split('---\n')
    if (!first && second) {
      return contents.join('---\n')
    }
    return markdown
  }

  return (
    <div className="prose w-full max-w-post">
      <div
        dangerouslySetInnerHTML={{
          __html: marked.use({ hooks: { preprocess } }).parse(html),
        }}
      ></div>
    </div>
  )
}
