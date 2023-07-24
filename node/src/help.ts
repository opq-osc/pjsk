import { IConfig, configs } from './info'
import { join } from 'path'
import { existsSync, readFileSync, statSync } from 'fs'
import { readdir } from 'fs/promises'
import { getValue, pjskAssetsRoot } from './shared'
import nodeHtmlToImage from 'node-html-to-image'
import dayjs from 'dayjs'

const template = /* html */ `
<!DOCTYPE html>
<html lang="zh-CN">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
  @font-face {
    font-family: 'pjsk';
    src: url(data:font/truetype;charset=utf-8;base64,{{fontData}}) format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  body {
    position: absolute;
    width: 1090px;
    height: 1040px;
  }
  
  body .root {
    color: #fff;
    background-color: #16a08490;
    width: 1080px;
    height: 1000px;
    padding: 20px;
    font-family: "pjsk";
  }
  
  body .root .title {
    font-size: 44px;
    width: 100%;
    text-align: center;
    padding: 7px;
  }
  
  body .root .tip,
  body .root .helper {
    color: #fefefe;
    font-size: 22px;
    padding: 10px;
  }
  
  body .root .list {
    margin: 20px 0;
    padding: 20px;
    /*background-color: rgb(125, 194, 255);*/
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 16px;
  }
  
  body .root .list .item {
    width: 100px;
    height: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    background-size: cover;
  }
  
  body .root .list .item img {
    width: 100px;
    height: 100px;
  }
  
  body .root .list .item span {
    font-size: 24px;
    text-shadow: -2px 0 white, 0 2px white, 2px 0 white, 0 -2px white;
  }
  body .root .list .item span:nth-child(2) {
    font-size: 30px;
  }
  
  body .root .preview {
    margin: 20px 0;
    padding: 20px;
    display: flex;
    gap: 16px;
  }
  
  body .root .preview .item {
    font-size: 24px;
    width: 180px;
    height: 180px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    white-space: pre-wrap;
  }
  
  body .root .preview .item img {
    width: 150px;
    height: 120px;
  }

  img {
    max-width: 100%;
  }
  </style>
</head>

<body>
  <div class="root">
    <div class="title">pjsk(啤酒烧烤)</div>
    <div class="tip">食用方法：发送 「pjsk 角色id 内容」生成表情</div>
    <div class="list-wrapper">
      <p class="helper">支持以下角色：</p>
      <div class="list">
      {{listData}}
      </div>
    </div>
    <div class="preview-wrapper">
      <p class="helper">示例：</p>
      <div class="preview">
      {{previewData}}
      </div>
    </div>
  </div>
</body>

</html>
`

async function render(html: string, outputPath: string) {
  const buffer = await nodeHtmlToImage({
    html: html,
    output: outputPath,
    puppeteerArgs: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // why we need this?
        '--font-render-hinting=none',
      ],
    },
  })

  return buffer
}

export async function renderHelp(outputPath: string) {
  // cache
  if (existsSync(outputPath)) {
    const stats = statSync(outputPath)
    const createTime = stats.mtime
    // 10 hours
    const isCacheValid = dayjs().diff(createTime, 'hour') < 10
    if (isCacheValid) {
      return
    }
  }
  const dirs = (await readdir(pjskAssetsRoot)).filter((i) => {
    if (i === '.DS_Store') {
      return false
    }
    const isDir = statSync(join(pjskAssetsRoot, i)).isDirectory()
    if (!isDir) {
      return false
    }
    return true
  })
  let html = template
  const fontPath = join(pjskAssetsRoot, '../fonts/font.ttf')
  const fontBase64 = readFileSync(fontPath, 'base64')
  html = html.replace('{{fontData}}', fontBase64)

  let listData = ''
  for (const dir of dirs) {
    const dirPath = join(pjskAssetsRoot, dir)
    const files = (await readdir(dirPath)).filter((i) => {
      if (i === '.DS_Store') {
        return false
      }
      const isFile = statSync(join(dirPath, i)).isFile()
      if (!isFile) {
        return false
      }
      const isImage = i.endsWith('.png') || i.endsWith('.jpg')
      if (!isImage) {
        return false
      }
      return true
    })
    const randomImagePath = join(
      dirPath,
      files[Math.floor(files.length * Math.random())]
    )
    const imageBase64 = readFileSync(randomImagePath, 'base64')
    const characterDefaultConfig = getValue<IConfig>(configs, dir)
    listData += /* html */ `
<span class="item" style="color: ${characterDefaultConfig!.color}">
  <img src="data:image/png;base64,${imageBase64}" />
  <span>${dir}</span>
  <span>1-${files.length}</span>
</span>
`
  }

  html = html.replace('{{listData}}', listData)

  let previewData = ''
  const previewList: string[] = [
    'pjsk ena 虾头男\n小红书见',
    'pjsk Nene_11 一群郭楠\n避雷了',
    'pjsk Mizuki 我心脏弱\n死给你看',
    'pjsk Honami16 要当我的小狗吗',
    'pjsk Mizuki14 什么时候禁止男的发这种表情包',
    'pjsk airi11 让我索一口嘛',
  ]
  previewList.forEach((item, index) => {
    const imageBase64 = readFileSync(
      join(__dirname, '..', '..', 'preview', index + '.jpg'),
      'base64'
    )
    previewData += /* html */ `
<span class="item">
  <img src="data:image/png;base64,${imageBase64}" />
  <pre>${item}</pre>
</span>`
  })
  html = html.replace('{{previewData}}', previewData)
  await render(html, outputPath)
}
