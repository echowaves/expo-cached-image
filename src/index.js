import React, {
  useEffect, useState, useRef,
} from 'react'

import {Image} from 'react-native-elements'

import * as FileSystem from 'expo-file-system'

import PropTypes from 'prop-types'

import * as CONST from './consts.js'

const CachedImage = props => {
  const {source: {uri}, cacheKey} = props

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
          }
        }
        if (componentIsMounted.current) {
          await setImgUri(fileURI) // deep clone to force re-render
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

export default (CachedImage)
