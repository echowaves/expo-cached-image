# expo-cached-image
Super fast cached image component for react-native applications powered by expo

## Usage

### CachedImage
To use `<CachedImage/>` tag, first import it:
```JavaScript
import CachedImage from 'expo-cached-image'
```

And it can used like this:
```JavaScript
<CachedImage
          source={{ uri: `${item.getThumbUrl}` }}
          cacheKey={`${item.id}-thumb`}
          containerStyle={styles.thumbnail}
        />
```        

`<CachedImage/>` internally uses the `<Image/>` component from *'react-native-elements'*, so any properties that apply to the `<Image/>` can be passed into the `<CachedImage/>`. 

The only property that is `<CachedImage/>` specifc is *cacheKey*. The same *cacheKey* value should be passed always for the same *source* value. This is a little bit of an extra work from application development point of view, but this is how `<CachedImage/>` achieves it's performance. If no *cacheKey* would be passed, the component would have to use some Crypto hash, which would add some computational overhead. If you are showing a lot of images in a list on one screen -- this component is the most efficient way.

### CacheManager 

To use `CacheManager`, import it first:
```JavaScript
import { CacheManager } from 'expo-cached-image'
```

On a start up of your applicastion you'd want to cleanup the files from existing cache:

```JavaScript
  useEffect(() => {
     CacheManager.cleanupCache({ size: 500 })
  }, [])// eslint-disable-line react-hooks/exhaustive-deps
```
The *size* is specified in Mb. If the *size* is not specified, the defule value is *400*. Be careful with the *size* parameter -- if it's too big, your device may run out of memory and may crash.

If you have a file on local file system which you want to add to cache:
```JavaScript
    photo.getImgUrl = await CacheManager.addToCache({
      file: `${CONST.PENDING_UPLOADS_FOLDER}${item}`,
      key: `${photo.id}`,
    })
```

If you want to know the *uri* of the cached file by key:
```JavaScript
      const uri = await CacheManager.getCachedUri({ key: `${item.id}` })
```


