import path from 'path'
import { renderHelp } from '../src/help'

const run = async () => {
  const output = path.join(__dirname, '../fixtures/help.png')
  await renderHelp(output)
}

run()
