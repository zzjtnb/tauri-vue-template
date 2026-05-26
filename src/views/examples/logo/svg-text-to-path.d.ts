declare module 'svg-text-to-path' {
  interface FontSource {
    wght?: number | [number, number]
    ital?: number
    wdth?: number | [number, number]
    source?: string
    buffer?: ArrayBuffer
  }

  interface Cache {
    get: (key: string) => unknown
    set: (key: string, value: unknown) => void
  }

  interface SessionParams {
    fonts?: Record<string, FontSource[]>
    useFontFace?: boolean
    useFontFaceAjax?: boolean
    fontsUrl?: string
    fontsUrlCache?: number
    googleApiKey?: string
    googleCache?: number
    fontsDir?: string
    fontsDirCache?: number
    fontCache?: Cache
    decimals?: number
    split?: boolean
    keepFontAttrs?: boolean
    textAttr?: string
    noFontAction?: 'skipNode' | 'error' | string
    fallbackFamilies?: string[]
    fallbackGlyph?: [string, string | number]
    familyClasses?: Record<string, string[]>
  }

  interface SessionStat {
    text: number
    replaced: number
    skipped: number
    errors: number
  }

  class Session {
    constructor(svg: SVGSVGElement | string, params?: SessionParams)
    replaceAll(selector?: string): Promise<SessionStat>
    getSvgString(): string
    destroy(): void
    createCache(duration: number): Cache
    static defaultRenderer: unknown
    static defaultProviders: unknown[]
    static providers: Record<string, unknown>
    static renderers: Record<string, unknown>
  }

  export default Session
}
