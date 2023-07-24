import { join } from 'path'
import { draw } from '../src/draw'
import 'zx/globals'

// for tests
const testOpts = {
  // maxCase: `什么时候禁止男的发这种表情包`,
  // normalCase: `虾头男\n小红书见`,
  // minCase: `已黑化`,
  // fourCase: `全部超飞`,
  // suo: `让我索一口嘛`,
  // tou: `让我透透\n拜托了！`,
  // cao: `不知道，想艾草`,
  // dog: '要当我的小狗吗',
  // bz: '饮完左之后\n滨州好似大树甘分叉生枝'
} as const

const fixtures = join(__dirname, '../fixtures')
const force = true

const runUnit = async ({ name, text }: { name: string, text?: string }) => {
  const dir = join(fixtures, name)
  if (force && fs.existsSync(dir)) {
    // remove
    fs.removeSync(dir)
  }
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  // case
  const tasks: Promise<any>[] = []
  const testCase = [text] || testOpts
  Object.keys(testCase).forEach((key) => {
    const text = testCase[key]
    const out = join(dir, `${key}.jpg`)
    tasks.push(
      draw({
        output: out,
        text,
        character: name,
      })
    )
  })
  await Promise.all(tasks)
}

const run = async () => {
  // await runUnit({ name: 'ena', text: testOpts.normalCase })
  // await runUnit({ name: 'mizuki14' })
  // await runUnit({ name: 'mizuki13' })
  // await runUnit({ name: 'mizuki16' })
  // await runUnit({ name: 'Airi11' })
  // await runUnit({ name: 'mizuki11' })
  // await runUnit({ name: 'luka' })
  // await runUnit({ name: 'Kanade14' })
  // await runUnit({ name: 'Kanade14' })
  // await runUnit({ name: 'Nene_14' })
  // await runUnit({ name: 'Honami_16' })
  // await runUnit({ name: 'Emu_13' })
  // await runUnit({ name: 'Mafuyu_14', text: '男娘加我\n我鼓包了' })
  // await runUnit({ name: 'Mafuyu8', text: '不给我草\n你真没品！' })
  // await runUnit({ name: 'Mizuki_17', text: '几把好小...' })
  // await runUnit({ name: 'Mizuki', text: '我心脏弱\n死给你看' })
  // await runUnit({ name: 'Nene_11', text: '一群郭楠\n避雷了' })
  // await runUnit({ name: 'Emu_7', text: '没人撅我\n   好无聊...' })
  await runUnit({ name: 'ena', text: '虾头男收收味' })
  // await runUnit({ name: 'Kohane_11', text: '可以草你吗' })
}

run()
