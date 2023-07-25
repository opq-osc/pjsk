import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'fs'
import { join } from 'path'
import 'zx/globals'
import { Transformer, losslessCompressPng } from '@napi-rs/image'
import size from 'image-size'

const run = async () => {
  const dir = `/Users/ryu/Downloads/waifu Output`

  const opt = async (source: string, target: string) => {
    const png = readFileSync(source)
    const imageSize = size(png)
    const neWidth = imageSize.width! / 2
    const newHeight = imageSize.height! / 2
    const newPng = await new Transformer(png).resize(neWidth, newHeight).png()
    const losslessPng = await losslessCompressPng(newPng)
    writeFileSync(target, losslessPng)
  }

  const files = readdirSync(dir)

  const outputDir = join(dir, 'dist')
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir)
  }

  for (const file of files) {
    if (file.endsWith('.png')) {
      console.log('file: ', file)
      await opt(join(dir, file), join(outputDir, file))
    }
  }
}

run()
