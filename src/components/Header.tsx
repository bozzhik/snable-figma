import {Link as LinkIcon} from 'lucide-react'

import {h} from 'preact'
import clsx from 'clsx'

import {Link, Text} from '@create-figma-plugin/ui'

export function Header() {
  return (
    <div className={clsx('p-3.5 pt-4', 'inline-flex items-center justify-between')}>
      <Text className={clsx('inline-flex gap-1', 'text-xs mt-0.25', 'text-neutral-600 dark:text-neutral-400')}>
        Paste copied data from
        <Link className="peer underline underline-offset-2 hover:no-underline" href="https://snable.website/store" target="_blank">
          Snable Extension
        </Link>
        <LinkIcon className={clsx('ml-0.25 mt-0.25', 'text-neutral-600 dark:text-neutral-400', 'peer-hover:scale-[110%] duration-200')} size={13} strokeWidth={1.5} />
      </Text>

      <Text className={clsx('inline-flex gap-1', 'text-xs mt-0.25', 'text-neutral-400 dark:text-neutral-500')}>
        <Link className="peer underline underline-offset-2 hover:no-underline" href="https://snable.website/figma-plugin-guide" target="_blank">
          Help
        </Link>
      </Text>
    </div>
  )
}
