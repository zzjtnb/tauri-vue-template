import { defineMock } from '../base'

export default defineMock({
  url: 'themes',
  method: 'GET',
  body: {
    themes: [
      {
        id: 'light',
        name: '浅色主题',
        primary: '#3b82f6',
        background: '#ffffff',
        foreground: '#000000',
      },
      {
        id: 'dark',
        name: '深色主题',
        primary: '#60a5fa',
        background: '#0a0a0a',
        foreground: '#ffffff',
      },
      {
        id: 'system',
        name: '跟随系统',
        primary: 'auto',
        background: 'auto',
        foreground: 'auto',
      },
    ],
    current: 'system',
  },
})
