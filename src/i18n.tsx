import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Lang = 'pt' | 'en'

/** Conteúdo que existe nos dois idiomas. */
export type Localized<T> = Record<Lang, T>

const STORAGE_KEY = 'portifolio:lang'

function ler(): Lang | null {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY)
    return salvo === 'pt' || salvo === 'en' ? salvo : null
  } catch {
    return null
  }
}

/** Escolha salva na frente do navegador; sem navegador em português, abre em inglês. */
function detectar(): Lang {
  const salvo = ler()
  if (salvo) return salvo
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

/**
 * As funções de formatação de números vivem fora de componentes e precisam do
 * idioma, então ele também fica aqui como variável de módulo.
 */
let idioma: Lang = 'pt'

export function idiomaAtual(): Lang {
  return idioma
}

export function localeAtual(): string {
  return idioma === 'pt' ? 'pt-BR' : 'en-US'
}

type Contexto = { lang: Lang; setLang: (lang: Lang) => void }

const LanguageContext = createContext<Contexto | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectar)

  idioma = lang

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* navegação privada: a escolha vale só para esta sessão */
    }
  }, [lang])

  const valor = useMemo(() => ({ lang, setLang }), [lang])

  return <LanguageContext.Provider value={valor}>{children}</LanguageContext.Provider>
}

function useContexto(): Contexto {
  const contexto = useContext(LanguageContext)
  if (!contexto) throw new Error('useLang precisa estar dentro de LanguageProvider')
  return contexto
}

export function useLang(): Lang {
  return useContexto().lang
}

export function useSetLang(): (lang: Lang) => void {
  return useContexto().setLang
}

/** Escolhe o idioma de um bloco de textos declarado junto do componente. */
export function useCopy<T>(copy: Localized<T>): T {
  return copy[useLang()]
}
