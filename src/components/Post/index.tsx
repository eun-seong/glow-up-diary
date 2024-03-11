interface Props {
  html: string | Promise<string>
}

export default function Post({ html }: Props) {
  return (
    <div className="prose w-full max-w-post">
      <div
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      ></div>
    </div>
  )
}
