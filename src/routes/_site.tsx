import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import { GsChrome, GsFooter, GsStageTiles } from '~/components/gs-chrome'
import { JsonLd } from '~/components/site-ui'
import { getSettingsFn } from '~/server/public/functions'

export const Route = createFileRoute('/_site')({
  loader: async () => ({ site: await getSettingsFn() }),
  component: SiteLayout,
})

function usePublicReveal(enabled: boolean, key: string) {
  useEffect(() => {
    if (!enabled) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.querySelector('.gs-public')
    if (!root) return

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(
        'main section, main .gs-know-grid, .gs-stages, .gs-footer',
      ),
    )
    if (!nodes.length) return

    if (reduce) {
      nodes.forEach((el) => el.classList.add('gs-in'))
      return
    }

    nodes.forEach((el) => el.classList.add('gs-reveal'))
    const first = nodes[0]
    first?.classList.add('gs-in')

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('gs-in')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
    )
    nodes.forEach((el) => {
      if (el !== first) io.observe(el)
    })
    return () => io.disconnect()
  }, [enabled, key])
}

function SiteLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isHome = pathname === '/'
  usePublicReveal(!isHome, pathname)

  if (isHome) {
    return (
      <div className="gs-public" key={pathname}>
        <JsonLd />
        <Outlet />
      </div>
    )
  }

  return (
    <div className="gs-public" key={pathname}>
      <JsonLd />
      <GsChrome />
      <GsStageTiles />
      <main id="main">
        <Outlet />
      </main>
      <GsFooter />
    </div>
  )
}
