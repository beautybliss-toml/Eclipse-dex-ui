import { PublicKey } from '@solana/web3.js'
import i18n from '@/i18n'

export const isClient = () => typeof window !== 'undefined'
export const isLocal = () => typeof window !== 'undefined' && window.location.host.includes('localhost')
export const isDocumentVisible = () => isClient() && document.visibilityState === 'visible'
export const isProdEnv = () => isClient() && window.location.host === 'xxx'

export const encodeStr = (str?: string, showNum = 3, dotNum = 2) => {
  if (!str) return ''
  return [str.slice(0, showNum), '.'.repeat(dotNum), str.slice(-1 * showNum)].join('')
}

export const emptyFunc = () => {}

export const isValidPublicKey = (val: string | PublicKey): boolean => {
  try {
    new PublicKey(val)
    return true
  } catch {
    return false
  }
}

export const sleep = async (time?: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({})
    }, time || 1000)
  })
}

export const retry = async <T>(
  fetcher: () => Promise<any>,
  options?: { retryCount?: number; interval?: number; errorMsg?: string; onError?: () => void }
): Promise<T> => {
  const { retryCount = 10, interval = 1000, errorMsg = 'request failed', onError } = options || {}
  let retryCounter = 0
  return new Promise((resolve, reject) => {
    fetcher()
      .then((res) => {
        resolve(res)
      })
      .catch(() => {
        const intervalId = window.setInterval(async () => {
          retryCounter++
          if (retryCounter > retryCount) {
            onError?.()
            clearInterval(intervalId)
            reject(new Error(errorMsg))
          }
          try {
            const res = await fetcher()
            clearInterval(intervalId)
            resolve(res)
          } catch (e: any) {
            if (e.message === 'tx failed') {
              onError?.()
              clearInterval(intervalId)
              reject(new Error(`${i18n.t('transaction.title')} ${i18n.t(`transaction.failed`)}`))
            }
          }
        }, interval)
      })
  })
}
