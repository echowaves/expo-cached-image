declare module "expo-cached-image" {
  import {
    ImageProps,
    ImageSourcePropType,
    ImageStyle,
    StyleProp,
  } from "react-native"

  type CachedImagesProps = ImageProps & {
    source?: ImageSourcePropType
    style: StyleProp<ImageStyle>
    cacheKey: string
    resizeMode: string
  }

  class CachedImages extends React.Component<CachedImagesProps> {}
  export default CachedImages
}
