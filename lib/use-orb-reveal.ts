import { useEffect } from 'react'
import { particleInteraction } from '@/lib/particle-state'

export function useOrbReveal(
  cardRef: React.RefObject<HTMLElement | null>,
  labelRef: React.RefObject<HTMLElement | null>,
  scrollGuard = false,
) {
  useEffect(() => {
    let raf: number
    let triggered = false
    let scattered  = false

    const tick = () => {
      const el = cardRef.current
      if (el) {
        const r  = el.getBoundingClientRect()
        const vH = window.innerHeight

        if (r.top < vH && r.bottom > 0) {
          if (!particleInteraction.gravityBoost) {
            particleInteraction.gravityTarget.active = true
            particleInteraction.gravityTarget.x = r.left + r.width  / 2
            particleInteraction.gravityTarget.y = r.top  + r.height / 2
          }
          const ok = !scrollGuard || window.scrollY > vH * 0.3
          if (!triggered && r.top > vH * 0.5 && ok) {
            triggered = true
            particleInteraction.gravityBoost = true
          }
          if (triggered && !scattered && r.top < vH * 0.5) {
            scattered = true
            particleInteraction.gravityBoost    = false
            particleInteraction.scatterTrigger  = Date.now()
            if (labelRef.current) labelRef.current.style.opacity = '1'
          }
          if (scattered && labelRef.current) {
            const exit = Math.max(0, 1 - Math.max(0, -r.top) / 300)
            labelRef.current.style.opacity = String(exit)
          }
        } else if (r.top >= vH) {
          triggered = false
          scattered  = false
          particleInteraction.gravityBoost         = false
          particleInteraction.gravityTarget.active = false
          if (labelRef.current) labelRef.current.style.opacity = '0'
        } else {
          particleInteraction.gravityTarget.active = false
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      particleInteraction.gravityTarget.active = false
      particleInteraction.gravityBoost         = false
    }
  }, [])
}
