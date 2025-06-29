import {h} from 'preact'
import {useCallback, useRef, useEffect} from 'preact/hooks'
import {Text} from '@create-figma-plugin/ui'
import clsx from 'clsx'

type Props = {
  jsonData: string
  handleTextInput: (value: string) => void
  error: string
  report: any | null
  handleReset: () => void
}

export function DataInput({jsonData, handleTextInput, error, report, handleReset}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!report && textareaRef.current) {
      textareaRef.current.focus()
    }
    if (report && textareaRef.current) {
      textareaRef.current.scrollTop = 0
    }
  }, [report])

  const handleChange = useCallback(
    (event: h.JSX.TargetedEvent<HTMLTextAreaElement>) => {
      if (handleTextInput) {
        handleTextInput(event.currentTarget.value)
      }
    },
    [handleTextInput],
  )

  return (
    <div className="relative flex flex-col flex-1 gap-3">
      {report && (
        <div onClick={handleReset} className="absolute inset-0 z-20 flex items-center justify-center rounded-md cursor-pointer bg-neutral-100/50 dark:bg-neutral-900/70 group">
          <div className="!px-2 !py-1 !bg-neutral-500/80 dark:!bg-neutral-700 text-xs font-medium rounded-md text-white group-hover:bg-neutral-700/70 duration-200">Reset</div>
        </div>
      )}

      <div class="p-2 h-full bg-neutral-200 dark:bg-neutral-800 rounded-md">
        <textarea
          ref={textareaRef}
          rows={report ? 1 : 5}
          onInput={handleChange}
          value={jsonData}
          placeholder="{ ... }"
          className={clsx('block size-full min-h-14 rounded-sm text-sm resize-none', 'placeholder-neutral-700 dark:placeholder:text-neutral-400', {
            'opacity-50 cursor-not-allowed': report !== null,
            'min-h-[80px] overflow-hidden': report !== null,
            'overflow-y-auto': report === null,
          })}
          readOnly={report !== null}
        />
      </div>

      {error && <div className="p-2 text-sm text-red-500 bg-red-200 rounded dark:bg-red-900/20 dark:text-red-400">{error}</div>}
    </div>
  )
}
