import { Directory, File } from "expo-file-system"
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
  const file = new File(CONST.IMAGE_CACHE_FOLDER, `${sanitizedKey}.png`)
  const fileURI = file.uri

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
      const metadata = file.info()
      const expired = Boolean(
        metadata.exists &&
          expiresIn &&
          (Date.now() - (metadata.modificationTime ?? 0)) / 1000 > expiresIn
      )

      if (!metadata.exists || (metadata.size ?? 0) === 0 || expired) {
        await setImgUri(null)
        if (componentIsMounted.current) {          
          if (expired) {
            file.delete()
          }

          const downloaded = await File.downloadFileAsync(uri, new Directory(CONST.IMAGE_CACHE_FOLDER), requestOption)
          // Move/rename if the server selected a different filename
          if (downloaded.uri !== fileURI) {
            new File(downloaded.uri).move(file)
          }
          if (componentIsMounted.current) {
            setImgUri(`${fileURI}`)
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
  new File(file).copy(new File(CONST.IMAGE_CACHE_FOLDER, `${sanitizedKey}.png`))
    return await CacheManager.getCachedUri({ key })
  },

  getCachedUri: async ({ key }: { key: string }) => {
    const sanitizedKey = CONST.sanitizeCacheKey(key)
  return new File(CONST.IMAGE_CACHE_FOLDER, `${sanitizedKey}.png`).uri
  },

  downloadAsync: async ({
    uri,
    key,
    options,
  }: {
    uri: string
    key: string
    options: { headers?: Record<string, string> }
  }) => {
    const sanitizedKey = CONST.sanitizeCacheKey(key)
    const result = await File.downloadFileAsync(
      uri,
      new Directory(CONST.IMAGE_CACHE_FOLDER),
      options
    )
    const target = new File(CONST.IMAGE_CACHE_FOLDER, `${sanitizedKey}.png`)
    if (result.uri !== target.uri) {
      new File(result.uri).move(target)
    }
    return result
  },

  getMetadata: async ({ key }: { key: string }) => {
    const sanitizedKey = CONST.sanitizeCacheKey(key)
    const fileRef = new File(CONST.IMAGE_CACHE_FOLDER, `${sanitizedKey}.png`)
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
        isDirectory: false,
      }
    } catch (err) {
      console.error("Error getting cache metadata:", err)
      return null
    }
  },
}

export default CachedImage
