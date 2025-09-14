import { Paths } from "expo-file-system"
// Directory URI for the cache folder using the new API
export var IMAGE_CACHE_FOLDER = "".concat(Paths.cache.uri);
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
