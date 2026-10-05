import { useEffect, useRef } from 'react'

type Point3 = { x: number; y: number; z: number }
type Point2 = Point3 & { sx: number; sy: number; depth: number }

/** A quiet, interactive 3D torus-knot instrument for the interview workspace. */
export function AmbientOrbit() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const ctx = context
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    const strands = 3
    const samples = 240
    let width = 0
    let height = 0
    let dpr = 1
    let frame = 0
    let raf = 0
    let angle = 0
    let scrollAngle = 0
    let targetScrollAngle = window.scrollY * .0015
    let alive = true
    let projected: Point2[][] = []

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      dpr = Math.min(window.devicePixelRatio || 1, 1.6)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }

    const onPointerMove = (event: PointerEvent) => {
      pointer.tx = (event.clientX / Math.max(width, 1) - .5) * 2
      pointer.ty = (event.clientY / Math.max(height, 1) - .5) * 2
    }

    const onScroll = () => { targetScrollAngle = window.scrollY * .0015 }

    const project = (point: Point3, spin: number): Point2 => {
      const cx = Math.cos(spin)
      const sx = Math.sin(spin)
      const cy = Math.cos(spin * .73 + .35 + pointer.y * .1)
      const sy = Math.sin(spin * .73 + .35 + pointer.y * .1)
      const cz = Math.cos(-spin * .42 + pointer.x * .08)
      const sz = Math.sin(-spin * .42 + pointer.x * .08)
      const x1 = point.x * cz - point.y * sz
      const y1 = point.x * sz + point.y * cz
      const y2 = y1 * cx - point.z * sx
      const z2 = y1 * sx + point.z * cx
      const x3 = x1 * cy + z2 * sy
      const z3 = -x1 * sy + z2 * cy
      const perspective = 3.5 / (3.5 + z3)
      const size = Math.min(height * .245, width * .19, 250)
      return {
        x: x3, y: y2, z: z3,
        sx: width * .83 + pointer.x * 12 + x3 * size * perspective,
        sy: height * .56 + pointer.y * 10 + y2 * size * perspective,
        depth: perspective,
      }
    }

    const makePoint = (t: number, strand: number): Point3 => {
      const phase = t + strand * Math.PI * 2 / strands
      const major = 1.12 + .34 * Math.cos(3 * phase)
      return {
        x: major * Math.cos(2 * phase),
        y: major * Math.sin(2 * phase),
        z: .58 * Math.sin(3 * phase),
      }
    }

    const draw = () => {
      if (!alive) return
      ctx.clearRect(0, 0, width, height)
      if (!width || !height) return

      pointer.x += (pointer.tx - pointer.x) * .035
      pointer.y += (pointer.ty - pointer.y) * .035
      scrollAngle += (targetScrollAngle - scrollAngle) * .055
      const spin = angle + scrollAngle
      projected = Array.from({ length: strands }, (_, strand) =>
        Array.from({ length: samples + 1 }, (_, index) => project(makePoint(index / samples * Math.PI * 2, strand), spin)),
      )

      const originX = width * .83 + pointer.x * 12
      const originY = height * .56 + pointer.y * 10
      const halo = ctx.createRadialGradient(originX, originY, 0, originX, originY, Math.min(height * .43, width * .28, 420))
      halo.addColorStop(0, 'rgba(68, 129, 255, .075)')
      halo.addColorStop(.42, 'rgba(105, 83, 218, .038)')
      halo.addColorStop(1, 'rgba(105, 83, 218, 0)')
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, width, height)

      // Two tilted orbital traces sit behind the woven knot.
      for (let ring = 0; ring < 2; ring += 1) {
        ctx.beginPath()
        for (let i = 0; i <= 160; i += 1) {
          const t = i / 160 * Math.PI * 2
          const tilt = ring ? -.52 : .68
          const rx = Math.min(height * .30, width * .23, 300) * (ring ? 1.24 : .94)
          const ry = rx * (ring ? .31 : .42)
          const x = originX + Math.cos(t + spin * (ring ? -.18 : .22)) * rx
          const y = originY + Math.sin(t + spin * (ring ? -.18 : .22)) * ry * Math.cos(tilt)
            + Math.sin(t + spin * (ring ? -.18 : .22)) * rx * Math.sin(tilt) * .25
          if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.strokeStyle = ring ? 'rgba(154, 126, 255, .13)' : 'rgba(74, 172, 255, .15)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Draw rear-to-front so the knot has real depth instead of a flat logo feel.
      const edges = projected.flatMap((points, strand) => points.slice(0, -1).flatMap((point, index) => {
        const next = points[index + 1]
        return next ? [{ a: point, b: next, strand, order: (point.depth + next.depth) / 2 }] : []
      })).sort((a, b) => a.order - b.order)
      for (const edge of edges) {
        const bright = Math.max(0, Math.min(1, (edge.order - .72) / .52))
        const hue = edge.strand === 1 ? '153, 119, 255' : edge.strand === 2 ? '75, 198, 218' : '91, 158, 255'
        ctx.beginPath()
        ctx.moveTo(edge.a.sx, edge.a.sy)
        ctx.lineTo(edge.b.sx, edge.b.sy)
        ctx.strokeStyle = `rgba(${hue}, ${.055 + bright * .29})`
        ctx.lineWidth = .6 + bright * 1.25
        ctx.stroke()
      }

      // Sparse beads travel around the strands; each gets a small optical bloom.
      for (let strand = 0; strand < strands; strand += 1) {
        const points = projected[strand]!
        for (let bead = 0; bead < 12; bead += 1) {
          const index = (Math.floor((bead / 12 + frame * (.000035 + strand * .000006)) * samples) % samples + samples) % samples
          const point = points[index]!
          const pulse = .5 + .5 * Math.sin(frame * .045 + bead * 1.7 + strand)
          const radius = 1.1 + pulse * 1.8 * point.depth
          const hue = strand === 1 ? '180, 143, 255' : strand === 2 ? '105, 224, 222' : '133, 191, 255'
          ctx.beginPath()
          ctx.arc(point.sx, point.sy, radius * 3.2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${hue}, ${.035 + pulse * .07})`
          ctx.fill()
          ctx.beginPath()
          ctx.arc(point.sx, point.sy, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${hue}, ${.28 + pulse * .55})`
          ctx.fill()
        }
      }

      // A faint 3D dust field makes the surrounding space feel less empty.
      for (let i = 0; i < 42; i += 1) {
        const phase = i * 2.399 + frame * .0015
        const radius = (Math.sin(i * 17.13) * .5 + .5) * Math.min(height * .34, width * .24, 320)
        const x = originX + Math.cos(phase) * radius
        const y = originY + Math.sin(phase * 1.37) * radius * .64
        const alpha = .08 + .12 * (.5 + .5 * Math.sin(frame * .025 + i))
        ctx.fillStyle = `rgba(157, 188, 255, ${alpha})`
        ctx.fillRect(x, y, 1.2, 1.2)
      }

      frame += 1
      angle += reduceMotion.matches ? 0 : .003
      if (!reduceMotion.matches) raf = window.requestAnimationFrame(draw)
    }

    const onMotionPreference = () => {
      window.cancelAnimationFrame(raf)
      if (reduceMotion.matches) draw()
      else raf = window.requestAnimationFrame(draw)
    }
    const onVisibility = () => {
      if (document.hidden) window.cancelAnimationFrame(raf)
      else if (!reduceMotion.matches) raf = window.requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    reduceMotion.addEventListener('change', onMotionPreference)
    resize()
    if (!reduceMotion.matches) raf = window.requestAnimationFrame(draw)

    return () => {
      alive = false
      window.cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      reduceMotion.removeEventListener('change', onMotionPreference)
    }
  }, [])

  return <canvas ref={canvasRef} className="ambient-orbit" aria-hidden="true" />
}
