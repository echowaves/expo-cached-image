declare module "expo-cached-image" {
  import { ImageProps, ImageSourcePropType } from "react-native"

  type CachedImageProps = ImageProps & {
    source?: ImageSourcePropType
    cacheKey?: string
    resizeMode: string
  }

  export default function (props: CachedImageProps): JSX.Element
}
