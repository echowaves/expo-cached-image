import React from 'react';
import { ImageProps, ImageURISource } from 'react-native';
type CachedImageProps = Omit<ImageProps, 'source'> & {
    cacheKey: string;
    source: Omit<ImageURISource, 'uri'> & {
        uri: string;
        expiresIn?: number;
    };
    placeholderContent?: React.ReactNode;
};
declare const CachedImage: React.FC<CachedImageProps>;
export declare const CacheManager: {
    addToCache: ({ file, key }: {
        file: string;
        key: string;
    }) => Promise<string>;
    getCachedUri: ({ key }: {
        key: string;
    }) => Promise<string>;
    downloadAsync: ({ uri, key, options }: {
        uri: string;
        key: string;
        options: {
            headers?: Record<string, string>;
        };
    }) => Promise<import("expo-file-system/build/ExpoFileSystem.types").File>;
    getMetadata: ({ key }: {
        key: string;
    }) => Promise<{
        exists: true;
        size: number;
        modificationTime: Date;
        uri: string;
        isDirectory: boolean;
    } | null>;
};
export default CachedImage;
//# sourceMappingURL=index.d.ts.map