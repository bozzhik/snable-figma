import {EventHandler} from '@create-figma-plugin/utilities'

export type ColorUnit = {
  value: string
  isContrasted: boolean
}

export type Units = {
  colors?: ColorUnit[]
  fonts?: any[] // Подготовка для будущего расширения
  images?: any[] // Подготовка для будущего расширения
}

export type PluginData = {
  version: string
  units: Units
}

export type CreateUnitsHandler = EventHandler & {
  name: 'CREATE_UNITS'
  handler: (data: PluginData) => void
}

export type CloseHandler = EventHandler & {
  name: 'CLOSE'
  handler: () => void
}
