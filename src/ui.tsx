import '!./output.css'

import type {CreateUnitsHandler, Report, PluginData, ResizeUIHandler} from '@/types'

import {sendFigmaData} from '@/telemetry'

import {h} from 'preact'
import {useCallback, useState, useEffect} from 'preact/hooks'
import clsx from 'clsx'

import {emit} from '@create-figma-plugin/utilities'
import {render, Button} from '@create-figma-plugin/ui'

import {Header} from '@/components/Header'
import {DataInput} from '@/components/DataInput'
import {DataPreview} from '@/components/DataPreview'

function Plugin() {
  const [jsonData, setJsonData] = useState<string>('')
  const [isValid, setIsValid] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [report, setReport] = useState<Report | null>(null)

  useEffect(() => {
    emit<ResizeUIHandler>('RESIZE_UI', report !== null)
  }, [report])

  const validateJson = (text: string): boolean => {
    try {
      const data = JSON.parse(text)
      if (!data.version || !data.units) {
        setError('Invalid JSON structure')
        setReport(null)
        return false
      }

      setReport({
        version: data.version,
        token: data.token,
        snabled: data.snabled,
        colorsCount: data.units.colors?.length || 0,
        fontsCount: data.units.fonts?.length || 0,
        imagesCount: data.units.images?.length || 0,
        fonts: data.units.fonts || [],
        colors: data.units.colors || [],
      })

      console.log('📊 Report created, sending data to API...')
      console.log('🔑 Token:', data.token)
      console.log('🌐 URL:', data.snabled.url)
      sendFigmaData(data.token, [data.snabled.url])

      setError('')
      return true
    } catch (e) {
      setError('Invalid JSON format')
      setReport(null)
      return false
    }
  }

  const handleTextInput = useCallback((value: string) => {
    setJsonData(value)
    setIsValid(validateJson(value))
  }, [])

  const handleReset = useCallback(() => {
    setJsonData('')
    setIsValid(false)
    setLoading(false)
    setError('')
    setReport(null)
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

  const truncateTitle = (title: string, maxLength: number = 30) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title
  }

  return (
    <main className="flex flex-col h-full overflow-y-auto bg-neutral-100 dark:bg-neutral-900">
      <Header />

      <div className="flex-1 px-3.5 !pb-3.5 flex flex-col space-y-3">
        <DataInput jsonData={jsonData} handleTextInput={handleTextInput} error={error} report={report} handleReset={handleReset} />

        {report && <DataPreview report={report} truncateTitle={truncateTitle} />}

        <Button fullWidth onClick={handleCreateButtonClick} disabled={!isValid} loading={loading} className={clsx(isValid && '!bg-neutral-600 dark:!bg-neutral-100 !text-white dark:!text-black', '!font-medium')}>
          Import elements
        </Button>
      </div>
    </main>
  )
}

export default render(Plugin)
