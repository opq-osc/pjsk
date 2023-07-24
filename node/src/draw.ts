import { fabric } from 'fabric'
import { basename, dirname, isAbsolute, join } from 'path'
import imageSize from 'image-size'
import {
  createWriteStream,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'fs'
import {
  configs,
  characterSpecifiedConfig,
  EPreset,
  IConfig,
  IConfigSpecified,
  presets,
  params,
} from './info'
import deepmerge from 'deepmerge'
import { pjskAssetsRoot, getValue } from './shared'

enum EFormat {
  jpg = 'jpg',
  png = 'png',
}

interface IOpts {
  /**
   * draw text
   */
  text: string
  /**
   * character name
   * @example ena
   * @example ena1
   */
  character: string
  /**
   * output path
   * @example path.join(__dirname, './ena1.png')
   */
  output: string
}

interface IFile {
  name: string // e.g. ena1
  path: string
}

const loadAllFiles = () => {
  const files: IFile[] = []
  const dirs = readdirSync(pjskAssetsRoot).filter((file) => {
    const absPath = join(pjskAssetsRoot, file)
    if (statSync(absPath).isDirectory() && file !== '.DS_Store') {
      return true
    }
  })
  dirs.forEach((dir) => {
    const absPath = join(pjskAssetsRoot, dir)
    const filesInDir = readdirSync(absPath).filter((file) => {
      const smallCaseFile = file.toLowerCase()
      const isImageFile =
        smallCaseFile.endsWith('.png') || smallCaseFile.endsWith('.jpg')
      if (isImageFile) {
        return true
      }
    })
    // extract name from {name}_{number}.ext
    const nomalizedNames = filesInDir.map((file) => {
      // remove ext
      const nameWithoutExt = file.split('.')[0]
      const nameAndNumber = nameWithoutExt.split('_')
      const name = nameAndNumber[0]
      const trimmedName = name.trim()
      const num = parseInt(nameAndNumber[1], 10)
      return {
        path: join(absPath, file),
        name: `${trimmedName}${num}`,
      }
    })
    // add to files
    nomalizedNames.forEach((name) => {
      files.push(name)
    })
  })
  return { files, dirs }
}
const { files: allFiles, dirs: allDirs } = loadAllFiles()

// font
const fontNameForFallback = 'pjsk'
const fontNameForMain = 'yyy'
const fontFamily = `${fontNameForMain},${fontNameForFallback}`
const registerFonts = () => {
  const fontPathForFallback = join(pjskAssetsRoot, '../fonts/font.ttf')
  const fontPathForMainSource = join(pjskAssetsRoot, '../fonts/y.base64')
  const fontPathForMain = fontPathForMainSource.replace('.base64', '.otf')
  function initFont() {
    if (existsSync(fontPathForMain)) {
      return
    }
    const base64 = readFileSync(fontPathForMainSource, 'utf-8')
    writeFileSync(fontPathForMain, base64, 'base64')
  }
  initFont()
  // @ts-ignore
  fabric.nodeCanvas.registerFont(fontPathForFallback, {
    family: fontNameForFallback,
  })
  // @ts-ignore
  fabric.nodeCanvas.registerFont(fontPathForMain, {
    family: fontNameForMain,
  })
}

export const draw = async (opts: IOpts): Promise<void> => {
  const { text: _drawText, character, output } = opts
  let drawText = _drawText

  if (!drawText?.length) {
    throw new Error('text is required')
  }

  let format: EFormat
  // detect format
  if (output.endsWith('.png')) {
    format = EFormat.png
  } else if (output.endsWith('.jpg')) {
    format = EFormat.jpg
  } else {
    throw new Error('output must be end with .png or .jpg')
  }
  const isPng = format === EFormat.png
  const outputPath = output
  // must be absolute path
  if (!isAbsolute(output)) {
    throw new Error('output must be absolute path')
  } else {
    if (isPng && !outputPath.endsWith('.png')) {
      throw new Error('output must be end with .png')
    }
    if (!isPng && !outputPath.endsWith('.jpg')) {
      throw new Error('output must be end with .jpg')
    }
  }

  // NOTE: we can not try file, will be injected in runtime
  const trimmedCharacter = character?.trim()?.toLowerCase()?.replace('_', '')
  if (!trimmedCharacter?.length) {
    throw new Error('character is required')
  }
  // allow use `ena` instead of `ena1`
  const isDirCharacter = allDirs.find((dir) => {
    return dir.toLowerCase() === trimmedCharacter
  })
  if (isDirCharacter) {
    return draw({
      ...opts,
      character: `${isDirCharacter}1`,
    })
  }
  const matched = allFiles.find((file) => {
    return file.name.toLowerCase() === trimmedCharacter
  })
  if (!matched) {
    throw new Error(`character ${trimmedCharacter} not found`)
  }

  const fromPath = matched.path
  if (!existsSync(fromPath)) {
    throw new Error(`file ${fromPath} not found`)
  }
  const size = imageSize(fromPath)

  // get character config
  const matchedFileDir = dirname(fromPath)
  const matchedFileDirName = basename(matchedFileDir)
  const configSubPath = `${matchedFileDirName}/${basename(fromPath)}`
  let config: IConfigSpecified | undefined
  // check character specified config
  const specifiedConfig = getValue<IConfigSpecified>(
    characterSpecifiedConfig,
    configSubPath
  )
  if (specifiedConfig) {
    config = specifiedConfig
  } else {
    // use default config
    const characterDefaultConfig = getValue<IConfig>(
      configs,
      matchedFileDirName
    )
    if (!characterDefaultConfig) {
      throw new Error(`character ${matchedFileDirName} not found in configs`)
    }
    const hasPreset = characterDefaultConfig.preset
    if (hasPreset) {
      const presetValue = presets?.[hasPreset]
      const { preset: _, ...rest } = characterDefaultConfig
      config = {
        ...rest,
        pos: presetValue,
      }
    } else {
      const hasPos = characterDefaultConfig.pos
      if (hasPos) {
        config = characterDefaultConfig as IConfigSpecified
      } else {
        const defaultPos = presets[EPreset.normal]
        config = {
          ...characterDefaultConfig,
          pos: defaultPos,
        }
      }
    }
  }

  // merge params
  let finalParams = params
  if (config.params) {
    finalParams = deepmerge(params, config.params)
  }

  const {
    scale,
    fixedWidth,
    shouldTrimWhiteBorderWidth,
    strokeWidth,
    textMaxLength,
    fontConfig,
    edgeDetect,
  } = finalParams
  const canvasWidth = fixedWidth * scale
  const canvasHeight = (size.height! - shouldTrimWhiteBorderWidth) * scale

  // register font
  registerFonts()

  const canvas = new fabric.Canvas(null, {
    width: canvasWidth,
    height: canvasHeight,
    ...(isPng ? {} : { backgroundColor: '#fff' }),
  })
  // add background image
  const fromPathWithProtocol = `file://${fromPath}`
  const addBackground = () => {
    return new Promise((resolve) => {
      canvas.setBackgroundImage(
        fromPathWithProtocol,
        () => {
          resolve(null)
        },
        {
          // center
          top: canvasHeight / 2,
          left: canvasWidth / 2,
          originX: 'center',
          originY: 'center',
          // scale
          scaleX: scale,
          scaleY: scale,
        }
      )
    })
  }
  await addBackground()

  const { color, pos } = config
  const startFontSize = pos.s || fontConfig.defalutSize
  let fontSize = startFontSize
  const xWeight = pos.x
  const yWeight = pos.y
  let widthWeight = pos.w
  let top = canvasHeight * yWeight
  let left = canvasWidth * xWeight
  const createText = () => {
    return new fabric.Textbox(drawText, {
      left,
      top,
      originX: 'center',
      originY: 'center',
      width: canvasWidth * widthWeight,
      // stroke
      stroke: '#fff',
      strokeWidth: strokeWidth * scale,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      // font
      fontFamily,
      splitByGrapheme: true,
      textAlign: 'center',
      fill: color,
      fontSize: fontSize * scale,
      lineHeight: fontConfig.lineHeight,
      fontWeight: 800,
      // lock
      lockRotation: true,
      lockScalingY: true,
      lockScalingFlip: true,
      // rotate
      angle: pos.r,
      paintFirst: 'stroke',
    })
  }

  let text = createText()

  // improve 1: multi lines support
  const maxTextLength = textMaxLength
  while (text.__lineHeights?.length > 2) {
    // reduce font size
    fontSize -= fontConfig.reduceUnit
    if (fontSize < fontConfig.minSize) {
      // splice text
      const canSlice = drawText.length > maxTextLength
      if (!canSlice) {
        throw new Error('text is too long')
      } else {
        drawText = drawText.slice(0, maxTextLength)
        // reset font size
        fontSize = startFontSize
      }
    }
    // recreate text
    text = createText()
  }

  // improve 2: if the 2 line has little text, auto move to 1 line
  const needMoveImprove = () => {
    const has2Line = text.__lineHeights?.length === 2
    if (!has2Line) {
      return false
    }
    const line2Text = text._textLines?.[1]
    if (!line2Text?.length) {
      return false
    }
    const needImprove = edgeDetect.twoLineAutoMoveLength >= line2Text.length
    return needImprove
  }
  if (needMoveImprove()) {
    const originFontSize = fontSize
    const originWidthWeight = widthWeight
    const reset = () => {
      fontSize = originFontSize
      widthWeight = originWidthWeight
    }
    // first try reduce font size 1 time
    fontSize -= fontConfig.reduceUnit
    const newText = createText()
    if (newText.__lineHeights?.length === 1) {
      // that's ok !
      text = newText
    } else {
      // second try expand width
      const expandedWidthWeight = widthWeight * 1.1
      if (expandedWidthWeight >= 1) {
        // not good
        // give up
        reset()
      } else {
        widthWeight = expandedWidthWeight
        const newText = createText()
        if (newText.__lineHeights?.length === 1) {
          // that's ok !
          text = newText
        } else {
          // give up
          reset()
          // TODO: more improve
        }
      }
    }
  }

  // improve 3: edge detect
  const getTopPoints = () => {
    const matrix = text.calcTransformMatrix()
    const leftTopPoint = fabric.util.transformPoint(
      new fabric.Point(-text.width! / 2, -text.height! / 2),
      matrix
    )
    const rightTopPoint = fabric.util.transformPoint(
      new fabric.Point(text.width! / 2, -text.height! / 2),
      matrix
    )
    return { leftTopPoint, rightTopPoint }
  }
  const edgeDetectImprove = () => {
    if (text.width && text.height) {
      const { offLength } = edgeDetect
      let isTriedMoveRight = false
      // if text top point has negative value, try move down
      const tryMoveDown = () => {
        const { leftTopPoint, rightTopPoint } = getTopPoints()
        const hasNegative =
          leftTopPoint.y < offLength || rightTopPoint.y < offLength
        if (hasNegative) {
          // move down
          top += Math.abs(Math.min(leftTopPoint.y, rightTopPoint.y) - offLength)
          text = createText()
        }
      }
      // if left very edge, try move right
      const tryMoveRight = () => {
        const { leftTopPoint } = getTopPoints()
        const hasVeryEdge = leftTopPoint.x < edgeDetect.veryEdgeLimit
        if (hasVeryEdge) {
          // move right
          left += edgeDetect.tryMoveDistance
          isTriedMoveRight = true
          text = createText()
        }
      }
      // if right very edge, try move left
      const tryMoveLeft = () => {
        const { rightTopPoint } = getTopPoints()
        const hasVeryEdge =
          rightTopPoint.x > canvasWidth - edgeDetect.veryEdgeLimit
        if (hasVeryEdge) {
          // move left
          if (isTriedMoveRight) {
            // half distance
            left -= edgeDetect.tryMoveDistance / 2
          } else {
            left -= edgeDetect.tryMoveDistance
          }
          text = createText()
        }
      }
      tryMoveRight()
      tryMoveLeft()
      tryMoveDown()
    }
  }
  edgeDetectImprove()

  canvas.add(text)
  canvas.renderAll()

  // scale revert
  // const scaleRevert = 1 / scale
  // canvas.setZoom(scaleRevert)
  // canvas.setHeight(canvasHeight * scaleRevert)
  // canvas.setWidth(canvasWidth * scaleRevert)
  // canvas.renderAll()

  // write
  let resolve: () => void
  let reject: (v: unknown) => void
  const promise = new Promise<void>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })
  const writeStream = createWriteStream(outputPath)
  if (isPng) {
    // @ts-ignore
    canvas.createPNGStream().pipe(writeStream)
  } else {
    // @ts-ignore
    canvas.createJPEGStream().pipe(writeStream)
  }
  writeStream.on('finish', () => {
    console.log(`PJSK: draw write to ${outputPath}`)
    // check file exists
    if (!existsSync(outputPath)) {
      reject(new Error(`PJSK: draw write error ${outputPath} not exists`))
      return
    }
    resolve()
  })
  // error
  writeStream.on('error', (err) => {
    console.error(`PJSK: draw write error ${err}`)
    reject(err)
  })

  return promise
}
