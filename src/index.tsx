import React, { useEffect, useRef, useState } from 'react'
import { Image, ImageProps, ImageURISource } from 'react-native'
import { CacheManager, cacheFileFor, loadIntoCache } from './cache'

type CachedImageProps = Omit<ImageProps, 'source'> & {
  cacheKey: string
  source: Omit<ImageURISource, 'uri'> & { uri: string, expiresIn?: number }
  placeholderContent?: React.ReactNode
}

const CachedImage: React.FC<CachedImageProps> = (props) => {
  const { source, cacheKey, placeholderContent, ...rest } = props
  const { uri, headers, expiresIn } = source
  const file = cacheFileFor(cacheKey)
  const fileURI = file.uri

  const [imgUri, setImgUri] = useState<string | null>(fileURI)

  const componentIsMounted = useRef(false)

  useEffect(() => {
    componentIsMounted.current = true
    void loadImageAsync()
    return () => {
      componentIsMounted.current = false
    }
  }, [])

  const calculateFileAge = (modificationTime: number): number => {
    return (Date.now() - modificationTime) / 1000
  }

  const hasExpiryConfig = (): boolean => {
    return expiresIn != null && expiresIn > 0
  }

  const isFileExpired = (metadata: ReturnType<typeof file.info>): boolean => {
    if (!metadata.exists || !hasExpiryConfig()) {
      return false
    }
    const fileAge = calculateFileAge(metadata.modificationTime ?? 0)
    return fileAge > (expiresIn ?? 0)
  }

  const isFileInvalid = (metadata: ReturnType<typeof file.info>): boolean => {
    return !metadata.exists || (metadata.size ?? 0) === 0
  }

  const shouldRedownload = (metadata: ReturnType<typeof file.info>, expired: boolean): boolean => {
    return isFileInvalid(metadata) || expired
  }

  const updateImageUri = (newUri: string | null): void => {
    if (componentIsMounted.current) {
      setImgUri(newUri)
    }
  }

  // Shared by the missing/invalid and the expired paths: loadIntoCache clears a stale
  // target itself, and dedupes with any other component that wants the same key.
  const handleRedownload = async (): Promise<void> => {
    setImgUri(null)
    if (!componentIsMounted.current) return

    await loadIntoCache({ uri, key: cacheKey, headers })
    updateImageUri(fileURI)
  }

  const handleImageLoadError = (err: unknown): void => {
    console.error('Error loading image:', err)
    setImgUri(uri)
  }

  const loadImageAsync = async (): Promise<void> => {
    try {
      const metadata = file.info()
      const expired = isFileExpired(metadata)

      if (!shouldRedownload(metadata, expired)) {
        return
      }

      await handleRedownload()
    } catch (err) {
      handleImageLoadError(err)
    }
  }

  if (imgUri !== null && imgUri !== '') {
    return (
      <Image
        {...rest}
        source={{
          ...source,
          uri: imgUri
        }}
      />
    )
  }

  return <>{placeholderContent ?? null}</>
}

export { CacheManager }

export default CachedImage
