# expo-cached-image

Super fast and secure cached image component for React Native applications built with Expo.

[![npm version](https://badge.fury.io/js/expo-cached-image.svg)](https://badge.fury.io/js/expo-cached-image)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 Fast image loading with local caching
- 🔒 Secure file handling and sanitized cache keys
- ⏱️ Configurable cache expiration
- 🔄 Automatic cache cleanup
- 📱 Full TypeScript support
- 🎨 Customizable placeholder content

## Installation

```bash
# Using npm
npm install expo-cached-image

# Using yarn
yarn add expo-cached-image

# Using expo
npx expo install expo-cached-image
```

## Basic Usage

```typescript
import CachedImage from 'expo-cached-image'
import { ActivityIndicator } from 'react-native'

const MyComponent = () => {
  return (
    <CachedImage
      source={{ 
        uri: 'https://example.com/image.jpg',
        headers: { 'Authorization': 'Bearer your-token' }, // Optional
        expiresIn: 86400, // Optional: Cache expiration in seconds (24 hours)
      }}
      cacheKey="unique-image-key" // Required: Unique identifier for the image
      placeholderContent={( // Optional: Component to show while loading
        <ActivityIndicator 
          color="#999999"
          size="small"
          style={{ flex: 1, justifyContent: "center" }}
        />
      )}
      style={{ width: 200, height: 200 }}
      resizeMode="contain"
    />
  )
}
```

## API Reference

### CachedImage Component

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| source | ImageSource | Yes | Image source object containing uri, optional headers and expiration |
| cacheKey | string | Yes | Unique identifier for caching the image |
| placeholderContent | ReactNode | No | Component to display while image is loading |
| ...ImageProps | ImageProps | No | All props from React Native's Image component |

#### ImageSource Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| uri | string | Yes | URL of the image to load and cache |
| headers | object | No | Request headers for image download |
| expiresIn | number | No | Cache expiration time in seconds |

### CacheManager API

```typescript
import { CacheManager } from 'expo-cached-image'
```

#### Methods

##### addToCache
```typescript
const uri = await CacheManager.addToCache({
  file: '/path/to/local/file',
  key: 'unique-key'
})
```

##### getCachedUri
```typescript
const uri = await CacheManager.getCachedUri({
  key: 'unique-key'
})
```

##### downloadAsync
```typescript
const result = await CacheManager.downloadAsync({
  uri: 'https://example.com/image.jpg',
  key: 'unique-key',
  options: {
    headers: {
      'Authorization': 'Bearer token'
    }
  }
})
```

##### getMetadata
```typescript
const metadata = await CacheManager.getMetadata({
  key: 'unique-key'
})

if (metadata) {
  console.log('File exists:', metadata.exists)
  console.log('File size:', metadata.size, 'bytes')
  console.log('Last modified:', metadata.modificationTime)
  console.log('File path:', metadata.uri)
} else {
  console.log('File not found or error occurred')
}
```

Returns metadata for a cached item, including file existence, size, modification time, and file path. Returns `null` if the file doesn't exist or an error occurs.

## Security Considerations

1. Always use HTTPS URLs for image sources
2. Cache keys are automatically sanitized to prevent path traversal and other filesystem-related vulnerabilities
   - Only alphanumeric characters, dashes, and underscores are allowed
   - Keys are limited to 100 characters
   - Leading dashes and periods are replaced with underscores
3. Implement proper token/credentials management for authenticated requests
4. Be mindful of storage space when caching large images
5. Consider implementing cache size limits in your application

## Best Practices

1. Use meaningful and unique cache keys
   - Keys will be automatically sanitized, but it's best to use simple alphanumeric identifiers
   - Example: "user-123-profile-image" or "product_456_thumbnail"
2. Implement placeholder content for better UX
3. Set appropriate cache expiration times
4. Handle errors gracefully
5. Clean up unused cached images periodically

## Example with Error Handling

```typescript
const SecureImageComponent = () => {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
    // Implement your error handling logic
  };

  return (
    <CachedImage
      source={{
        uri: 'https://secure-site.com/image.jpg',
        headers: {
          'Authorization': 'Bearer token',
          'Accept': 'image/*'
        },
        expiresIn: 3600 // 1 hour
      }}
      cacheKey="secure-image-1"
      onError={handleError}
      placeholderContent={
        error ? (
          <ErrorPlaceholder />
        ) : (
          <LoadingPlaceholder />
        )
      }
    />
  );
};
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Projects Using expo-cached-image

- [github](https://github.com/echowaves/WiSaw) - Photo sharing react-native source code.
- [WiSaw on the web](https://wisaw.com/) - here is how it looks on the web.
- [install iOS app](http://itunes.apple.com/us/app/wisaw/id1299949122) 
- [install Android app](http://play.google.com/store/apps/details?id=com.echowaves.wisaw)

## Support

If you're having any problem, please [raise an issue](https://github.com/echowaves/expo-cached-image/issues/new) on GitHub.
