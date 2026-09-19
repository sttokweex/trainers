import { useEffect, useRef } from 'react'
import type { LegacyDemo } from '@/engine/types'

/**
 * Обёртка над императивными демо, доставшимися от старой версии: они
 * наполняют переданный контейнер вручную. Монтируем один раз на элемент,
 * как это делал mountDemos с флагом dataset.mounted.
 */
export function Demo({ name, mount }: { name: string; mount: LegacyDemo | undefined }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node || node.dataset.mounted) return
    if (!mount) {
      node.innerHTML = `<div class="demo-note">демо «${name}» не найдено</div>`
      return
    }
    node.dataset.mounted = '1'
    try {
      mount(node)
    } catch (e) {
      node.innerHTML =
        '<div class="demo-note">демо не загрузилось: ' + (e instanceof Error ? e.message : String(e)) + '</div>'
    }
    return () => {
      // React 18+ в StrictMode монтирует дважды — чистим, чтобы не задваивалось
      node.innerHTML = ''
      delete node.dataset.mounted
    }
  }, [name, mount])

  return <div ref={ref} />
}
