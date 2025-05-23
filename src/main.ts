import {CloseHandler, CreateUnitsHandler, PluginData} from './types'
import {hexToRgb} from './utils'

import {once, showUI} from '@create-figma-plugin/utilities'

export default function () {
  once<CreateUnitsHandler>('CREATE_UNITS', function (data: PluginData) {
    // Создаем основной фрейм
    const mainFrame = figma.createFrame()
    mainFrame.name = `[${data.snabled.title}] ${data.snabled.url}`
    mainFrame.layoutMode = 'VERTICAL'
    mainFrame.itemSpacing = 24
    mainFrame.paddingLeft = mainFrame.paddingRight = mainFrame.paddingTop = mainFrame.paddingBottom = 24
    mainFrame.fills = []
    mainFrame.primaryAxisSizingMode = 'AUTO'
    mainFrame.counterAxisSizingMode = 'AUTO'

    // Получаем центр текущего вида
    const center = figma.viewport.center
    mainFrame.x = center.x
    mainFrame.y = center.y

    // Обработка цветов
    if (data.units.colors?.length) {
      const colorsFrame = figma.createFrame()
      colorsFrame.name = 'Colors'
      colorsFrame.layoutMode = 'HORIZONTAL'
      colorsFrame.itemSpacing = 16
      colorsFrame.paddingLeft = colorsFrame.paddingRight = colorsFrame.paddingTop = colorsFrame.paddingBottom = 16
      colorsFrame.fills = []
      colorsFrame.primaryAxisSizingMode = 'AUTO'
      colorsFrame.counterAxisSizingMode = 'AUTO'

      data.units.colors.forEach((color) => {
        const rect = figma.createRectangle()
        rect.resize(100, 100)
        rect.cornerRadius = 10
        rect.name = color.value
        rect.fills = [
          {
            type: 'SOLID',
            color: hexToRgb(color.value),
          },
        ]

        if (color.isContrasted === false) {
          rect.strokes = [
            {
              type: 'SOLID',
              color: {r: 0.9, g: 0.9, b: 0.9},
            },
          ]
          rect.strokeWeight = 3
        }

        colorsFrame.appendChild(rect)
      })

      mainFrame.appendChild(colorsFrame)
    }

    // Здесь в будущем можно добавить обработку шрифтов и изображений
    // if (data.units.fonts) { ... }
    // if (data.units.images) { ... }

    // Добавляем основной фрейм на страницу и центрируем его
    figma.currentPage.appendChild(mainFrame)

    // Центрируем фрейм относительно его размеров
    mainFrame.x = center.x - mainFrame.width / 2
    mainFrame.y = center.y - mainFrame.height / 2

    figma.currentPage.selection = [mainFrame]
    figma.viewport.scrollAndZoomIntoView([mainFrame])

    figma.closePlugin()
  })

  once<CloseHandler>('CLOSE', function () {
    figma.closePlugin()
  })

  showUI({
    width: 280,
    height: 250,
  })
}
