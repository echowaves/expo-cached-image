// `jest.mock` below is hoisted above this import, so the factory runs while these consts are
// still in TDZ; it only closes over them and touches them from method bodies, which is safe.
import { CacheManager, loadIntoCache } from '../src/cache'

// In-memory stand-in for expo-file-system, mirroring the behaviours this package relies on:
// move/copy reject an existing destination unless `overwrite` is set, download rejects an
// existing destination unless `idempotent` is set, and delete throws when the path is gone.

interface MockEntry {
  size: number
  mtime: number
}

interface MockDownloadOptions {
  headers?: Record<string, string>
  idempotent?: boolean
}

const mockFiles = new Map<string, MockEntry>()
const mockOps: string[] = []
const mockDownloads: Array<{ url: string, destination: string, options?: MockDownloadOptions }> = []
let mockFailNextDownload = false
let mockWriteThenFail = false
let mockEmptyNextDownload = false
let mockUndeletableTarget: string | null = null

jest.mock('expo-file-system', () => {
  const join = (folderUri: string, name: string): string => `${folderUri.replace(/\/$/, '')}/${name}`

  class MockFile {
    static downloadFileAsync = async (url: string, destination: MockFile, options?: MockDownloadOptions): Promise<MockFile> => {
      // Yield first so concurrent callers overlap, like the real native call.
      await Promise.resolve()
      mockDownloads.push({ url, destination: destination.path, options })
      mockOps.push('download')

      if (mockWriteThenFail) {
        mockFiles.set(destination.path, { size: 5, mtime: Date.now() })
        throw new Error('Download failed midway')
      }
      if (mockFailNextDownload) {
        mockFailNextDownload = false
        throw new Error('Call to function downloadFileAsync has been rejected.')
      }

      mockFiles.set(destination.path, { size: mockEmptyNextDownload ? 0 : 10, mtime: Date.now() })
      mockEmptyNextDownload = false
      return destination
    }

    readonly path: string

    constructor (location: string, name?: string) {
      this.path = name != null ? join(location, name) : location.replace(/\/$/, '')
    }

    get uri (): string {
      return this.path
    }

    get size (): number {
      return mockFiles.get(this.path)?.size ?? 0
    }

    info (): { exists: boolean, size: number, modificationTime: number } {
      const entry = mockFiles.get(this.path)
      return { exists: entry != null, size: entry?.size ?? 0, modificationTime: entry?.mtime ?? 0 }
    }

    delete (): void {
      if (!mockFiles.has(this.path)) {
        throw new Error(`Unable to delete '${this.path}': path does not exist`)
      }
      if (mockUndeletableTarget === this.path) {
        throw new Error(`Unable to delete '${this.path}': operation not permitted`)
      }
      mockOps.push(`delete:${this.path}`)
      mockFiles.delete(this.path)
    }

    async move (destination: MockFile, options?: { overwrite?: boolean }): Promise<void> {
      const source = mockFiles.get(this.path)
      if (source == null) {
        throw new Error(`Unable to move '${this.path}': path does not exist`)
      }
      if (mockFiles.has(destination.path) && options?.overwrite !== true) {
        throw new Error("Call to function 'FileSystemFile.move' has been rejected. → Caused by: Destination already exists")
      }
      mockOps.push(`move:${destination.path}:overwrite=${String(options?.overwrite === true)}`)
      mockFiles.delete(this.path)
      mockFiles.set(destination.path, source)
    }

    async copy (destination: MockFile, options?: { overwrite?: boolean }): Promise<void> {
      const source = mockFiles.get(this.path)
      if (source == null) {
        throw new Error(`Unable to copy '${this.path}': path does not exist`)
      }
      if (mockFiles.has(destination.path) && options?.overwrite !== true) {
        throw new Error('Destination already exists')
      }
      mockOps.push(`copy:${destination.path}:overwrite=${String(options?.overwrite === true)}`)
      mockFiles.set(destination.path, source)
    }
  }

  class MockDirectory {
    readonly uri: string

    constructor (uri: string) {
      this.uri = uri
    }
  }

  return {
    File: MockFile,
    Directory: MockDirectory,
    Paths: { cache: { uri: 'file:///cache/' } }
  }
})

