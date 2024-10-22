/* eslint-disable max-lines */
import type { PPTTextElement, Slide, SlideBackground, PPTLineElement, ShapeTextAlign, PPTShapeElement, TableCellStyle, TableCell, ChartOptions, ChartType } from '@/types/slides'
import { nanoid } from 'nanoid'
import type { ChartItem, Element, Shape } from 'pptxtojson'
import { theme } from './theme'
import { _slides } from './base'
import { SHAPE_LIST, SHAPE_PATH_FORMULAS, type ShapePoolItem } from '@/configs/shapes'
import { transformed } from './convert/transfrom'

const parseLineElement = (el: Shape): PPTLineElement => {
  let start: [number, number] = [0, 0]
  let end: [number, number] = [0, 0]

  if (!el.isFlipV && !el.isFlipH) { // 右下
    start = [0, 0]
    end = [el.width, el.height]
  }
  else if (el.isFlipV && el.isFlipH) { // 左上
    start = [el.width, el.height]
    end = [0, 0]
  }
  else if (el.isFlipV && !el.isFlipH) { // 右上
    start = [0, el.height]
    end = [el.width, 0]
  }
  else { // 左下
    start = [el.width, 0]
    end = [0, el.height]
  }
  return {
    type: 'line',
    id: nanoid(10),
    width: el.borderWidth || 1,
    left: el.left,
    top: el.top,
    start,
    end,
    style: el.borderType === 'solid' ? 'solid' : 'dashed',
    color: el.borderColor,
    points: ['', el.shapType === 'straightConnector1' ? 'arrow' : '']
  }
}

