import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import CodeMirror from '@uiw/react-codemirror'
import { useMemo } from 'react'

/**
 * Редактор кода для задач. CodeMirror вместо textarea: подсветка синтаксиса,
 * автоотступы, парные скобки — на собеседовании пишут примерно в такой среде.
 */
export function CodeEditor({
  value, onChange, onRun, minHeight = '180px',
}: {
  value: string
  onChange: (v: string) => void
  onRun: () => void
  minHeight?: string
}) {
  const extensions = useMemo(() => [javascript()], [])

  return (
    <div
      className="cm-wrap"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          e.stopPropagation()
          onRun()
        }
      }}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={oneDark}
        extensions={extensions}
        minHeight={minHeight}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true,
          autocompletion: false,
          bracketMatching: true,
          closeBrackets: true,
          indentOnInput: true,
        }}
      />
    </div>
  )
}
