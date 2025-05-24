import {EventHandler} from '@create-figma-plugin/utilities'

export type Snabled = {title: string; url: string}

export type FontsUnit = {font: string; weights: string[]}
export type ColorUnit = {value: string; isContrasted: boolean}
// export type ImageUnit = {type: 'img' | 'bg-image' | 'icon'; src: string; name?: string}

export type Units = {
  fonts?: FontsUnit[]
  colors?: ColorUnit[]
  // images?: ImageUnit[]
}

export type PluginData = {
  version: string
  snabled: Snabled
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
