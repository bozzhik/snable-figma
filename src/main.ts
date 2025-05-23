import {CloseHandler, CreateUnitsHandler, PluginData} from './types'
import {hexToRgb} from './utils'

import {once, showUI} from '@create-figma-plugin/utilities'

export default function () {
  once<CreateUnitsHandler>('CREATE_UNITS', function (data: PluginData) {
    const nodes: Array<SceneNode> = []

    // Обработка цветов
    if (data.units.colors) {
      data.units.colors.forEach((color, i) => {
        const rect = figma.createRectangle()
        rect.x = i * 150
        rect.cornerRadius = 10
        rect.fills = [
          {
            type: 'SOLID',
            color: hexToRgb(color.value),
          },
        ]
        figma.currentPage.appendChild(rect)
        nodes.push(rect)
      })
    }

    // Здесь в будущем можно добавить обработку шрифтов и изображений
    // if (data.units.fonts) { ... }
    // if (data.units.images) { ... }

    if (nodes.length > 0) {
      figma.currentPage.selection = nodes
      figma.viewport.scrollAndZoomIntoView(nodes)
    }

    figma.closePlugin()
  })

  once<CloseHandler>('CLOSE', function () {
    figma.closePlugin()
  })

  showUI({
    height: 240,
    width: 270,
  })
}
