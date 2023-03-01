declare module "expo-cached-image" {
  import { ImageProps } from "react-native"

  type CachedImageProps = ImageProps & {
    source?: object
    cacheKey?: string
    placeholderContent?: string
  }

  export default function (props: CachedImageProps): JSX.Element
}
