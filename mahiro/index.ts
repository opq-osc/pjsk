import { existsSync, mkdirSync } from 'fs'
import { IMahiroUse } from 'mahiro'
import { join } from 'path'
import { draw } from 'pjsk-node/draw'

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
        const trimmedMsg = _.trim(msgWithoutPrefix)
        if (!trimmedMsg?.length) {
          return
        }
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
          const cacheDir = join(__dirname, 'cache')
          if (!existsSync(cacheDir)) {
            mkdirSync(cacheDir)
          }
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
