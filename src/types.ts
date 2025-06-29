import {EventHandler} from '@create-figma-plugin/utilities'

export type Snabled = {favicon: string | null; title: string; url: string}

export type FontsUnit = {font: string; weights: string[]}
export type ColorUnit = {value: string; isContrasted: boolean}
export type ImageUnit = {type: 'img' | 'bg-image' | 'icon'; src: string; name?: string}

export type Units = {
  fonts?: FontsUnit[]
  colors?: ColorUnit[]
  images?: ImageUnit[]
}

export type PluginData = {
  version: string
  token?: string
  snabled: Snabled
  units: Units
}

export type Report = {
  version: string
  token?: string
  snabled: Snabled
  fontsCount: number
  colorsCount: number
  imagesCount: number
  fonts?: Array<{font: string; weights: string[]}>
  colors?: Array<{value: string; isContrasted: boolean}>
}

export type CreateUnitsHandler = EventHandler & {
  name: 'CREATE_UNITS'
  handler: (data: PluginData) => void
}

export type CloseHandler = EventHandler & {
  name: 'CLOSE'
  handler: () => void
}

export type ResizeUIHandler = EventHandler & {
  name: 'RESIZE_UI'
  handler: (hasReport: boolean) => void
}
