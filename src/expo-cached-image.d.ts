declare module "expo-cached-image" {
  import {
    ImageProps,
    ImageSourcePropType,
    ImageStyle,
    StyleProp,
  } from "react-native"

  export iterface CachedImagesProps {
    source?: ImageSourcePropType;
    style: StyleProp<ImageStyle>;
    cacheKey: string;
    resizeMode: string;
  }

  export class CachedImages extends React.Component<
        CachedImagesProps,
        any
    > {}

}
