'use client'

import { useEffect, useRef, useCallback, type ReactNode } from 'react'

interface ScrollAnimationsProps {
  children: ReactNode
}

/**
 * Wraps the landing page and implements all 11 scroll-driven animation
 * sections ported from the original scripts.js.
 *
 * Uses requestAnimationFrame for scroll performance.
 * Renders children (the full page markup) and attaches
 * scroll/intersection/slider handlers via useEffect.
 */
export default function ScrollAnimations({ children }: ScrollAnimationsProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  // ─── Utilities ───
  const clamp01 = useCallback((v: number) => (v < 0 ? 0 : v > 1 ? 1 : v), [])
  const lerp = useCallback((a: number, b: number, t: number) => a + (b - a) * t, [])

  useEffect(() => {
    const root = wrapperRef.current
    if (!root) return

    // ─── 1. LOAD SEQUENCE ───
    document.body.classList.add('loaded')

    // ─── 2. DOM REFS ───
    const heroHeading = root.querySelector<HTMLElement>('.home-hero-heading-wrap')
    const mockupAnimScroll = root.querySelector<HTMLElement>('.mockup-anim-scroll')
    const mockupAnimTarget = root.querySelector<HTMLElement>('.mockup-anim-target')
    const featuresWrap = root.querySelector<HTMLElement>('.features-wrap')
    const featureItems = root.querySelectorAll<HTMLElement>('.features-item')
    const screenFeatureItems = root.querySelectorAll<HTMLElement>('.screen-features-item')
    const pricingInner = root.querySelector<HTMLElement>('.pricing-scroll-inner')
    const pricingNumber = root.querySelector<HTMLElement>('.pricing-scroll-number')
    const pricingLabel = root.querySelector<HTMLElement>('.pricing-scroll-label')
    const cardHandImg = root.querySelector<HTMLElement>('.card-hand-img')
    const nav = root.querySelector<HTMLElement>('.nav')

    // ─── 3. SCROLL STATE ───
    let ticking = false
    let pricingDone = false

    // ─── Hero heading: fade out 0→540 ───
    function updateHeroHeading(y: number) {
      if (!heroHeading) return
      if (y <= 0) {
        heroHeading.style.opacity = '1'
        heroHeading.style.transform = 'translateY(0px)'
      } else if (y >= 540) {
        heroHeading.style.opacity = '0'
        heroHeading.style.transform = 'translateY(-162px)'
      } else {
        const t = y / 540
        heroHeading.style.opacity = String(1 - t)
        heroHeading.style.transform = `translateY(${-162 * t}px)`
      }
    }

    // ─── Mockup scroll rotation: 0→1200 ───
    function updateMockupScroll(y: number) {
      if (!mockupAnimScroll) return
      const t = clamp01(y / 1200)
      const rot = lerp(30, 10, t)
      const sc = lerp(1, 1.28, t)
      const tx = lerp(0, 469, t)
      const ty = lerp(0, 107, t)
      mockupAnimScroll.style.transform =
        `rotate(${rot}deg) scale(${sc}) translate(${tx}px, ${ty}px)`
    }

    // ─── Features wrap: fade in 400→900, hold, fade out 1700→2000 ───
    function updateFeaturesWrap(y: number) {
      if (!featuresWrap) return
      if (y < 400) {
        featuresWrap.style.opacity = '0'
      } else if (y < 900) {
        featuresWrap.style.opacity = String(clamp01((y - 400) / 500))
      } else if (y < 1700) {
        featuresWrap.style.opacity = '1'
      } else if (y < 2000) {
        featuresWrap.style.opacity = String(1 - clamp01((y - 1700) / 300))
      } else {
        featuresWrap.style.opacity = '0'
      }
    }

    // ─── Feature items: smooth crossfade ───
    function updateFeatureItems(y: number) {
      if (featureItems.length === 0) return
      const ranges = [
        { fadeIn: 400, peak: 700, fadeOut: 1100, end: 1500 },
        { fadeIn: 1000, peak: 1150, fadeOut: 1300, end: 1600 },
        { fadeIn: 1200, peak: 1350, fadeOut: 1650, end: 1900 },
      ]
      let dominantIndex = -1
      let maxOp = 0

      featureItems.forEach((item, i) => {
        if (i >= ranges.length) return
        const r = ranges[i] as { fadeIn: number; peak: number; fadeOut: number; end: number }
        let op = 0.2

        if (y < r.fadeIn) op = 0.2
        else if (y < r.peak) op = lerp(0.2, 1.0, clamp01((y - r.fadeIn) / (r.peak - r.fadeIn)))
        else if (y < r.fadeOut) op = 1.0
        else if (y < r.end) op = lerp(1.0, 0.2, clamp01((y - r.fadeOut) / (r.end - r.fadeOut)))
        else op = 0.2

        if (y < 400) op = 0
        if (y > 2000) op = 0

        item.style.opacity = String(op)
        item.classList.toggle('active', op > 0.8)

        if (op > maxOp) {
          maxOp = op
          dominantIndex = i
        }
      })

      screenFeatureItems.forEach((screen, i) => {
        screen.style.display = i === dominantIndex ? 'block' : 'none'
      })
    }

    // ─── Mockup exit: 1700→2100 ───
    function updateMockupExit(y: number) {
      if (!mockupAnimTarget) return
      if (y < 1700) mockupAnimTarget.style.opacity = '1'
      else if (y >= 2100) mockupAnimTarget.style.opacity = '0'
      else mockupAnimTarget.style.opacity = String(1 - clamp01((y - 1700) / 400))
    }

    // ─── Pricing counter animation ───
    function animatePricingCounter() {
      if (!pricingNumber) return
      const stages = ['$15.00', '$12.00', '$9.00', '$6.00', '$3.00', '$0.00']
      const dur = 1200
      const start = performance.now()
      function tick(now: number) {
        const i = Math.min(
          stages.length - 1,
          Math.floor((now - start) / (dur / stages.length))
        )
        if (pricingNumber) pricingNumber.textContent = stages[i] ?? '$0.00'
        if (now - start < dur) requestAnimationFrame(tick)
        else if (pricingNumber) pricingNumber.textContent = '$0.00'
      }
      requestAnimationFrame(tick)
    }

    // ─── Pricing: inner + number + label fade in 1900→2200 ───
    function updatePricing(y: number) {
      if (!pricingNumber) return

      if (y < 1900) {
        pricingNumber.style.opacity = '0'
        pricingNumber.style.transform = 'translateY(64px)'
        if (pricingLabel) {
          pricingLabel.style.opacity = '0'
          pricingLabel.style.transform = 'translateY(64px)'
        }
        pricingDone = false
      } else if (y >= 2200) {
        pricingNumber.style.opacity = '1'
        pricingNumber.style.transform = 'translateY(0px)'
        if (pricingLabel) {
          pricingLabel.style.opacity = '1'
          pricingLabel.style.transform = 'translateY(0px)'
        }
        if (!pricingDone) {
          pricingDone = true
          animatePricingCounter()
        }
      } else {
        const t = clamp01((y - 1900) / 300)
        const ty = lerp(64, 0, t)
        pricingNumber.style.opacity = String(t)
        pricingNumber.style.transform = `translateY(${ty}px)`
        if (pricingLabel) {
          const tL = clamp01((y - 1950) / 250)
          pricingLabel.style.opacity = String(tL)
          pricingLabel.style.transform = `translateY(${lerp(64, 0, tL)}px)`
        }
        if (!pricingDone && t > 0.8) {
          pricingDone = true
          animatePricingCounter()
        }
      }
    }

    // ─── Card hand animation ───
    function updateCardHand(y: number) {
      if (!cardHandImg) return
      const driftStart = 4800
      const driftEnd = 5500

      if (y < driftStart) {
        cardHandImg.style.transform = 'translateY(0)'
      } else if (y >= driftEnd) {
        cardHandImg.style.transform = 'translateY(426.6px)'
      } else {
        const t = clamp01((y - driftStart) / (driftEnd - driftStart))
        const eased = t * t
        cardHandImg.style.transform = `translateY(${426.6 * eased}px)`
      }
    }

    // ─── Pricing inner: fade out after section scrolls past ───
    function updatePricingInner(y: number) {
      if (!pricingInner) return
      if (y < 4200) {
        pricingInner.style.opacity = '1'
      } else if (y >= 4800) {
        pricingInner.style.opacity = '0'
      } else {
        pricingInner.style.opacity = String(1 - clamp01((y - 4200) / 600))
      }
    }

    // ─── Nav blur ───
    function updateNav(y: number) {
      if (!nav) return
      if (y > 100) {
        nav.style.backgroundColor = 'rgba(255, 255, 255, 0.85)'
        nav.style.backdropFilter = 'blur(20px)'
        nav.style.setProperty('-webkit-backdrop-filter', 'blur(20px)')
      } else {
        nav.style.backgroundColor = 'transparent'
        nav.style.backdropFilter = 'none'
        nav.style.setProperty('-webkit-backdrop-filter', 'none')
      }
    }

    // ─── 4. MAIN SCROLL HANDLER ───
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        updateHeroHeading(y)
        updateMockupScroll(y)
        updateFeaturesWrap(y)
        updateFeatureItems(y)
        updateMockupExit(y)
        updatePricing(y)
        updateCardHand(y)
        updatePricingInner(y)
        updateNav(y)
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // initial state

    // ─── 5. CARD SLIDER ───
    const slider = root.querySelector<HTMLElement>('.slider-cards')
    let sliderCleanup: (() => void) | null = null

    if (slider) {
      const mask = slider.querySelector<HTMLElement>('.w-slider-mask')
      const slides = slider.querySelectorAll<HTMLElement>('.w-slide')
      const leftArrow = slider.querySelector<HTMLElement>('.w-slider-arrow-left')
      const rightArrow = slider.querySelector<HTMLElement>('.w-slider-arrow-right')
      const dots = slider.querySelectorAll<HTMLElement>('.w-slider-dot')
      let currentSlide = 0

      function goToSlide(index: number) {
        currentSlide = Math.max(0, Math.min(index, slides.length - 1))
        const firstSlide = slides[0]
        if (mask && firstSlide) {
          const slideW = firstSlide.getBoundingClientRect().width
          const ml = parseFloat(getComputedStyle(firstSlide).marginLeft) || 0
          const mr = parseFloat(getComputedStyle(firstSlide).marginRight) || 0
          const offset = currentSlide * (slideW + ml + mr)
          mask.style.transform = `translateX(-${offset}px)`
          mask.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }
        dots.forEach((dot, i) => dot.classList.toggle('w-active', i === currentSlide))
      }

      const onLeft = () => goToSlide(currentSlide - 1)
      const onRight = () => goToSlide(currentSlide + 1)
      const onResize = () => goToSlide(currentSlide)

      if (leftArrow) leftArrow.addEventListener('click', onLeft)
      if (rightArrow) rightArrow.addEventListener('click', onRight)
      dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)))

      let touchStartX = 0
      const onTouchStart = (e: TouchEvent) => {
        const touch = e.changedTouches[0]
        if (touch) touchStartX = touch.screenX
      }
      const onTouchEnd = (e: TouchEvent) => {
        const touch = e.changedTouches[0]
        if (!touch) return
        const diff = touchStartX - touch.screenX
        if (Math.abs(diff) > 50) goToSlide(currentSlide + (diff > 0 ? 1 : -1))
      }

      if (mask) {
        mask.addEventListener('touchstart', onTouchStart, { passive: true })
        mask.addEventListener('touchend', onTouchEnd, { passive: true })
      }

      goToSlide(0)
      window.addEventListener('resize', onResize)

      sliderCleanup = () => {
        if (leftArrow) leftArrow.removeEventListener('click', onLeft)
        if (rightArrow) rightArrow.removeEventListener('click', onRight)
        if (mask) {
          mask.removeEventListener('touchstart', onTouchStart)
          mask.removeEventListener('touchend', onTouchEnd)
        }
        window.removeEventListener('resize', onResize)
      }
    }

    // ─── 6. SMOOTH SCROLL ───
    function handleAnchorClick(e: MouseEvent) {
      const link = (e.currentTarget as HTMLAnchorElement)
      const id = link.getAttribute('href')
      if (!id || id === '#') return
      try {
        const target = document.querySelector(id)
        if (target) {
          e.preventDefault()
          target.scrollIntoView({ behavior: 'smooth' })
        }
      } catch {
        // invalid selector, ignore
      }
    }

    const anchorLinks = root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    anchorLinks.forEach((link) => link.addEventListener('click', handleAnchorClick))

    // ─── 7. COUNTRIES BANNER MARQUEE ───
    const countriesBanner = root.querySelector<HTMLElement>('.countries-banner')
    let marqueeFrame: number | null = null

    if (countriesBanner) {
      const wrap = countriesBanner.closest<HTMLElement>('.countries-banner-wrap')
      if (wrap) {
        wrap.style.overflow = 'hidden'
        const clone = countriesBanner.cloneNode(true) as HTMLElement
        clone.setAttribute('aria-hidden', 'true')
        wrap.appendChild(clone)
        let pos = 0

        function animBanner() {
          pos -= 0.5
          if (Math.abs(pos) >= (countriesBanner as HTMLElement).offsetWidth) pos = 0
          ;(countriesBanner as HTMLElement).style.transform = `translateX(${pos}px)`
          clone.style.transform = `translateX(${pos}px)`
          marqueeFrame = requestAnimationFrame(animBanner)
        }

        countriesBanner.style.display = 'inline-block'
        clone.style.display = 'inline-block'
        wrap.style.whiteSpace = 'nowrap'
        animBanner()
      }
    }

    // ─── 8. SECTION REVEALS (IntersectionObserver) ───
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            revealObs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    root
      .querySelectorAll(
        '.home-section-heading, .home-section-cards, .features-section, .footer-top'
      )
      .forEach((el) => revealObs.observe(el))

    // ─── 9. SLIDER DOT INIT ───
    const sliderDots = root.querySelectorAll<HTMLElement>('.w-slider-dot')
    if (sliderDots.length) sliderDots[0]?.classList.add('w-active')

    // ─── CLEANUP ───
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.body.classList.remove('loaded')
      anchorLinks.forEach((link) => link.removeEventListener('click', handleAnchorClick))
      if (marqueeFrame !== null) cancelAnimationFrame(marqueeFrame)
      if (sliderCleanup) sliderCleanup()
      revealObs.disconnect()
    }
  }, [clamp01, lerp])

  return (
    <div ref={wrapperRef} className="landing-page loaded">
      {children}
    </div>
  )
}
