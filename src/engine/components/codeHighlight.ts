/** Escape a raw code string before adding the small, readable comment accents. */
const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const commentClass = (comment: string) => {
  const key = /важн|главн|критич|последоват|параллел|огранич|нельзя|не дел|ошиб|trade[- ]?off|fallback|only|must/i.test(comment)
  return key ? 'code-comment code-comment-key' : 'code-comment'
}

/**
 * Adds colour only to comments. The code remains selectable and readable as
 * text; this deliberately avoids a full syntax highlighter in long articles.
 */
const highlightEscapedCode = (value: string) => value.split('\n').map((line) => {
  const match = line.match(/^(\s*)(\/\/.*)$/)
  if (match) {
    const indent = match[1] ?? ''
    const comment = match[2] ?? ''
    return `${indent}<span class="${commentClass(comment)}">${comment}</span>`
  }

  // Also catch a trailing comment, but leave URLs such as https:// alone.
  const inline = line.match(/^(.*?)(\s+\/\/.*)$/)
  if (!inline) return line
  const code = inline[1] ?? ''
  const comment = inline[2] ?? ''
  return `${code}<span class="${commentClass(comment)}">${comment}</span>`
}).join('\n')

export function highlightCode(code: string) {
  return highlightEscapedCode(escapeHtml(code))
}

/** Highlight <pre class="code"> blocks already embedded in trusted content. */
export function highlightCodeBlocks(html: string) {
  return html.replace(
    /(<pre\b[^>]*\bclass=["'][^"']*\bcode\b[^"']*["'][^>]*>)([\s\S]*?)(<\/pre>)/gi,
    (_whole, open: string, body: string, close: string) => `${open}${highlightEscapedCode(body)}${close}`,
  )
}
