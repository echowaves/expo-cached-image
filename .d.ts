declare module 'expo-cached-image' {
    import { ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';
    
    interface CachedImagesProps {
        source?: ImageSourcePropType;
        style: StyleProp<ImageStyle>;
        cacheKey: string;
        resizeMode: string;
    }
    
    class CachedImages extends React.Component<CachedImagesProps> {}
    export default CachedImages;
    }
    