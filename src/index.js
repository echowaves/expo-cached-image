import React, {
  useEffect, useState, useRef,
} from 'react'

import {
  Image,
} from 'react-native'
import * as FileSystem from 'expo-file-system'

import PropTypes from 'prop-types'

import * as CONST from './consts.js'

const CachedImage = props => {
  const { source: { uri }, cacheKey } = props
  const fileURI = `${CONST.IMAGE_CACHE_FOLDER}${cacheKey}`

  const [imgUri, setImgUri] = useState(fileURI)

  const componentIsMounted = useRef(true)
  const downloadResumableRef = useRef(FileSystem.createDownloadResumable(uri, fileURI, {}, _callback))

  useEffect(() => {
    loadImage()
    return () => {
      componentIsMounted.current = false
    }
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const loadImage = async () => {
    try {
      // Use the cached image if it exists
      const metadata = await FileSystem.getInfoAsync(fileURI)
      if (!metadata.exists) {
        // download to cache
        if (componentIsMounted.current) {
          await downloadResumableRef.current.downloadAsync()
          if (componentIsMounted.current) {
            setImgUri(`${fileURI}?`) // deep clone to force re-render
          }
        }
      }
    } catch (err) {
      // console.log({ err })
    }
  }

  const _callback = downloadProgress => {
    if (componentIsMounted.current === false) {
      downloadResumableRef.current.pauseAsync()
    }
  }

  if (!imgUri) return null

  return (
    <Image
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      source={{
        uri: imgUri,
      }}
    />
  )
}

CachedImage.propTypes = {
  source: PropTypes.object.isRequired,
  cacheKey: PropTypes.string.isRequired,
}

const _makeSureDirectoryExists = async ({ directory }) => {
  const tmpDir = await FileSystem.getInfoAsync(directory)
  // create cacheDir if does not exist
  if (!tmpDir.exists) {
    await FileSystem.makeDirectoryAsync(directory)
  }
}

export const CacheManager = {
  addToCache: async ({ file, key }) => {
    await FileSystem.copyAsync({
      from: file,
      to: `${CONST.IMAGE_CACHE_FOLDER}${key}`,
    })
    // const uri = await FileSystem.getContentUriAsync(`${CONST.IMAGE_CACHE_FOLDER}${key}`)
    // return uri
    const uri = await CacheManager.getCachedUri({ key })
    return uri
  },

  getCachedUri: async ({ key }) => {
    const uri = await FileSystem.getContentUriAsync(`${CONST.IMAGE_CACHE_FOLDER}${key}`)
    return uri
  },
}

export default CachedImage
