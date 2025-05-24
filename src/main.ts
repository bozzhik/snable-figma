import {CloseHandler, CreateUnitsHandler, PluginData} from './types'
import {hexToRgb, getFontWeight} from './utils'

import {once, showUI} from '@create-figma-plugin/utilities'

export default function () {
  once<CreateUnitsHandler>('CREATE_UNITS', async function (data: PluginData) {
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

    // After colors section
    if (data.units.fonts?.length) {
      const fontsFrame = figma.createFrame()
      fontsFrame.name = 'Fonts'
      fontsFrame.layoutMode = 'VERTICAL'
      fontsFrame.itemSpacing = 16
      fontsFrame.paddingLeft = fontsFrame.paddingRight = fontsFrame.paddingTop = fontsFrame.paddingBottom = 16
      fontsFrame.fills = []
      fontsFrame.primaryAxisSizingMode = 'AUTO'
      fontsFrame.counterAxisSizingMode = 'AUTO'

      // Load Inter font first as fallback
      await figma.loadFontAsync({family: 'Inter', style: 'Regular'})

      for (const font of data.units.fonts) {
        const text = figma.createText()
        text.fontSize = 60

        // Normalize font name - capitalize each word
        const normalizedFontName = font.font
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')

        text.name = normalizedFontName

        // Try different font styles in order of preference
        const fontStyles = ['Regular', 'Book', 'Roman', 'Medium', 'Normal']
        let fontLoaded = false

        for (const style of fontStyles) {
          try {
            await figma.loadFontAsync({family: normalizedFontName, style})
            text.fontName = {family: normalizedFontName, style}
            fontLoaded = true
            break
          } catch (e) {
            continue
          }
        }

        if (!fontLoaded) {
          text.fontName = {family: 'Inter', style: 'Regular'}
        }

        // Format weights using getFontWeight
        const formattedWeights = font.weights.map((weight) => getFontWeight(weight)).join(', ')

        // Set text after font is loaded
        text.characters = `${normalizedFontName} (${formattedWeights})`
        fontsFrame.appendChild(text)
      }

      mainFrame.appendChild(fontsFrame)
    }
    // Handle images
    // if (data.units.images?.length) {
    //   const imagesFrame = figma.createFrame()
    //   imagesFrame.name = 'Images'
    //   imagesFrame.layoutMode = 'VERTICAL'
    //   imagesFrame.itemSpacing = 16
    //   imagesFrame.paddingLeft = imagesFrame.paddingRight = imagesFrame.paddingTop = imagesFrame.paddingBottom = 16
    //   imagesFrame.fills = []
    //   imagesFrame.primaryAxisSizingMode = 'AUTO'
    //   imagesFrame.counterAxisSizingMode = 'AUTO'

    //   for (const image of data.units.images) {
    //     try {
    //       // Create a placeholder rectangle first
    //       const rect = figma.createRectangle()
    //       rect.name = image.name || 'Image'

    //       // Set size based on type
    //       if (image.type === 'icon') {
    //         rect.resize(48, 48)
    //       } else if (image.type === 'bg-image') {
    //         rect.resize(400, 200)
    //       } else {
    //         rect.resize(300, 200)
    //       }

    //       // For SVGs and blob URLs, use a placeholder fill
    //       if (image.src.startsWith('blob:') || image.src.endsWith('.svg')) {
    //         rect.fills = [{
    //           type: 'SOLID',
    //           color: { r: 0.9, g: 0.9, b: 0.9 }
    //         }]
    //       } else {
    //         // For regular images, try to load them
    //         try {
    //           const bytes = await fetch(image.src)
    //             .then(response => response.arrayBuffer())
    //             .then(buffer => new Uint8Array(buffer))

    //           const imageHash = await figma.createImage(bytes)
    //           rect.fills = [{
    //             type: 'IMAGE',
    //             imageHash: imageHash.hash,
    //             scaleMode: 'FILL'
    //           }]
    //         } catch (imageError) {
    //           // If image loading fails, use a placeholder fill
    //           rect.fills = [{
    //             type: 'SOLID',
    //             color: { r: 0.9, g: 0.9, b: 0.9 }
    //           }]

    //           // Add a text label indicating the error
    //           const errorText = figma.createText()
    //           await figma.loadFontAsync({ family: "Inter", style: "Regular" })
    //           errorText.fontSize = 10
    //           errorText.characters = "Failed to load image"
    //           errorText.textAlignHorizontal = 'CENTER'
    //           errorText.x = rect.x + (rect.width - errorText.width) / 2
    //           errorText.y = rect.y + (rect.height - errorText.height) / 2

    //           // Group the rectangle and error text
    //           const group = figma.group([rect, errorText], imagesFrame)
    //           group.name = image.name || 'Failed Image'
    //           continue
    //         }
    //       }

    //       imagesFrame.appendChild(rect)
    //     } catch (error) {
    //       console.error(`Failed to process image: ${image.src}`, error)
    //     }
    //   }

    //   mainFrame.appendChild(imagesFrame)
    // }

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
