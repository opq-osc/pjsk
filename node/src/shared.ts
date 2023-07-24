import { dirname, join } from "path"

export const pjskAssetsRoot = process.env.PJSK_ASSETS_IMAGES_DIR || join(
  dirname(require.resolve('pjsk-assets/package.json')),
  './src/images'
)

export function getValue<K, T extends Record<string, K> = any>(
  obj: T,
  key: string
) {
  const keys = Object.keys(obj)
  const matchedKey = keys.find((k) => {
    return k.toLowerCase() === key.toLowerCase()
  })
  if (!matchedKey) {
    return
  }
  return obj[matchedKey]
}
