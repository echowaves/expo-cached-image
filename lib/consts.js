import * as FileSystem from "expo-file-system/legacy";
export var IMAGE_CACHE_FOLDER = "".concat(FileSystem.cacheDirectory);
export var sanitizeCacheKey = function (key) {
    // Remove any potentially unsafe characters
    // Allow only alphanumeric characters, dashes, and underscores
    return key.replace(/[^a-zA-Z0-9-_]/g, '_')
        // Ensure the key doesn't start with a dash or period
        .replace(/^[-.]/, '_')
        // Limit the length to prevent extremely long filenames
        .slice(0, 100);
};
export default IMAGE_CACHE_FOLDER;
