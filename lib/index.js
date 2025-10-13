import { Directory, File } from 'expo-file-system';
import React, { useEffect, useRef, useState } from 'react';
import { Image } from 'react-native';
import * as CONST from './consts';
const CachedImage = (props) => {
    const { source, cacheKey, placeholderContent, ...rest } = props;
    const { uri, headers, expiresIn } = source;
    const sanitizedKey = CONST.sanitizeCacheKey(cacheKey);
    const file = new File(CONST.IMAGE_CACHE_FOLDER, `${sanitizedKey}.png`);
    const fileURI = file.uri;
    const [imgUri, setImgUri] = useState(fileURI);
    const componentIsMounted = useRef(false);
    const requestOption = (headers != null) ? { headers } : undefined;
    useEffect(() => {
        componentIsMounted.current = true;
        void loadImageAsync();
        return () => {
            componentIsMounted.current = false;
        };
    }, []);
    const calculateFileAge = (modificationTime) => {
        return (Date.now() - modificationTime) / 1000;
    };
    const hasExpiryConfig = () => {
        return expiresIn != null && expiresIn > 0;
    };
    const isFileExpired = (metadata) => {
        var _a;
        if (!metadata.exists || !hasExpiryConfig()) {
            return false;
        }
        const fileAge = calculateFileAge((_a = metadata.modificationTime) !== null && _a !== void 0 ? _a : 0);
        return fileAge > (expiresIn !== null && expiresIn !== void 0 ? expiresIn : 0);
    };
    const isFileInvalid = (metadata) => {
        var _a;
        return !metadata.exists || ((_a = metadata.size) !== null && _a !== void 0 ? _a : 0) === 0;
    };
    const shouldRedownload = (metadata, expired) => {
        return isFileInvalid(metadata) || expired;
    };
    const downloadAndMoveFile = async () => {
        const downloaded = await File.downloadFileAsync(uri, new Directory(CONST.IMAGE_CACHE_FOLDER), requestOption);
        // Move/rename if the server selected a different filename
        if (downloaded.uri !== fileURI) {
            new File(downloaded.uri).move(file);
        }
    };
    const deleteExpiredFile = () => {
        file.delete();
    };
    const updateImageUri = (newUri) => {
        if (componentIsMounted.current) {
            setImgUri(newUri);
        }
    };
    const handleCachedImageLoad = async () => {
        await setImgUri(null);
        if (!componentIsMounted.current)
            return;
        await downloadAndMoveFile();
        updateImageUri(`${fileURI}`);
    };
    const handleExpiredImageLoad = async () => {
        await setImgUri(null);
        if (!componentIsMounted.current)
            return;
        deleteExpiredFile();
        await downloadAndMoveFile();
        updateImageUri(`${fileURI}`);
    };
    const handleImageLoadError = (err) => {
        console.error('Error loading image:', err);
        setImgUri(uri);
    };
    const loadImageAsync = async () => {
        try {
            const metadata = file.info();
            const expired = isFileExpired(metadata);
            if (!shouldRedownload(metadata, expired)) {
                return;
            }
            if (expired) {
                await handleExpiredImageLoad();
            }
            else {
                await handleCachedImageLoad();
            }
        }
        catch (err) {
            handleImageLoadError(err);
        }
    };
    if (imgUri !== null && imgUri !== '') {
        return (<Image {...rest} source={{
                ...source,
                uri: imgUri
            }}/>);
    }
    return <>{placeholderContent !== null && placeholderContent !== void 0 ? placeholderContent : null}</>;
};
export const CacheManager = {
    addToCache: async ({ file, key }) => {
        const sanitizedKey = CONST.sanitizeCacheKey(key);
        new File(file).copy(new File(CONST.IMAGE_CACHE_FOLDER, `${sanitizedKey}.png`));
        return await CacheManager.getCachedUri({ key });
    },
    getCachedUri: async ({ key }) => {
        const sanitizedKey = CONST.sanitizeCacheKey(key);
        return new File(CONST.IMAGE_CACHE_FOLDER, `${sanitizedKey}.png`).uri;
    },
    downloadAsync: async ({ uri, key, options }) => {
        const sanitizedKey = CONST.sanitizeCacheKey(key);
        const result = await File.downloadFileAsync(uri, new Directory(CONST.IMAGE_CACHE_FOLDER), options);
        const target = new File(CONST.IMAGE_CACHE_FOLDER, `${sanitizedKey}.png`);
        if (result.uri !== target.uri) {
            new File(result.uri).move(target);
        }
        return result;
    },
    getMetadata: async ({ key }) => {
        var _a, _b;
        const sanitizedKey = CONST.sanitizeCacheKey(key);
        const fileRef = new File(CONST.IMAGE_CACHE_FOLDER, `${sanitizedKey}.png`);
        const fileURI = fileRef.uri;
        try {
            const metadata = fileRef.info();
            if (!metadata.exists) {
                return null;
            }
            return {
                exists: metadata.exists,
                size: (_a = metadata.size) !== null && _a !== void 0 ? _a : 0,
                modificationTime: new Date((_b = metadata.modificationTime) !== null && _b !== void 0 ? _b : 0),
                uri: fileURI,
                isDirectory: false
            };
        }
        catch (err) {
            console.error('Error getting cache metadata:', err);
            return null;
        }
    }
};
export default CachedImage;
//# sourceMappingURL=index.js.map