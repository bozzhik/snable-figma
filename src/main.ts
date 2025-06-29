import {CloseHandler, CreateUnitsHandler, PluginData, ResizeUIHandler} from '@/types'
import {hexToRgb, getFontWeight} from '@/utils'

import {once, showUI, on} from '@create-figma-plugin/utilities'

export default function () {
  on<ResizeUIHandler>('RESIZE_UI', function (hasReport: boolean) {
    const height = hasReport ? 520 : 250
    figma.ui.resize(400, height)
  })
  once<CreateUnitsHandler>('CREATE_UNITS', async function (data: PluginData) {
    const truncateTitle = (title: string, maxLength: number = 25) => {
      return title.length > maxLength ? title.substring(0, maxLength) + '...' : title
    }

    // Цветовая палитра для нейтральных цветов
    const neutral = {
      50: {r: 0.98, g: 0.98, b: 0.98}, // #fafafa
      100: {r: 0.96, g: 0.96, b: 0.96}, // #f5f5f5
      200: {r: 0.9, g: 0.9, b: 0.9}, // #e5e5e5
      300: {r: 0.83, g: 0.83, b: 0.83}, // #d4d4d4
      400: {r: 0.64, g: 0.64, b: 0.64}, // #a3a3a3
      500: {r: 0.45, g: 0.45, b: 0.45}, // #737373
      600: {r: 0.32, g: 0.32, b: 0.32}, // #525252
      700: {r: 0.25, g: 0.25, b: 0.25}, // #404040
      800: {r: 0.15, g: 0.15, b: 0.15}, // #262626
      900: {r: 0.09, g: 0.09, b: 0.09}, // #171717
      950: {r: 0.04, g: 0.04, b: 0.04}, // #0a0a0a
    }

    // Цвета для темной темы по умолчанию
    const colors = {
      background: neutral[900],
      cardBackground: neutral[800],
      textPrimary: neutral[50],
      textSecondary: neutral[400],
      border: neutral[700],
    }

    // Создаем основной фрейм
    const mainFrame = figma.createFrame()
    mainFrame.name = `[${truncateTitle(data.snabled.title)}] — ${data.snabled.url}`
    mainFrame.layoutMode = 'VERTICAL'
    mainFrame.itemSpacing = 24
    mainFrame.paddingLeft = mainFrame.paddingRight = mainFrame.paddingTop = mainFrame.paddingBottom = 24

    // Фон в зависимости от темы
    mainFrame.fills = [
      {
        type: 'SOLID',
        color: colors.background,
      },
    ]

    mainFrame.primaryAxisSizingMode = 'AUTO'
    mainFrame.counterAxisSizingMode = 'AUTO'
    mainFrame.cornerRadius = 16

    // Получаем центр текущего вида
    const center = figma.viewport.center
    mainFrame.x = center.x
    mainFrame.y = center.y

    // Заголовок страницы
    const headerFrame = figma.createFrame()
    headerFrame.name = 'Header'
    headerFrame.layoutMode = 'VERTICAL'
    headerFrame.itemSpacing = 6
    headerFrame.fills = []
    headerFrame.primaryAxisSizingMode = 'AUTO'
    headerFrame.counterAxisSizingMode = 'AUTO'

    // Загружаем шрифт для заголовка
    await figma.loadFontAsync({family: 'Inter', style: 'Medium'})

    const titleText = figma.createText()
    titleText.fontName = {family: 'Inter', style: 'Medium'}
    titleText.fontSize = 20
    titleText.fills = [{type: 'SOLID', color: colors.textPrimary}]
    titleText.characters = data.snabled.title
    headerFrame.appendChild(titleText)

    // URL как ссылка
    await figma.loadFontAsync({family: 'Inter', style: 'Regular'})
    const urlText = figma.createText()
    urlText.fontName = {family: 'Inter', style: 'Regular'}
    urlText.fontSize = 12
    urlText.fills = [{type: 'SOLID', color: {r: 0.4, g: 0.7, b: 1}}] // Синий цвет для ссылки
    urlText.characters = data.snabled.url

    // Добавляем подчеркивание для ссылки
    urlText.textDecoration = 'UNDERLINE'

    // Создаем гиперссылку
    urlText.hyperlink = {
      type: 'URL',
      value: data.snabled.url,
    }

    headerFrame.appendChild(urlText)

    mainFrame.appendChild(headerFrame)

    // Обработка цветов с grid layout
    if (data.units.colors?.length) {
      const colorsSection = figma.createFrame()
      colorsSection.name = 'Colors'
      colorsSection.layoutMode = 'VERTICAL'
      colorsSection.itemSpacing = 12
      colorsSection.fills = []
      colorsSection.primaryAxisSizingMode = 'AUTO'
      colorsSection.counterAxisSizingMode = 'AUTO'

      // Заголовок секции
      const colorTitle = figma.createText()
      colorTitle.fontName = {family: 'Inter', style: 'Medium'}
      colorTitle.fontSize = 16
      colorTitle.fills = [{type: 'SOLID', color: colors.textPrimary}]
      colorTitle.characters = `Colors (${data.units.colors.length})`
      colorsSection.appendChild(colorTitle)

      // Grid для цветов (максимум 8 колонок)
      const colorsPerRow = Math.min(8, data.units.colors.length)
      const rows = Math.ceil(data.units.colors.length / colorsPerRow)

      for (let row = 0; row < rows; row++) {
        const rowFrame = figma.createFrame()
        rowFrame.name = `Color Row ${row + 1}`
        rowFrame.layoutMode = 'HORIZONTAL'
        rowFrame.itemSpacing = 12
        rowFrame.fills = []
        rowFrame.primaryAxisSizingMode = 'AUTO'
        rowFrame.counterAxisSizingMode = 'AUTO'

        const startIndex = row * colorsPerRow
        const endIndex = Math.min(startIndex + colorsPerRow, data.units.colors.length)

        for (let i = startIndex; i < endIndex; i++) {
          const color = data.units.colors[i]

          const colorItem = figma.createFrame()
          colorItem.name = color.value
          colorItem.layoutMode = 'VERTICAL'
          colorItem.itemSpacing = 6
          colorItem.fills = []
          colorItem.primaryAxisSizingMode = 'AUTO'
          colorItem.counterAxisSizingMode = 'AUTO'
          colorItem.primaryAxisAlignItems = 'CENTER' // Центрируем содержимое

          // Цветовой квадрат
          const rect = figma.createRectangle()
          rect.resize(50, 50)
          rect.cornerRadius = 6
          rect.name = color.value
          rect.fills = [
            {
              type: 'SOLID',
              color: hexToRgb(color.value),
            },
          ]

          // Обводка для цветов с низким контрастом
          if (color.isContrasted === false) {
            rect.strokes = [
              {
                type: 'SOLID',
                color: colors.border,
              },
            ]
            rect.strokeWeight = 1
          }

          colorItem.appendChild(rect)

          // Текст с hex значением
          const hexText = figma.createText()
          hexText.fontName = {family: 'Inter', style: 'Regular'}
          hexText.fontSize = 9
          hexText.fills = [{type: 'SOLID', color: colors.textSecondary}]
          hexText.characters = color.value.toUpperCase()
          hexText.textAlignHorizontal = 'CENTER'
          colorItem.appendChild(hexText)

          rowFrame.appendChild(colorItem)
        }

        colorsSection.appendChild(rowFrame)
      }

      mainFrame.appendChild(colorsSection)
    }

    // Обработка шрифтов
    if (data.units.fonts?.length) {
      const fontsSection = figma.createFrame()
      fontsSection.name = 'Fonts'
      fontsSection.layoutMode = 'VERTICAL'
      fontsSection.itemSpacing = 12
      fontsSection.fills = []
      fontsSection.primaryAxisSizingMode = 'AUTO'
      fontsSection.counterAxisSizingMode = 'AUTO'

      // Заголовок секции
      const fontTitle = figma.createText()
      fontTitle.fontName = {family: 'Inter', style: 'Medium'}
      fontTitle.fontSize = 16
      fontTitle.fills = [{type: 'SOLID', color: colors.textPrimary}]
      fontTitle.characters = `Typography (${data.units.fonts.length})`
      fontsSection.appendChild(fontTitle)

      for (const font of data.units.fonts) {
        const fontItem = figma.createFrame()
        fontItem.name = font.font
        fontItem.layoutMode = 'VERTICAL'
        fontItem.itemSpacing = 4
        fontItem.paddingLeft = fontItem.paddingRight = fontItem.paddingTop = fontItem.paddingBottom = 10
        fontItem.fills = [
          {
            type: 'SOLID',
            color: colors.cardBackground,
          },
        ]
        fontItem.cornerRadius = 8
        fontItem.primaryAxisSizingMode = 'AUTO'
        fontItem.counterAxisSizingMode = 'FIXED'
        fontItem.resize(350, 60) // Уменьшили высоту

        // Normalize font name
        const normalizedFontName = font.font
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')

        // Заголовок шрифта
        const fontNameText = figma.createText()
        fontNameText.fontName = {family: 'Inter', style: 'Medium'}
        fontNameText.fontSize = 14
        fontNameText.fills = [{type: 'SOLID', color: colors.textPrimary}]
        fontNameText.characters = normalizedFontName
        fontItem.appendChild(fontNameText)

        // Веса шрифтов
        const weightsText = figma.createText()
        weightsText.fontName = {family: 'Inter', style: 'Regular'}
        weightsText.fontSize = 11
        weightsText.fills = [{type: 'SOLID', color: colors.textSecondary}]
        const formattedWeights = font.weights.map((weight) => getFontWeight(weight)).join(', ')
        weightsText.characters = formattedWeights
        fontItem.appendChild(weightsText)

        // Пример текста с фактическим шрифтом (уменьшенный размер)
        const sampleText = figma.createText()
        sampleText.fontSize = 16

        // Пытаемся загрузить шрифт
        let fontLoaded = false
        const fontStyles = ['Regular', 'Book', 'Roman', 'Medium', 'Normal']

        for (const style of fontStyles) {
          try {
            await figma.loadFontAsync({family: normalizedFontName, style})
            sampleText.fontName = {family: normalizedFontName, style}
            fontLoaded = true
            break
          } catch (e) {
            continue
          }
        }

        if (!fontLoaded) {
          sampleText.fontName = {family: 'Inter', style: 'Regular'}
        }

        sampleText.fills = [{type: 'SOLID', color: colors.textPrimary}]
        sampleText.characters = ''
        fontItem.appendChild(sampleText)

        fontsSection.appendChild(fontItem)
      }

      mainFrame.appendChild(fontsSection)
    }

    // Обработка изображений (если есть)
    if (data.units.images?.length) {
      const imagesSection = figma.createFrame()
      imagesSection.name = 'Images'
      imagesSection.layoutMode = 'VERTICAL'
      imagesSection.itemSpacing = 12
      imagesSection.fills = []
      imagesSection.primaryAxisSizingMode = 'AUTO'
      imagesSection.counterAxisSizingMode = 'AUTO'

      // Заголовок секции
      const imageTitle = figma.createText()
      imageTitle.fontName = {family: 'Inter', style: 'Medium'}
      imageTitle.fontSize = 16
      imageTitle.fills = [{type: 'SOLID', color: colors.textPrimary}]
      imageTitle.characters = `Images (${data.units.images.length})`
      imagesSection.appendChild(imageTitle)

      // Grid для изображений
      const imagesPerRow = 4
      const imageRows = Math.ceil(data.units.images.length / imagesPerRow)

      for (let row = 0; row < imageRows; row++) {
        const rowFrame = figma.createFrame()
        rowFrame.name = `Image Row ${row + 1}`
        rowFrame.layoutMode = 'HORIZONTAL'
        rowFrame.itemSpacing = 12
        rowFrame.fills = []
        rowFrame.primaryAxisSizingMode = 'AUTO'
        rowFrame.counterAxisSizingMode = 'AUTO'

        const startIndex = row * imagesPerRow
        const endIndex = Math.min(startIndex + imagesPerRow, data.units.images.length)

        for (let i = startIndex; i < endIndex; i++) {
          const image = data.units.images[i]

          const imageItem = figma.createFrame()
          imageItem.name = image.name || `${image.type}_${i + 1}`
          imageItem.layoutMode = 'VERTICAL'
          imageItem.itemSpacing = 6
          imageItem.fills = []
          imageItem.primaryAxisSizingMode = 'AUTO'
          imageItem.counterAxisSizingMode = 'FIXED'
          imageItem.primaryAxisAlignItems = 'CENTER' // Центрируем содержимое
          imageItem.resize(80, 100) // Фиксированная ширина для единообразия

          // Создаем прямоугольник для изображения
          const rect = figma.createRectangle()
          rect.name = image.name || `${image.type}_${i + 1}`
          rect.cornerRadius = 6

          // Устанавливаем размер по умолчанию в зависимости от типа
          if (image.type === 'icon') {
            rect.resize(40, 40)
          } else if (image.type === 'bg-image') {
            rect.resize(100, 60)
          } else {
            rect.resize(80, 60)
          }

          // Попытка загрузить изображение
          try {
            if (image.src && !image.src.startsWith('blob:') && !image.src.startsWith('data:')) {
              // Проверяем, является ли файл SVG
              const isSvg = image.src.toLowerCase().includes('.svg')

              if (isSvg) {
                // Для SVG используем специальную обработку через UI
                console.log('Processing SVG:', image.src)

                // Показываем UI для конвертации SVG
                figma.showUI(
                  `
                  <script>
                    window.onmessage = async (event) => {
                      const { svgUrl, maxWidth, maxHeight } = event.data.pluginMessage
                      
                      try {
                        // Загружаем SVG
                        const response = await fetch(svgUrl)
                        const svgText = await response.text()
                        
                        // Создаем canvas
                        const canvas = document.createElement('canvas')
                        const ctx = canvas.getContext('2d')
                        
                        // Создаем изображение из SVG
                        const img = new Image()
                        const svgBlob = new Blob([svgText], { type: 'image/svg+xml' })
                        const url = URL.createObjectURL(svgBlob)
                        
                        img.onload = () => {
                          // Устанавливаем размеры canvas
                          const aspectRatio = img.width / img.height
                          let canvasWidth = Math.min(img.width, maxWidth)
                          let canvasHeight = Math.min(img.height, maxHeight)
                          
                          if (canvasWidth / canvasHeight > aspectRatio) {
                            canvasWidth = canvasHeight * aspectRatio
                          } else {
                            canvasHeight = canvasWidth / aspectRatio
                          }
                          
                          canvas.width = canvasWidth
                          canvas.height = canvasHeight
                          
                          // Рисуем SVG на canvas
                          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)
                          
                          // Конвертируем в PNG
                          canvas.toBlob(blob => {
                            const reader = new FileReader()
                            reader.onload = () => {
                              const arrayBuffer = reader.result
                              const uint8Array = new Uint8Array(arrayBuffer)
                              parent.postMessage({ 
                                pluginMessage: { 
                                  type: 'svg-converted', 
                                  imageData: uint8Array,
                                  width: canvasWidth,
                                  height: canvasHeight
                                } 
                              }, '*')
                            }
                            reader.readAsArrayBuffer(blob)
                          }, 'image/png')
                          
                          URL.revokeObjectURL(url)
                        }
                        
                        img.onerror = () => {
                          parent.postMessage({ 
                            pluginMessage: { 
                              type: 'svg-error', 
                              error: 'Failed to load SVG' 
                            } 
                          }, '*')
                        }
                        
                        img.src = url
                      } catch (error) {
                        parent.postMessage({ 
                          pluginMessage: { 
                            type: 'svg-error', 
                            error: error.message 
                          } 
                        }, '*')
                      }
                    }
                  </script>
                `,
                  {visible: false},
                )

                // Отправляем данные в UI для обработки SVG
                const maxDimension = image.type === 'icon' ? 40 : image.type === 'bg-image' ? 100 : 80
                figma.ui.postMessage({
                  svgUrl: image.src,
                  maxWidth: maxDimension,
                  maxHeight: maxDimension,
                })

                // Ждем результат конвертации
                const result = await new Promise<{type: string; imageData?: Uint8Array; width?: number; height?: number; error?: string}>((resolve) => {
                  figma.ui.onmessage = (msg) => {
                    resolve(msg)
                  }
                })

                figma.ui.close()

                if (result.type === 'svg-converted' && result.imageData && result.width && result.height) {
                  // Создаем изображение из конвертированных данных
                  const figmaImage = figma.createImage(result.imageData)
                  rect.resize(result.width, result.height)
                  rect.fills = [
                    {
                      type: 'IMAGE',
                      imageHash: figmaImage.hash,
                      scaleMode: 'FILL',
                    },
                  ]
                } else {
                  throw new Error(result.error || 'SVG conversion failed')
                }
              } else {
                // Обычная загрузка для PNG/JPEG/GIF
                const figmaImage = await figma.createImageAsync(image.src)
                const {width, height} = await figmaImage.getSizeAsync()

                // Устанавливаем размер в зависимости от типа
                if (image.type === 'icon') {
                  rect.resize(Math.min(40, width), Math.min(40, height))
                } else if (image.type === 'bg-image') {
                  rect.resize(Math.min(100, width), Math.min(60, height))
                } else {
                  rect.resize(Math.min(80, width), Math.min(60, height))
                }

                rect.fills = [
                  {
                    type: 'IMAGE',
                    imageHash: figmaImage.hash,
                    scaleMode: 'FILL',
                  },
                ]
              }
            } else {
              // Для blob URL или других случаев используем обычный цвет
              rect.fills = [
                {
                  type: 'SOLID',
                  color: colors.cardBackground,
                },
              ]

              rect.strokes = [
                {
                  type: 'SOLID',
                  color: colors.border,
                },
              ]
              rect.strokeWeight = 1
            }
          } catch (e) {
            console.warn('Failed to load image:', image.src, e)
            // В случае ошибки используем стандартный цвет
            rect.fills = [
              {
                type: 'SOLID',
                color: colors.cardBackground,
              },
            ]

            rect.strokes = [
              {
                type: 'SOLID',
                color: colors.border,
              },
            ]
            rect.strokeWeight = 1
          }

          imageItem.appendChild(rect)

          // Подпись
          const imageLabel = figma.createText()
          imageLabel.fontName = {family: 'Inter', style: 'Regular'}
          imageLabel.fontSize = 9
          imageLabel.fills = [{type: 'SOLID', color: colors.textSecondary}]
          imageLabel.characters = image.name || image.type
          imageLabel.textAlignHorizontal = 'CENTER'
          imageItem.appendChild(imageLabel)

          rowFrame.appendChild(imageItem)
        }

        imagesSection.appendChild(rowFrame)
      }

      // Информационная плашка
      const infoNote = figma.createFrame()
      infoNote.name = 'Export Note'
      infoNote.layoutMode = 'VERTICAL'
      infoNote.itemSpacing = 4
      infoNote.paddingLeft = infoNote.paddingRight = infoNote.paddingTop = infoNote.paddingBottom = 10
      infoNote.fills = [
        {
          type: 'SOLID',
          color: {r: Math.max(colors.cardBackground.r + 0.03, 0), g: Math.max(colors.cardBackground.g + 0.03, 0), b: Math.max(colors.cardBackground.b + 0.03, 0)},
        },
      ]
      infoNote.cornerRadius = 6
      infoNote.primaryAxisSizingMode = 'AUTO'
      infoNote.counterAxisSizingMode = 'FIXED'
      infoNote.resize(350, 50) // Уменьшили высоту

      const noteText = figma.createText()
      noteText.fontName = {family: 'Inter', style: 'Regular'}
      noteText.fontSize = 11
      noteText.fills = [{type: 'SOLID', color: colors.textSecondary}]
      noteText.characters = 'For more accurate use in projects or to import other images, export images from the plugin manually'
      noteText.textAutoResize = 'HEIGHT' // Автоматический перенос по высоте
      noteText.resize(330, 30) // Уменьшили высоту с учетом отступов
      infoNote.appendChild(noteText)

      imagesSection.appendChild(infoNote)
      mainFrame.appendChild(imagesSection)
    }

    // Создаем информационный блок "Generated by"
    const generatedByFrame = figma.createFrame()
    generatedByFrame.name = 'Generated by'
    generatedByFrame.layoutMode = 'HORIZONTAL'
    generatedByFrame.itemSpacing = 4
    generatedByFrame.fills = []
    generatedByFrame.primaryAxisSizingMode = 'AUTO'
    generatedByFrame.counterAxisSizingMode = 'AUTO'

    const generatedByText = figma.createText()
    generatedByText.fontName = {family: 'Inter', style: 'Regular'}
    generatedByText.fontSize = 9
    generatedByText.fills = [{type: 'SOLID', color: colors.textSecondary}]
    generatedByText.characters = 'Generated by'
    generatedByFrame.appendChild(generatedByText)

    const snableFigmaPluginLinkText = figma.createText()
    snableFigmaPluginLinkText.fontName = {family: 'Inter', style: 'Regular'}
    snableFigmaPluginLinkText.fontSize = 9
    snableFigmaPluginLinkText.fills = [{type: 'SOLID', color: {r: 0.4, g: 0.7, b: 1}}]
    snableFigmaPluginLinkText.characters = 'Snable Figma Plugin'
    snableFigmaPluginLinkText.hyperlink = {
      type: 'URL',
      value: 'https://snable.website/figma-plugin',
    }
    generatedByFrame.appendChild(snableFigmaPluginLinkText)

    const fromText = figma.createText()
    fromText.fontName = {family: 'Inter', style: 'Regular'}
    fromText.fontSize = 9
    fromText.fills = [{type: 'SOLID', color: colors.textSecondary}]
    fromText.characters = 'based on data from'
    generatedByFrame.appendChild(fromText)

    const snableLinkText = figma.createText()
    snableLinkText.fontName = {family: 'Inter', style: 'Regular'}
    snableLinkText.fontSize = 9
    snableLinkText.fills = [{type: 'SOLID', color: {r: 0.4, g: 0.7, b: 1}}]
    snableLinkText.characters = 'Snable Chrome Extension'
    snableLinkText.hyperlink = {
      type: 'URL',
      value: 'https://snable.website',
    }
    generatedByFrame.appendChild(snableLinkText)

    mainFrame.appendChild(generatedByFrame)

    // Добавляем основной фрейм на страницу и центрируем его
    figma.currentPage.appendChild(mainFrame)

    // Центрируем фрейм относительно его размеров
    mainFrame.x = center.x - mainFrame.width / 2
    mainFrame.y = center.y - mainFrame.height / 2

    // Фокусируемся на созданном фрейме
    figma.viewport.scrollAndZoomIntoView([mainFrame])

    figma.closePlugin('Elements imported successfully!')
  })

  once<CloseHandler>('CLOSE', function () {
    figma.closePlugin()
  })

  showUI({
    height: 520,
    width: 400,
  })
}
