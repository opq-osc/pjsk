import { existsSync, mkdirSync } from 'fs'
import { IMahiroUse } from 'mahiro'
import { join } from 'path'
import { draw } from 'pjsk-node/draw'
import { renderHelp } from 'pjsk-node/help'

const HELP_KEYWORDS = ['help', '帮助', 'list', '列表'] as const

export const PJSK = () => {
  const use: IMahiroUse = async (mahiro) => {
    const logger = mahiro.logger.withTag('pjsk') as typeof mahiro.logger
    logger.info('loading pjsk plugin...')

    const _ = mahiro.utils.lodash

    mahiro.onGroupMessage('pjsk', async (useful) => {
      const msg = useful?.msg?.Content

      if (!msg?.length) {
        return
      }
      const trimmed = _.trim(msg) as string
      if (!trimmed?.length) {
        return
      }

      if (trimmed.startsWith('pjsk ')) {
        const msgWithoutPrefix = trimmed.slice('pjsk '.length)
        const trimmedMsg = _.trim(msgWithoutPrefix) as string
        if (!trimmedMsg?.length) {
          return
        }

        const cacheDir = join(__dirname, 'cache')
        if (!existsSync(cacheDir)) {
          logger.info(`pjsk: create cache dir: ${cacheDir}`)
          mkdirSync(cacheDir)
        }

        // help command
        const isMatchHelpCmd = HELP_KEYWORDS.some(i => {
          return trimmedMsg.toLowerCase() === i
        })
        if (isMatchHelpCmd) {
          try {
            const helpOutput = join(cacheDir, `help.png`)
            logger.info(`pjsk: start render help...`)
            await renderHelp(helpOutput)
            logger.info(`pjsk: render help done, output: ${helpOutput}`)

            if (!existsSync(helpOutput)) {
              logger.error(
                `pjsk: render help not cause error, but not found output (${helpOutput})`
              )
              return
            }

            // send image
            await mahiro.sendGroupMessage({
              groupId: useful.groupId,
              fastImage: helpOutput,
            })
          } catch (e) {
            logger.error(`pjsk: render help error: ${e}`)
          }
          return
        }

        // render command
        const firstSpaceIndex = trimmedMsg.indexOf(' ')
        const cmd = trimmedMsg.slice(0, firstSpaceIndex)
        const text = trimmedMsg.slice(firstSpaceIndex + 1)
        const trimmedCmd = _.trim(cmd) as string
        const trimmedText = _.trim(text).replace(/\r/, '\n') as string

        if (!trimmedCmd?.length || !trimmedText?.length) {
          return
        }

        logger.info(
          `pjsk: cmd: ${trimmedCmd}, text: ${trimmedText.slice(0, 10)}...`
        )
        logger.info(`pjsk: start render...`)
        try {
          const { userId, groupId } = useful
          const output = join(cacheDir, `${userId}.jpg`)
          await draw({
            text: trimmedText,
            output,
            character: trimmedCmd,
          })
          logger.info(`pjsk: render done, output: ${output}`)
          if (existsSync(output)) {
            // send
            logger.info(
              `pjsk: send image to group(${groupId}), user(${userId})`
            )
            await mahiro.sendGroupMessage({
              groupId,
              fastImage: output,
            })

            // delete in 10s later
            setTimeout(() => {
              if (existsSync(output)) {
                logger.info(`pjsk: delete image cache, user(${userId})`)
                mahiro.utils.fsExtra.removeSync(output)
              }
            }, 10 * 1000)
          } else {
            logger.error(
              `pjsk: render not cause error, but not found output (${output})`
            )
          }
        } catch (e) {
          logger.error(`pjsk: render error: ${e}`)
        }
      }
    })
  }
  return use
}
