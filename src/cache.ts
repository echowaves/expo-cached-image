import { File } from 'expo-file-system'
import * as CONST from './consts'

type Headers = Record<string, string>

export interface LoadIntoCacheOptions {
  uri: string
  key: string
  headers?: Headers
}

/**
 * Downloads in flight, keyed by sanitized cache key, so components that mount at the
 * same time for one key share a single download instead of racing on the same target.
 */
const inFlight = new Map<string, Promise<string>>()

let tempCounter = 0

const nextTempName = (): string => {
  tempCounter += 1
  return `tmp-${Date.now().toString(36)}-${tempCounter.toString(36)}`
}

export const cacheFileFor = (key: string): File => {
  return new File(CONST.IMAGE_CACHE_FOLDER, `${CONST.sanitizeCacheKey(key)}.png`)
}

/** `File.delete()` is synchronous and throws when the path is already gone. */
const deleteQuietly = (target: File): void => {
  try {
    target.delete()
  } catch {
    // Already deleted by someone else, or not deletable here. The download below decides.
  }
}

const downloadIntoCache = async ({ uri, cacheKey, headers }: { uri: string, cacheKey: string, headers?: Headers }): Promise<string> => {
  const target = new File(CONST.IMAGE_CACHE_FOLDER, `${cacheKey}.png`)

  // Every caller that gets here has decided this entry must be replaced, so a stale,
  // expired or zero-byte leftover is removed first instead of blocking the promotion.
  deleteQuietly(target)

  // Download under a unique name: two components whose server-derived filename is the
  // same (or a leftover from an interrupted download) can then never collide, and the
  // final entry only appears once all bytes are on disk.
  const temp = new File(CONST.IMAGE_CACHE_FOLDER, nextTempName())
  try {
    const downloaded = await File.downloadFileAsync(uri, temp, headers != null ? { headers, idempotent: true } : { idempotent: true })
    if (downloaded.size === 0) {
      throw new Error(`Downloaded an empty file for cache key "${cacheKey}"`)
    }
    await downloaded.move(target, { overwrite: true })
    return target.uri
  } catch (err) {
    deleteQuietly(temp)
    throw err
  }
}

/**
 * Downloads `uri` into the cache entry for `key` and resolves with the entry's uri.
 * Concurrent calls for the same key share one download.
 */
export const loadIntoCache = async ({ uri, key, headers }: LoadIntoCacheOptions): Promise<string> => {
  const cacheKey = CONST.sanitizeCacheKey(key)

  const pending = inFlight.get(cacheKey)
  if (pending != null) {
    return await pending
  }

  // Registered before the first await, so two calls from the same tick share one download.
  const running = downloadIntoCache({ uri, cacheKey, headers }).finally(() => {
    inFlight.delete(cacheKey)
  })
  inFlight.set(cacheKey, running)

  return await running
}

export const CacheManager = {
  addToCache: async ({ file, key }: { file: string, key: string }) => {
    await new File(file).copy(cacheFileFor(key), { overwrite: true })
    return await CacheManager.getCachedUri({ key })
  },

  getCachedUri: async ({ key }: { key: string }) => {
    return cacheFileFor(key).uri
  },

  downloadAsync: async ({
    uri,
    key,
    options
  }: {
    uri: string
    key: string
    options?: { headers?: Headers }
  }) => {
    await loadIntoCache({ uri, key, headers: options?.headers })
    return cacheFileFor(key)
  },

  getMetadata: async ({ key }: { key: string }) => {
    const fileRef = cacheFileFor(key)
    const fileURI = fileRef.uri

    try {
      const metadata = fileRef.info()

      if (!metadata.exists) {
        return null
      }

      return {
        exists: metadata.exists,
        size: metadata.size ?? 0,
        modificationTime: new Date(metadata.modificationTime ?? 0),
        uri: fileURI,
        isDirectory: false
      }
    } catch (err) {
      console.error('Error getting cache metadata:', err)
      return null
    }
  }
}
