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

  const renderer = new marked.Renderer()
  renderer.image = (href: string, title: string | null, text: string) =>
    `<img src="/images/posts/${href}" alt="${text}" title="${title}" draggable="false" />`

  return (
    <div className="prose w-full max-w-post">
      <div
        dangerouslySetInnerHTML={{
          __html: marked.use({ hooks: { preprocess }, renderer }).parse(html),
        }}
      ></div>
    </div>
  )
}
