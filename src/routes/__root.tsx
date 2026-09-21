import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { LocaleProvider } from '~/components/locale-context'
import { ThemeProvider } from '~/components/theme-context'
import { NotFound } from '~/components/NotFound'
import appCss from '~/styles.css?url'

const THEME_BOOT = `(() => { try { const s = localStorage.getItem('eis-theme'); const d = s === 'dark' || (!s && window.matchMedia('(prefers-color-scheme: dark)').matches); if (d) document.documentElement.classList.add('dark'); } catch {} })();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: 'Ethiopia International School — K–12 in Addis Ababa' },
      {
        name: 'description',
        content:
          'Ethiopia International School is a K–12 school on Bole Road, Addis Ababa. Cambridge-aligned upper school, character education, and portals for students, parents, and teachers.',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: NotFound,
  component: RootDocument,
})

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="min-h-dvh antialiased">
        <ThemeProvider>
          <LocaleProvider>
            <Outlet />
          </LocaleProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
