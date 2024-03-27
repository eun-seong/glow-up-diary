import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'

interface Props {
  html: string
}

export default function Post({ html }: Props) {
  const marked = new Marked(
    markedHighlight({
      async: false,
      langPrefix: 'hljs language-',
      highlight(code, lang, info) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext'
        return hljs.highlight(code, { language }).value
      },
    }),
    {
      renderer: {
        image: (href: string, title: string | null, text: string) =>
          `<img src="/images/posts/${href}" alt="${text}" title="${title}" draggable="false" />`,
      },
      hooks: { preprocess },
    },
  )

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
          __html: marked
            .setOptions({ pedantic: false, gfm: true, breaks: false })
            .parse(html),
        }}
      ></div>
    </div>
  )
}
