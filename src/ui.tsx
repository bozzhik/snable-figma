import {h, Fragment} from 'preact'
import {useCallback, useState} from 'preact/hooks'

import {Button, Columns, Container, Muted, render, Text, TextboxMultiline, VerticalSpace} from '@create-figma-plugin/ui'
import {emit} from '@create-figma-plugin/utilities'

import {CloseHandler, CreateUnitsHandler, PluginData} from './types'

function Plugin() {
  const [jsonData, setJsonData] = useState<string>('')
  const [isValid, setIsValid] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [report, setReport] = useState<{
    version: string
    colorsCount: number
    // Подготовлено для будущего расширения
    fontsCount?: number
    imagesCount?: number
  } | null>(null)

  const validateJson = (text: string): boolean => {
    try {
      const data = JSON.parse(text)
      if (!data.version || !data.units) {
        setError('Неверный формат JSON: отсутствуют обязательные поля version или units')
        setReport(null)
        return false
      }

      setReport({
        version: data.version,
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
    <Container space="small">
      <VerticalSpace space="medium" />

      <Text>
        <Muted>Вставьте скопированный код</Muted>
      </Text>

      <VerticalSpace space="small" />

      <TextboxMultiline onValueInput={handleTextInput} value={jsonData} placeholder="Вставьте код" rows={5} />

      {error && (
        <Fragment>
          <VerticalSpace space="small" />
          <Text style={{color: 'red'}}>{error}</Text>
        </Fragment>
      )}

      {report && (
        <Fragment>
          <VerticalSpace space="large" />

          <Text>Количество цветов: {report.colorsCount}</Text>

          {/* Закомментировано до реализации поддержки шрифтов и изображений
          <VerticalSpace space="small" />
          <Text>Количество шрифтов: {report.fontsCount}</Text>
          <Text>Количество изображений: {report.imagesCount}</Text>
          */}
        </Fragment>
      )}

      <VerticalSpace space="large" />

      <Columns space="extraSmall">
        <Button fullWidth onClick={handleCreateButtonClick} disabled={!isValid}>
          Создать Units
        </Button>
      </Columns>

      <VerticalSpace space="small" />
    </Container>
  )
}

export default render(Plugin)
