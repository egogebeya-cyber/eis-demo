import { createContext, useCallback, useContext, type ReactNode } from 'react'
import { t as translate, type TranslationKey } from '~/lib/i18n'

type LocaleContextValue = {
  locale: 'en'
  setLocale: (locale: 'en') => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const t = useCallback((key: TranslationKey, vars?: Record<string, string | number>) => translate('en', key, vars), [])
  const setLocale = useCallback((_locale: 'en') => {}, [])

  return (
    <LocaleContext.Provider value={{ locale: 'en', setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
