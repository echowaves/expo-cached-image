import React, { useEffect, useState, useRef } from "react"

import { Image, ImageProps } from "react-native"
import * as FileSystem from "expo-file-system"
import { DownloadOptions } from "expo-file-system/src/FileSystem.types";

import * as CONST from "./consts"

type CachedImageProps = Omit<ImageProps, "source"> & {
  cacheKey: string
  source: { uri: string
    headers?: Record<string, string>
    expiresIn?: number }
  placeholderContent?: React.ReactNode
}

const CachedImage: React.FC<CachedImageProps> = (props) => {
  const { source, cacheKey, placeholderContent, ...rest } = props
  const { uri, headers, expiresIn } = source
  const fileURI = `${CONST.IMAGE_CACHE_FOLDER}${cacheKey}`

  const [imgUri, setImgUri] = useState<string | null>(fileURI)

  const componentIsMounted = useRef(true)
  const requestOption = headers ? { headers } : undefined

  const _callback = () => {
    if (!componentIsMounted.current) {
      void downloadResumableRef.current.pauseAsync()
      void FileSystem.deleteAsync(fileURI, { idempotent: true }) // delete file locally if it was not downloaded properly
    }
  }

  const downloadResumableRef = useRef(
      FileSystem.createDownloadResumable(uri, fileURI, requestOption, _callback),
  )

  useEffect(() => {
    void loadImage()
    return () => {
      componentIsMounted.current = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadImage = async () => {
    try {
      // Use the cached image if it exists
      const metadata = await FileSystem.getInfoAsync(fileURI)
      const expired =
          Boolean(metadata.exists && expiresIn &&
              new Date().getTime() / 1000 - metadata.modificationTime > expiresIn)
      // console.log({expiresIn, expired})

      // console.log({modificationTime: metadata.modificationTime, currentTime: new Date().getTime() / 1000})
      // console.log({metadata})
      if (!metadata.exists || metadata?.size === 0 || expired) {
        if (componentIsMounted.current) {
          setImgUri(null)

          if (expired) {
            await FileSystem.deleteAsync(fileURI, { idempotent: true })
          }
          // download to cache
          setImgUri(null)

          const response = await downloadResumableRef.current.downloadAsync()
          if (componentIsMounted.current && response?.status === 200) {
            setImgUri(`${fileURI}?`) // deep clone to force re-render
          }
          if (response?.status !== 200) {
            FileSystem.deleteAsync(fileURI, { idempotent: true }) // delete file locally if it was not downloaded properly
          }
        }
      }
    } catch (err) {
      // console.log({ err })
      setImgUri(uri)
    }
  }

  // console.log({placeholderContent})
  if (!imgUri) return <>{placeholderContent}</> || null

  return (
      <Image
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...rest}
          source={{
            ...source,
            uri: imgUri,
          }}
      />
  )
}


export const CacheManager = {
  addToCache: async ({ file, key }: {file: string, key: string}) => {
    await FileSystem.copyAsync({
      from: file,
      to: `${CONST.IMAGE_CACHE_FOLDER}${key}`,
    })
    // const uri = await FileSystem.getContentUriAsync(`${CONST.IMAGE_CACHE_FOLDER}${key}`)
    // return uri
    return await CacheManager.getCachedUri({key})
  },

  getCachedUri: async ({ key }: {key: string}) => {
    return await FileSystem.getContentUriAsync(
        `${CONST.IMAGE_CACHE_FOLDER}${key}`,
    )
  },

  downloadAsync: async ({ uri, key, options }: {uri: string, key: string, options: DownloadOptions}) => {
    return await FileSystem.downloadAsync(
        uri,
        `${CONST.IMAGE_CACHE_FOLDER}${key}`,
        options,
    )
  },
}

export default CachedImage
