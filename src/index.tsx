import * as FileSystem from "expo-file-system"
import { DownloadOptions } from "expo-file-system/src/FileSystem.types"
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
  const fileURI = `${CONST.IMAGE_CACHE_FOLDER}${cacheKey}.png`

  const [imgUri, setImgUri] = useState<string | null>(fileURI)

  const componentIsMounted = useRef(false)
  const requestOption = headers ? { headers } : undefined

  // const _callback = async () => {
  //   if (!componentIsMounted.current) {
  //     try {
  //      await downloadResumableRef.current.pauseAsync()
  //     } catch (werkjsndflv1) {
  //       console.error({werkjsndflv1})
  //     }      
  //     try {
  //       await FileSystem.deleteAsync(fileURI, { idempotent: true }) // delete file locally if it was not downloaded properly
  //      } catch (werkjsndflv2) {
  //        console.error({werkjsndflv2})
  //      }      
 
  //   }
  // }

  // const downloadResumableRef = useRef(
  //   FileSystem.createDownloadResumable(uri, fileURI, requestOption, _callback),
  // )

  useEffect(() => {
    componentIsMounted.current = true;
    void loadImageAsync()
    return () => {
      componentIsMounted.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadImageAsync = async () => {
    try {
      // Use the cached image if it exists
      const metadata = await FileSystem.getInfoAsync(fileURI);
      const expired =
        Boolean(
          metadata?.exists &&
            expiresIn &&
            new Date().getTime() / 1000 - metadata.modificationTime > expiresIn
        );

      if (!metadata?.exists || metadata?.size === 0 || expired) {
        await setImgUri(null)
        if (componentIsMounted.current) {          
          if (expired) {
            await FileSystem.deleteAsync(fileURI, { idempotent: true });
          }

          // download to cache
          const response = await FileSystem.downloadAsync(uri, fileURI, requestOption)
          if (componentIsMounted.current && response?.status === 200) {
            setImgUri(`${fileURI}`); 
          }
          if (response?.status !== 200) {
            FileSystem.deleteAsync(fileURI, { idempotent: true }); // delete file locally if it was not downloaded properly
          }
        }
      } 
    } catch (err) {
      console.error("Error loading image:", err);
      setImgUri(uri);
    }
  };

  if (!imgUri) return placeholderContent || null;
// console.log({imgUri})
  return (
    <Image
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
      source={{
        ...source,
        uri: imgUri,
      }}
    />
  );
};

export const CacheManager = {
  addToCache: async ({ file, key }: { file: string; key: string }) => {
    await FileSystem.copyAsync({
      from: file,
      to: `${CONST.IMAGE_CACHE_FOLDER}${key}.png`,
    });
    return await CacheManager.getCachedUri({ key });
  },

  getCachedUri: async ({ key }: { key: string }) => {
    return await FileSystem.getContentUriAsync(
      `${CONST.IMAGE_CACHE_FOLDER}${key}.png`
    );
  },

  downloadAsync: async ({
    uri,
    key,
    options,
  }: {
    uri: string;
    key: string;
    options: DownloadOptions;
  }) => {
    return await FileSystem.downloadAsync(
      uri,
      `${CONST.IMAGE_CACHE_FOLDER}${key}.png`,
      options
    );
  },
};

export default CachedImage;
