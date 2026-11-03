// One place that serialises structured data, so pages never hand-write a
// <script type="application/ld+json"> block. Escaping `<` keeps a stray
// closing tag inside content from ending the script element early.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
