import { highlightCode } from './codeHighlight'

export function CodeBlock({ code }: { code: string }) {
  return <pre className="code" dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
}
