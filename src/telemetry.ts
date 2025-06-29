const WEBSITE_PATH = 'https://snable.website' // 'http://localhost:3000'

interface FigmaPluginData {
  token: string
  figma_plugin: {
    urls: string[]
  }
}

export async function sendFigmaData(token: string, urls: string[]): Promise<void> {
  const requestData = {
    token: token || 'DEV',
    figma_plugin: {
      urls: urls,
    },
  } as FigmaPluginData

  console.log('🚀 Sending Figma data to API...')
  console.log('📍 URL:', `${WEBSITE_PATH}/api/figma`)
  console.log('📦 Request data:', requestData)

  try {
    const response = await fetch(`${WEBSITE_PATH}/api/figma`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    console.log('📡 Response status:', response.status)
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })
    console.log('📡 Response headers:', headers)

    if (response.ok) {
      const responseData = await response.json()
      console.log('✅ Figma data sent successfully')
      console.log('📝 Response data:', responseData)
    } else {
      const status = response.status
      let errorText = ''

      try {
        const errorData = await response.json()
        errorText = JSON.stringify(errorData)
        console.log('❌ Error response data:', errorData)
      } catch {
        errorText = await response.text()
        console.log('❌ Error response text:', errorText)
      }

      switch (status) {
        case 400:
          console.error('❌ API Error: Missing token', errorText)
          break
        case 404:
          console.error('❌ API Error: User with this token not found', errorText)
          break
        case 500:
          console.error('❌ API Error: Internal server error', errorText)
          break
        default:
          console.error(`❌ API Error: Unexpected status ${status}`, errorText)
      }
    }
  } catch (error) {
    console.error('💥 Failed to send Figma data:', error)
    if (error instanceof Error) {
      console.error('🔍 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    }
  }
}
