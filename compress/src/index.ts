import 'zx/globals'
// @ts-ignore
import ttf2woff2 from 'ttf2woff2'

const run = async () => {
  // ttf to woff2
  const fontPath = path.join(__dirname, '../../assets/src/fonts/font.ttf')
  const targetPath = path.join(__dirname, '../../assets/src/fonts/font.woff2')

  const input = fs.readFileSync(fontPath)
  fs.writeFileSync(targetPath, ttf2woff2(input))

  console.log('compress success')
}

run()
