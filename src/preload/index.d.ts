import type { AtelierApi } from '../shared/types/app'

declare global {
  interface Window {
    atelier: AtelierApi
  }
}
