import '!./output.css'

import type {CreateUnitsHandler, PluginData, Snabled} from './types'

import {h, Fragment} from 'preact'
import {useCallback, useState} from 'preact/hooks'

import {Button, render, Text, Muted, TextboxMultiline, useInitialFocus, Link} from '@create-figma-plugin/ui'
import {emit} from '@create-figma-plugin/utilities'

function Plugin() {
  const [jsonData, setJsonData] = useState<string>('')
  const [isValid, setIsValid] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [report, setReport] = useState<{
    version: string
    snabled: Snabled
    colorsCount: number
    // Подготовлено для будущего расширения
    fontsCount?: number
    imagesCount?: number
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
        imagesCount: data.units.images?.length || 0,
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
    function () {
      if (isValid) {
        const data = JSON.parse(jsonData) as PluginData
        emit<CreateUnitsHandler>('CREATE_UNITS', data)
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
          <div className="space-y-1.5">
            <div className="text-lg font-medium">{report.snabled.title}</div>

            <Text>
              <Muted>Colors: {report.colorsCount}</Muted>
            </Text>

            {/* <Text>Количество шрифтов: {report.fontsCount}</Text>
            <Text>Количество изображений: {report.imagesCount}</Text> */}
          </div>
        )}
      </section>

      <Button fullWidth onClick={handleCreateButtonClick} disabled={!isValid}>
        Import elements
      </Button>
    </main>
  )
}

export default render(Plugin)