export const format = () => {
  const width = 720
  const scale = 1024 / width
  const shapeList: ShapePoolItem[] = []
  for (const item of SHAPE_LIST) {
    shapeList.push(...item.children)
  }

  const slides: Slide[] = []
  for (const item of _slides) {
    const { type, value } = item.fill
    let background: SlideBackground
    if (type === 'image') {
      background = {
        type: 'image',
        image: {
          src: value.picBase64,
          size: 'cover',
        },
      }
    }
    else if (type === 'gradient') {
      background = {
        type: 'gradient',
        gradient: {
          type: 'linear',
          colors: value.colors.map((item: any) => ({
            ...item,
            pos: parseInt(item.pos),
          })),
          rotate: value.rot,
        },
      }
    }
    else {
      background = {
        type: 'solid',
        color: value,
      }
    }

    const slide: Slide = {
      id: nanoid (10),
      elements: [],
      background,
    }

    const parseElements = (elements: Element[]) => {
      for (const el of elements) {
        const originWidth = el.width || 1
        const originHeight = el.height || 1
        const originLeft = el.left
        const originTop = el.top
    
        el.width = el.width * scale
        el.height = el.height * scale
        el.left = el.left * scale
        el.top = el.top * scale
    
        if (el.type === 'text') {
          const textEl: PPTTextElement = {
            type: 'text',
            id: nanoid(10),
            width: el.width,
            height: el.height,
            left: el.left,
            top: el.top,
            rotate: el.rotate,
            defaultFontName: theme.fontName,
            defaultColor: theme.fontColor,
            content: el.content,
            lineHeight: 1,
            outline: {
              color: el.borderColor,
              width: el.borderWidth,
              style: el.borderType === 'solid' ? 'solid' : 'dashed',
            },
            fill: el.fillColor,
            vertical: el.isVertical,
          }
          if (el.shadow) textEl.shadow = el.shadow
          slide.elements.push(textEl)
        }
        else if (el.type === 'image') {
          slide.elements.push({
            type: 'image',
            id: nanoid(10),
            src: el.src,
            width: el.width,
            height: el.height,
            left: el.left,
            top: el.top,
            fixedRatio: true,
            rotate: el.rotate,
            flipH: el.isFlipH,
            flipV: el.isFlipV,
          })
        }
        else if (el.type === 'audio') {
          slide.elements.push({
            type: 'audio',
            id: nanoid(10),
            src: el.blob,
            width: el.width,
            height: el.height,
            left: el.left,
            top: el.top,
            rotate: 0,
            fixedRatio: false,
            color: theme.themeColor,
            loop: false,
            autoplay: false,
          })
        }
        else if (el.type === 'video') {
          slide.elements.push({
            type: 'video',
            id: nanoid(10),
            src: (el.blob || el.src)!,
            width: el.width,
            height: el.height,
            left: el.left,
            top: el.top,
            rotate: 0,
            autoplay: false,
          })
        }
        else if (el.type === 'shape') {
          if (el.shapType === 'line' || /Connector/.test(el.shapType)) {
            const lineElement = parseLineElement(el)
            slide.elements.push(lineElement)
          }
          else {
            const shape = shapeList.find(item => item.pptxShapeType === el.shapType)
    
            const vAlignMap: { [key: string]: ShapeTextAlign } = {
              'mid': 'middle',
              'down': 'bottom',
              'up': 'top',
            }
            
            const element: PPTShapeElement = {
              type: 'shape',
              id: nanoid(10),
              width: el.width,
              height: el.height,
              left: el.left,
              top: el.top,
              viewBox: [200, 200],
              path: 'M 0 0 L 200 0 L 200 200 L 0 200 Z',
              fill: el.fillColor || 'none',
              fixedRatio: false,
              rotate: el.rotate,
              outline: {
                color: el.borderColor,
                width: el.borderWidth,
                style: el.borderType === 'solid' ? 'solid' : 'dashed',
              },
              text: {
                content: el.content,
                defaultFontName: theme.fontName,
                defaultColor: theme.fontColor,
                align: vAlignMap[el.vAlign] || 'middle',
              },
              flipH: el.isFlipH,
              flipV: el.isFlipV,
            }
            if (el.shadow) element.shadow = el.shadow
    
            if (shape) {
              element.path = shape.path
              element.viewBox = shape.viewBox
    
              if (shape.pathFormula) {
                element.pathFormula = shape.pathFormula
                element.viewBox = [el.width, el.height]
    
                const pathFormula = SHAPE_PATH_FORMULAS[shape.pathFormula]
                if ('editable' in pathFormula && pathFormula.editable) {
                  element.path = pathFormula.formula(el.width, el.height, pathFormula.defaultValue)
                  element.keypoints = pathFormula.defaultValue
                }
                else element.path = pathFormula.formula(el.width, el.height)
              }
            }
            if (el.shapType === 'custom') {
              element.special = true
              element.path = el.path!
              element.viewBox = [originWidth, originHeight]
            }
            
            slide.elements.push(element)
          }
        }
        else if (el.type === 'table') {
          const row = el.data.length
          const col = el.data[0].length

          const data: TableCell[][] = []
          for (let i = 0; i < row; i++) {
            const rowCells: TableCell[] = []
            for (let j = 0; j < col; j++) {
              const cellData = el.data[i][j]
    
              const parser = new DOMParser()
              const doc = parser.parseFromString(cellData.text, 'text/html')
              const p = doc.querySelector('p')
              const span = doc.querySelector('span')
              const align = p?.style.textAlign || 'left'
    
              rowCells.push({
                id: nanoid(10),
                colspan: cellData.colSpan || 1,
                rowspan: cellData.rowSpan || 1,
                text: span?.innerText || '',
                style: {
                  align: ['left', 'right', 'center'].includes(align) ? (align as 'left' | 'right' | 'center') : 'left',
                  fontsize: span?.style.fontSize || '',
                  fontname: span?.style.fontFamily || '',
                  color: span?.style.color || '',
                  backcolor: cellData.fillColor || ''
                },
              })
            }
            data.push(rowCells)
          }
    
          const colWidths: number[] = new Array(col).fill(1 / col)
    
          slide.elements.push({
            type: 'table',
            id: nanoid(10),
            width: el.width,
            height: el.height,
            left: el.left,
            top: el.top,
            colWidths,
            rotate: 0,
            data,
            outline: {
              width: 2,
              style: 'solid',
              color: '#eeece1',
            },
            theme: {
              color: '',
              rowHeader: true,
              rowFooter: false,
              colHeader: false,
              colFooter: false,
            },
            cellMinHeight: 36,
          })
        }
        else if (el.type === 'chart') {
          let labels: string[]
          let legends: string[]
          let series: number[][]
    
          if (el.chartType === 'scatterChart' || el.chartType === 'bubbleChart') {
            const [_labels = [], _series] = el.data
            labels = _labels.map((item) => item + '')
            legends = ['系列1']
            series = _series ? [_series] : []
          }
          else {
            const data = el.data as ChartItem[]
            labels = Object.values((data[0] || {}).xlabels || {})
            legends = data.map(item => item.key)
            series = data.map(item => item.values.map(v => v.y))
          }
    
          const options: ChartOptions = {}
    
          let chartType: ChartType = 'bar'
    
          switch (el.chartType) {
            case 'barChart':
            case 'bar3DChart':
              chartType = 'bar'
              if (el.barDir === 'bar') options.horizontalBars = true
              if (el.grouping === 'stacked' || el.grouping === 'percentStacked') options.stackBars = true
              break
            case 'lineChart':
            case 'line3DChart':
            case 'areaChart':
            case 'area3DChart':
            case 'scatterChart':
            case 'bubbleChart':
              chartType = 'line'
              if (el.chartType === 'areaChart' || el.chartType === 'area3DChart') options.showArea = true
              if (el.chartType === 'scatterChart' || el.chartType === 'bubbleChart') options.showLine = false
              break
            case 'pieChart':
            case 'pie3DChart':
            case 'doughnutChart':
              chartType = 'pie'
              if (el.chartType === 'doughnutChart') options.donut = true
              break
            default:
          }
    
          slide.elements.push({
            type: 'chart',
            id: nanoid(10),
            chartType: chartType,
            width: el.width,
            height: el.height,
            left: el.left,
            top: el.top,
            rotate: 0,
            themeColor: [theme.themeColor],
            gridColor: theme.fontColor,
            data: {
              labels,
              legends,
              series,
            },
            options,
          })
        }
        else if (el.type === 'group' || el.type === 'diagram') {
          const elements = el.elements.map(_el => ({
            ..._el,
            left: _el.left + originLeft,
            top: _el.top + originTop,
          }))
          parseElements(elements)
        }
      }
    }
    parseElements(item.elements)
    slides.push(slide)
  }

  console.log(slides, 'input')
  console.log(transformed(slides[1].elements), 'elements')
  return slides
}

export const slides = format()