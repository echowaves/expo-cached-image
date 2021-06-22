import React, {
  useEffect, useState, useRef,
} from 'react'

import { Image } from 'react-native-elements'

import * as FileSystem from 'expo-file-system'

import PropTypes from 'prop-types'

import * as CONST from './consts.js'

const CachedImage = props => {
  const { source: { uri }, cacheKey } = props

  const fileURI = `${CONST.IMAGE_CACHE_FOLDER}${cacheKey}`

  const [imgUri, setImgUri] = useState(fileURI)

  const componentIsMounted = useRef(true)

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
          await FileSystem.downloadAsync(
            uri,
            fileURI
          )
          if (componentIsMounted.current) {
            await setImgUri(null)
            if (componentIsMounted.current) {
              await setImgUri(fileURI) // deep clone to force re-render
            }
          }
        }
      }
    } catch (err) {
      // console.log({ err })
      if (componentIsMounted.current) {
        // setImgContents(`data:image/jpeg;base64,`)
      }
    }
  }

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
  // size in MB, default to 500
  cleanupCache: async ({ size = 400 } = { size: 400 }) => {
    await _makeSureDirectoryExists({ directory: CONST.IMAGE_CACHE_FOLDER })
    // cleanup old cached files
    const cachedFiles = await FileSystem.readDirectoryAsync(`${CONST.IMAGE_CACHE_FOLDER}`)

    let position = 0
    let results = []
    const batchSize = 20

    // batching promise.all to avoid exxessive promisses call
    while (position < cachedFiles.length) {
      const itemsForBatch = cachedFiles.slice(position, position + batchSize)
        results = [...results, ...await Promise.all(itemsForBatch.map(async file => {// eslint-disable-line
          const info = await FileSystem.getInfoAsync(`${CONST.IMAGE_CACHE_FOLDER}${file}`)// eslint-disable-line
        return Promise.resolve({ file, modificationTime: info.modificationTime, size: info.size })
      }))]
      position += batchSize
    }

    // cleanup cache, leave only 500mb wirth of most recent files
    results
      .sort((a, b) => a.modificationTime - b.modificationTime)

    let sumSize = results.reduce((accumulator, currentValue) => accumulator + Number(currentValue.size), 0)

    // let's calculate the sum in the first pass
    // second pass to clean up the cach files based on the total size of files in the cache
    for (let i = 0; i < results.length; i += 1) {
      if (sumSize > size * 1000 * 1000) { // 0.4GB
        FileSystem.deleteAsync(`${CONST.IMAGE_CACHE_FOLDER}${results[i].file}`, { idempotent: true })
        sumSize -= results[i].size
      }
    }
  },

}

export default CachedImage
