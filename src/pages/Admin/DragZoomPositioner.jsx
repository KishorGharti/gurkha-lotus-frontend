import { useRef, useState } from 'react'
import styles from './DragZoomPositioner.module.css'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export default function DragZoomPositioner({ imageUrl, aspect = '1 / 1', value, onChange, caption }) {
  const [pos, setPos] = useState(value)
  const frameRef = useRef(null)
  const dragRef = useRef(null)

  const handlePointerDown = (e) => {
    e.preventDefault()
    dragRef.current = { startX: e.clientX, startY: e.clientY, startCropX: pos.cropX, startCropY: pos.cropY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!dragRef.current || !frameRef.current) return
    const { width, height } = frameRef.current.getBoundingClientRect()
    const { startX, startY, startCropX, startCropY } = dragRef.current
    setPos(p => {
      const next = {
        ...p,
        cropX: clamp(startCropX - ((e.clientX - startX) / width) * 100 / p.zoom, 0, 100),
        cropY: clamp(startCropY - ((e.clientY - startY) / height) * 100 / p.zoom, 0, 100),
      }
      dragRef.current.latest = next
      return next
    })
  }

  const handlePointerUp = (e) => {
    if (dragRef.current?.latest) onChange(dragRef.current.latest)
    dragRef.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  const reset = () => {
    const next = { cropX: 50, cropY: 50, zoom: 1 }
    setPos(next)
    onChange(next)
  }

  return (
    <div className={styles.wrap}>
      <div
        ref={frameRef}
        className={styles.frame}
        style={{ aspectRatio: aspect }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <img
          src={imageUrl} alt="" draggable={false}
          style={{
            objectPosition: `${pos.cropX}% ${pos.cropY}%`,
            transform: `scale(${pos.zoom})`,
            transformOrigin: `${pos.cropX}% ${pos.cropY}%`,
          }}
        />
      </div>

      {caption && <p className={styles.caption}>{caption}</p>}
      <p className={styles.hint}>Drag the image to reposition it.</p>

      <label className={styles.zoomRow}>
        Zoom
        <input
          type="range" min="1" max="3" step="0.05" value={pos.zoom}
          onInput={(e) => setPos(p => ({ ...p, zoom: Number(e.target.value) }))}
          onChange={(e) => onChange({ ...pos, zoom: Number(e.target.value) })}
          className={styles.zoomSlider}
        />
      </label>

      <button type="button" className={styles.resetLink} onClick={reset}>Reset position</button>
    </div>
  )
}