// Mock paths are full file URIs, mirroring expo-file-system's `File.uri`.
const CACHE_URI = 'file:///cache/photo-1.png'
const URI = 'https://example.test/photo-1'

beforeEach(() => {
  mockFiles.clear()
  mockOps.length = 0
  mockDownloads.length = 0
  mockFailNextDownload = false
  mockWriteThenFail = false
  mockEmptyNextDownload = false
  mockUndeletableTarget = null
})

describe('loadIntoCache', () => {
  it('promotes the download with overwrite so an existing destination cannot throw', async () => {
    // A stale target that survives the pre-download cleanup (delete blocked, as it can be
    // on a real device) must not stop the promotion.
    mockFiles.set(CACHE_URI, { size: 4, mtime: Date.now() - 60000 })
    mockUndeletableTarget = CACHE_URI

    await expect(loadIntoCache({ uri: URI, key: 'photo-1' })).resolves.toBe(CACHE_URI)

    expect(mockOps).toContain(`move:${CACHE_URI}:overwrite=true`)
    expect(mockFiles.get(CACHE_URI)?.size).toBe(10)
  })

  it('clears a zero-byte leftover before re-downloading', async () => {
    mockFiles.set(CACHE_URI, { size: 0, mtime: Date.now() - 60000 })

    await expect(loadIntoCache({ uri: URI, key: 'photo-1' })).resolves.toBe(CACHE_URI)

    const deletedAt = mockOps.indexOf(`delete:${CACHE_URI}`)
    expect(deletedAt).toBeGreaterThanOrEqual(0)
    expect(deletedAt).toBeLessThan(mockOps.indexOf('download'))
    expect(mockFiles.get(CACHE_URI)?.size).toBe(10)
  })

  it('runs one download for concurrent loads of the same key', async () => {
    const first = loadIntoCache({ uri: URI, key: 'photo-1' })
    const second = loadIntoCache({ uri: URI, key: 'photo-1' })

    await expect(Promise.all([first, second])).resolves.toEqual([CACHE_URI, CACHE_URI])

    expect(mockDownloads).toHaveLength(1)
  })

  it('asks for an idempotent download and forwards headers', async () => {
    await loadIntoCache({ uri: URI, key: 'photo-1', headers: { Authorization: 'token' } })

    expect(mockDownloads[0]?.options).toEqual({ headers: { Authorization: 'token' }, idempotent: true })
  })

  it('discards a partial download and stays usable after the failure', async () => {
    mockWriteThenFail = true

    await expect(loadIntoCache({ uri: URI, key: 'photo-1' })).rejects.toThrow('midway')

    const leftovers = [...mockFiles.keys()].filter(name => name.includes('tmp-'))
    expect(leftovers).toHaveLength(0)

    mockWriteThenFail = false
    await expect(loadIntoCache({ uri: URI, key: 'photo-1' })).resolves.toBe(CACHE_URI)
  })

  it('rejects an empty download instead of caching it', async () => {
    mockEmptyNextDownload = true

    await expect(loadIntoCache({ uri: URI, key: 'photo-1' })).rejects.toThrow('empty file')

    expect(mockFiles.has(CACHE_URI)).toBe(false)
  })
})

describe('CacheManager.addToCache', () => {
  it('overwrites an existing entry instead of throwing', async () => {
    mockFiles.set('/local/thumb.jpg', { size: 12, mtime: Date.now() })
    mockFiles.set(CACHE_URI, { size: 3, mtime: Date.now() })

    await expect(CacheManager.addToCache({ file: '/local/thumb.jpg', key: 'photo-1' })).resolves.toBe(CACHE_URI)

    expect(mockOps).toContain(`copy:${CACHE_URI}:overwrite=true`)
  })
})
