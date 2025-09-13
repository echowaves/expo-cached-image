import * as FileSystem from "expo-file-system/legacy"
import { DownloadOptions } from "expo-file-system/legacy"
import React, { useEffect, useRef, useState } from "react"
import { Image, ImageProps, ImageURISource } from "react-native"
import * as CONST from "./consts"

type CachedImageProps = Omit<ImageProps, "source"> & {
  cacheKey: string
  source: Omit<ImageURISource, "uri"> & { uri: string, expiresIn?: number }
  placeholderContent?: React.ReactNode
}

const CachedImage: React.FC<CachedImageProps> = (props) => {
  const { source, cacheKey, placeholderContent, ...rest } = props
  const { uri, headers, expiresIn } = source
  const sanitizedKey = CONST.sanitizeCacheKey(cacheKey)
  const fileURI = `${CONST.IMAGE_CACHE_FOLDER}${sanitizedKey}.png`

  const [imgUri, setImgUri] = useState<string | null>(fileURI)

  const componentIsMounted = useRef(false)
  const requestOption = headers ? { headers } : undefined

  useEffect(() => {
    componentIsMounted.current = true;
    void loadImageAsync()
    return () => {
      componentIsMounted.current = false;
    };
  }, []); 

  const loadImageAsync = async () => {
    try {
      const metadata = await FileSystem.getInfoAsync(fileURI)
      const expired = Boolean(
        metadata?.exists &&
          expiresIn &&
          new Date().getTime() / 1000 - metadata.modificationTime > expiresIn
      )

      if (!metadata?.exists || metadata?.size === 0 || expired) {
        await setImgUri(null)
        if (componentIsMounted.current) {          
          if (expired) {
            await FileSystem.deleteAsync(fileURI, { idempotent: true })
          }

          const response = await FileSystem.downloadAsync(uri, fileURI, requestOption)
          if (componentIsMounted.current && response?.status === 200) {
            setImgUri(`${fileURI}`)
          }
          if (response?.status !== 200) {
            FileSystem.deleteAsync(fileURI, { idempotent: true })
          }
        }
      } 
    } catch (err) {
      console.error("Error loading image:", err)
      setImgUri(uri)
    }
  }

  if (!imgUri) return placeholderContent || null

  return (
    <Image
      {...rest}
      source={{
        ...source,
        uri: imgUri,
      }}
    />
  )
}

export const CacheManager = {
  addToCache: async ({ file, key }: { file: string; key: string }) => {
    const sanitizedKey = CONST.sanitizeCacheKey(key)
    await FileSystem.copyAsync({
      from: file,
      to: `${CONST.IMAGE_CACHE_FOLDER}${sanitizedKey}.png`,
    })
    return await CacheManager.getCachedUri({ key })
  },

  getCachedUri: async ({ key }: { key: string }) => {
    const sanitizedKey = CONST.sanitizeCacheKey(key)
    return await FileSystem.getContentUriAsync(
      `${CONST.IMAGE_CACHE_FOLDER}${sanitizedKey}.png`
    )
  },

  downloadAsync: async ({
    uri,
    key,
    options,
  }: {
    uri: string
    key: string
    options: DownloadOptions
  }) => {
    const sanitizedKey = CONST.sanitizeCacheKey(key)
    return await FileSystem.downloadAsync(
      uri,
      `${CONST.IMAGE_CACHE_FOLDER}${sanitizedKey}.png`,
      options
    )
  },

  getMetadata: async ({ key }: { key: string }) => {
    const sanitizedKey = CONST.sanitizeCacheKey(key)
    const fileURI = `${CONST.IMAGE_CACHE_FOLDER}${sanitizedKey}.png`
    
    try {
      const metadata = await FileSystem.getInfoAsync(fileURI)
      
      if (!metadata?.exists) {
        return null
      }

      return {
        exists: metadata.exists,
        size: metadata.size,
        modificationTime: new Date(metadata.modificationTime * 1000),
        uri: fileURI,
        isDirectory: metadata.isDirectory,
      }
    } catch (err) {
      console.error("Error getting cache metadata:", err)
      return null
    }
  },
}

export default CachedImage
