import { useMedia } from './useMedia'

export const useDarkMode = () => useMedia('(prefers-color-scheme: dark)')
