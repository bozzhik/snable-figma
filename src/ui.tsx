import '!./output.css'

import type {CreateUnitsHandler, PluginData, Snabled} from './types'

import {h, Fragment} from 'preact'
import {useCallback, useState} from 'preact/hooks'

import {Button, render, Text, Muted, TextboxMultiline, useInitialFocus, Link} from '@create-figma-plugin/ui'
import {emit} from '@create-figma-plugin/utilities'

function Plugin() {
  const [jsonData, setJsonData] = useState<string>('')
  const [isValid, setIsValid] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [report, setReport] = useState<{
    version: string
    snabled: Snabled
    fontsCount: number
    colorsCount: number
    // imagesCount: number
  } | null>(null)

  const validateJson = (text: string): boolean => {
    try {
      const data = JSON.parse(text)
      if (!data.version || !data.units) {
        setError('Неверный формат JSON: отсутствуют обязательные поля')
        setReport(null)
        return false
      }

      setReport({
        version: data.version,
        snabled: data.snabled,
        colorsCount: data.units.colors?.length || 0,
        // Подготовлено для будущего расширения
        fontsCount: data.units.fonts?.length || 0,
        // imagesCount: data.units.images?.length || 0,
      })

      setError('')
      return true
    } catch (e) {
      setError('Неверный JSON формат')
      setReport(null)
      return false
    }
  }

  const handleTextInput = useCallback((value: string) => {
    setJsonData(value)
    setIsValid(validateJson(value))
  }, [])

  const handleCreateButtonClick = useCallback(
    async function () {
      if (isValid) {
        setLoading(true)
        try {
          const data = JSON.parse(jsonData) as PluginData
          await emit<CreateUnitsHandler>('CREATE_UNITS', data)
        } finally {
          setLoading(false)
        }
      }
    },
    [jsonData, isValid],
  )

  return (
    <main className="px-3 pt-3.5 py-3 flex flex-col justify-between h-full gap-3">
      <section className="space-y-3.5">
        <Text>
          <Muted>
            Paste copied data from{' '}
            <Link href="https://snable.website/store" target="_blank">
              Snable Extension
            </Link>
          </Muted>
        </Text>

        <TextboxMultiline {...useInitialFocus()} rows={5} onValueInput={handleTextInput} value={jsonData} placeholder="{ ... }" />

        {error && <Text className="text-red-500 leading-none">{error}</Text>}

        {report && (
          <div className="space-y-2.5">
            <div className="text-sm font-medium leading-[1.2] line-clamp-1">{report.snabled.title}</div>

            <div className="flex gap-2.5">
              {report.colorsCount > 0 && (
                <Text>
                  <Muted>Colors: {report.colorsCount}</Muted>
                </Text>
              )}

              {report.fontsCount > 0 && (
                <Text>
                  <Muted>Fonts: {report.fontsCount}</Muted>
                </Text>
              )}

              {/* {report.imagesCount > 0 && (
                <Text>
                  <Muted>Images: {report.imagesCount}</Muted>
                </Text>
              )} */}
            </div>
          </div>
        )}
      </section>

      <Button fullWidth onClick={handleCreateButtonClick} disabled={!isValid} loading={loading}>
        Import elements
      </Button>
    </main>
  )
}

export default render(Plugin)
