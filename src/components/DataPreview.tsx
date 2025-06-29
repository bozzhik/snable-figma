import {h} from 'preact'
import {Text, Link} from '@create-figma-plugin/ui'
import {Link as LinkIcon, Palette as PaletteIcon, Type as TypeIcon, Image as ImageIcon} from 'lucide-react'
import {Report} from '@/types'
import {getFontWeight} from '@/utils'

interface PreviewSectionProps {
  report: Report
  truncateTitle: (title: string, maxLength?: number) => string
}

const getFavicon = (url: string) => {
  try {
    const domain = new URL(url).hostname
    return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=64`
  } catch {
    return undefined
  }
}

interface StatBlockProps {
  icon: h.JSX.Element
  count: number
  label: string
  colorClasses: {
    gradient: string
    border: string
    iconBg: string
    iconText: string
    countText: string
    labelText: string
  }
}

function StatBlock({icon, count, label, colorClasses}: StatBlockProps) {
  return (
    <div className={`flex items-center gap-3 p-1.5 rounded-xl bg-gradient-to-br ${colorClasses.gradient} border ${colorClasses.border}`}>
      <div className={`p-2 ${colorClasses.iconBg} rounded-lg`}>{h(icon.type, {size: 18, className: colorClasses.iconText})}</div>

      <div className="space-y-1">
        <div className={`text-base font-bold leading-none ${colorClasses.countText}`}>{count}</div>
        <div className={`text-[12px] font-medium leading-none ${colorClasses.labelText}`}>{label}</div>
      </div>
    </div>
  )
}

export function DataPreview({report, truncateTitle}: PreviewSectionProps) {
  return (
    <div className="relative overflow-hidden border rounded-md bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700">
      <div className="relative p-2.5 space-y-3">
        {/* {report.token && (
          <div className="px-2 py-1 rounded-full bg-neutral-900/10 dark:bg-neutral-100/10 backdrop-blur-sm">
            <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">Token: {report.token}</span>
          </div>
        )} */}

        {/* Page Info */}
        <div className="flex items-start justify-between w-full">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              {report.snabled.url && getFavicon(report.snabled.url) && (
                <div className="grid p-0.5 bg-white dark:bg-neutral-100 rounded-md place-items-center border border-neutral-300 dark:border-neutral-600">
                  <img src={getFavicon(report.snabled.url)!} className="size-[26px]" alt="favicon" />
                </div>
              )}

              <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">{truncateTitle(report.snabled.title)}</Text>
            </div>

            <Text className="font-mono text-xs text-neutral-700 dark:text-neutral-400">{report.snabled.url.length > 40 ? report.snabled.url.substring(0, 40) + '..' : report.snabled.url}</Text>
          </div>

          <a href={report.snabled.url} target="_blank" className="inline-flex items-center p-2 transition-all duration-200 bg-white border rounded-lg hover:bg-neutral-50 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-transparent">
            <LinkIcon size={16} />
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5">
          <StatBlock
            icon={<TypeIcon />}
            count={report.fontsCount}
            label="Fonts"
            colorClasses={{
              gradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
              border: 'border-blue-300 dark:border-blue-700/50',
              iconBg: 'bg-blue-500/20 dark:bg-blue-400/20',
              iconText: 'text-blue-700 dark:text-blue-400',
              countText: 'text-blue-900 dark:text-blue-100',
              labelText: 'text-blue-700 dark:text-blue-300',
            }}
          />
          <StatBlock
            icon={<PaletteIcon />}
            count={report.colorsCount}
            label="Colors"
            colorClasses={{
              gradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
              border: 'border-green-300 dark:border-green-700/50',
              iconBg: 'bg-green-500/20 dark:bg-green-400/20',
              iconText: 'text-green-700 dark:text-green-400',
              countText: 'text-green-900 dark:text-green-100',
              labelText: 'text-green-700 dark:text-green-300',
            }}
          />
          <StatBlock
            icon={<ImageIcon />}
            count={report.imagesCount}
            label="Images"
            colorClasses={{
              gradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
              border: 'border-purple-300 dark:border-purple-700/50',
              iconBg: 'bg-purple-500/20 dark:bg-purple-400/20',
              iconText: 'text-purple-700 dark:text-purple-400',
              countText: 'text-purple-900 dark:text-purple-100',
              labelText: 'text-purple-700 dark:text-purple-300',
            }}
          />
        </div>

        {/* Color Preview */}
        {report.colors && report.colors.length > 0 && (
          <div className="space-y-2">
            <Text className="text-sm font-medium text-neutral-900 dark:text-white">Color Palette</Text>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(32px,1fr))] gap-1.5">
              {report.colors.slice(0, 7).map((color, index) => (
                <div key={index} className="w-full h-8 border-2 rounded shadow-sm border-neutral-300 dark:border-neutral-600" style={{backgroundColor: color.value}} title={color.value} />
              ))}
              {report.colors.length > 7 && <div className="flex items-center justify-center w-full h-8 text-xs font-medium bg-white border rounded dark:bg-neutral-700 text-neutral-700 dark:text-neutral-400 border-neutral-300 dark:border-transparent">+{report.colors.length - 7}</div>}
            </div>
          </div>
        )}

        {/* Font Preview */}
        {report.fonts && report.fonts.length > 0 && (
          <div className="space-y-2">
            <Text className="text-sm font-medium text-neutral-900 dark:text-white">Typography</Text>
            <div className="space-y-2">
              {report.fonts.slice(0, 2).map((font, index) => (
                <div key={index} className="text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="font-medium">{font.font}</span>
                  <span className="ml-1.5 text-xs lowercase text-neutral-500 dark:text-neutral-400">({font.weights.map(getFontWeight).join(', ')})</span>
                </div>
              ))}
              {report.fonts.length > 2 && <Text className="text-xs text-neutral-500 dark:text-neutral-400">+{report.fonts.length - 2} more fonts</Text>}
            </div>
          </div>
        )}

        {/* <div className="flex justify-between gap-1.5">
          {[
            {label: 'Version', value: report.version},
            {label: 'Token', value: report.token},
          ].map((item, index) => (
            <div key={index} className="flex-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
              <Text className="text-[10px] font-medium text-neutral-900 dark:text-neutral-200">
                {item.label}: {item.value}
              </Text>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  )
}
