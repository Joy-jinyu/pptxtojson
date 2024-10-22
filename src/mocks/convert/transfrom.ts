/* eslint-disable quotes */
import { ElementTypes } from "@/types/slides"
import mustache from 'mustache'

const randomNumber = (Math.random() * 100).toFixed(0)


const transformedText = ({
  id,
  top,
  left,
  width,
  height,
  content,
  align,
}: any) => {
  return [
    {
      id: `richtext_${randomNumber}${id}`,
      type: "richtext",
      style: {
        fontSize: "14",
        fontWeight: "normal",
        fontFamily: "SourceHanSans",
        lineHeight: "20",
        position: "absolute",
        top,
        left,
        width,
        height,
      },
      name: "富文本",
      html: {
        text: content,
        indicator: null,
      },
      align,
      groupOptionData: [],
      isWidthFill: false,
      lockColor: true,
      events: [],
      createdEvents: "",
    },
  ]
}

const transformedImg = ({ id, top, left, src, width, height }: any) => {
  return [
    {
      id: `img_${id}`,
      type: "img",
      style: {
        position: "absolute",
        top,
        left,
        width,
        height,
      },
      name: "图片",
      src,
      hueRotate: 0,
      blur: 0,
      opacity: 100,
      isWidthFill: true,
      events: [],
      createdEvents: "",
    },
  ]
}

const transformedShape = (item: any) => {
  const template = `
  <svg 
    overflow="visible" 
    width="${item.width}"
    height="${item.height}"
  >
    {{#gradient}}
      <defs>
        {{#isLinear}}
          <linearGradient 
            id="base-gradient-${item.id}"
            x1="0%" 
            y1="0%" 
            x2="100%" 
            y2="0%" 
            gradientTransform="{{rotate(${item.rotate},0.5,0.5}}"
            >
            {{#gradient.colors}}
              <stop offset="{{pos}}" stop-color="{{color}}" />
            {{/gradient.colors}}
          </linearGradient>
        {{/isLinear}}
        {{^isLinear}}
          <radialGradient id="base-gradient-${item.id}">
            {{#gradient.colors}}
            <stop offset="{{pos}}" stop-color="{{color}}" />
            {{/gradient.colors}}
          </radialGradient>
        {{/isLinear}}
      </defs>
    {{/gradient}}
    <g 
      transform="scale(${item.width / item.viewBox[0]}, ${item.height / item.viewBox[1]}) translate(0,0) matrix(1,0,0,1,0,0)"
    >
      <path 
        vector-effect="non-scaling-stroke" 
        stroke-linecap="butt" 
        stroke-miterlimit="8"
        d="${item.path}" 
        fill="${item.gradient ? `url(#base-gradient-${item.id})` : item.fill}"
        stroke="{{outlineColor}}"
        stroke-width="{{outlineWidth}}" 
        stroke-dasharray="{{strokeDashArray}}" 
      ></path>
    </g>
  </svg>
  `

  const {
    id,
    top,
    left,
    width,
    height,
    fill,
    text,
    gradient,
    outline
  }: any = item

  const outlineColor = outline?.color || '#d14424'
  const outlineWidth = outline?.width || 0

  const strokeDashArray = () => {
    if (outline?.style !== 'dashed') return '0 0'
    const size = outlineWidth
    return size <= 6 ? `${size * 4.5} ${size * 2}` : `${size * 4} ${size * 1.5}`
  }

  const shapeDsl = {
    id: `svg_${randomNumber}${id}`,
    type: "svg",
    svgHtmlStr: mustache.render(template, {
      ...item,
      isLinear: gradient?.type !== 'linear',
      outlineColor,
      outlineWidth,
      strokeDashArray: strokeDashArray(),
    }),
    fill,
    size: 60,
    src: "",
    name: "形状",
    style: {
      position: "absolute",
      top,
      left,
      width,
      height,
    },
  }
  const results: any[] = [{ ...shapeDsl }]

  if (text.content) {
    const textDsl = transformedText({
      id,
      top,
      left,
      width,
      height,
      content: text.content,
      align: text.align,
    })
    results.push(textDsl[0])
  }

  return results
}

const transformedLine = () => {
  return []
}

const transformedChart = () => {
  return []
}

const transformedTable = ({
  id,
  width,
  colWidths,
  data,
  theme,
  top,
  left,
  outline,
}: any) => {
  const [header, ...rows] = data
  const rowProps = header.map((k: any) => k.id)

  return [
    {
      id: `table_${randomNumber}${id}`,
      type: "table",
      style: {
        width,
        fontSize: "14",
        fontWeight: "normal",
        fontFamily: "SourceHanSans",
        lineHeight: "20",
        position: "absolute",
        top,
        left,
      },
      name: "表格",
      dataSourceModel: {
        tagList: header.map((k: any, index: number) => {
          const colWidth = colWidths[index]
          return {
            label: k.text,
            prop: k.id,
            colSpan: k.colspan,
            rowSpan: k.rowspan,
            type: "text",
            height: "",
            showRadius: !1,
            width: colWidth ? `${colWidth * 100}%` : "",
          }
        }),
        list: rows.map((row: any[]) => {
          const rowData: any = {}
          row.forEach((item, index: number) => {
            const { text } = item
            const propsName = rowProps[index]
            rowData[propsName] = text
          })
          return rowData
        }),
      },
      border: !!outline,
      borderColor: outline?.color || "",
      stripe: false,
      stripeColor: "",
      headerBgColor: "",
      headerFontColor: "",
      headerFontSize: "",
      headerFontWeight: "bold",
      index: false,
      headerShowBorder: true,
      fixedCol: "",
      headerHeight: 32,
      rowHeight: 32,
      rowBgColor: "",
      rowFontColor: "",
      rowFontSize: "",
      rowBottomBorderColor: "",
      isRedGreen: false,
    },
  ]
}

const transformedLatex = () => { 
  return []
}

const transformedAudio = ({ id, top, left, src, width, height }: any) => {
  return {
    id: `audio_${id}`,
    type: "audio",
    style: {
      position: "absolute",
      top,
      left,
      width,
      height
    },
    name: "音频",
    dataSourceModel: {
      mode: "upload",
      upload: {
        src: src,
        fileName: "音频.wav",
      },
      input: {
        src: "",
      },
      compose: {
        taskId: "",
        src: "",
        text: "",
        voice: [],
        speechRate: 0,
        pitchRate: 0,
        volume: 50,
      },
    },
    opacity: 100,
    mode: "bar",
    isWidthFill: true,
    autoPlay: false,
    loop: false,
    btnColor: "",
    bgColor: "",
    borderRadiusLT: 0,
    borderRadiusRT: 0,
    borderRadiusRB: 0,
    borderRadiusLB: 0,
    barBgColor: "",
    barColor: "",
    playBtnColor: "",
    timeColor: "",
    selectedData: "",
    events: "",
    createdEvents: "",
  }
}

const transformTypeMap = {
  [ElementTypes.TEXT]: transformedText,
  [ElementTypes.IMAGE]: transformedImg,
  [ElementTypes.SHAPE]: transformedShape,
  [ElementTypes.LINE]: transformedLine,
  [ElementTypes.CHART]: transformedChart,
  [ElementTypes.TABLE]: transformedTable,
  [ElementTypes.LATEX]: transformedLatex,
  [ElementTypes.AUDIO]: transformedAudio,
}

const page = {
  "id": "3823013271326766",
  "type": "page",
  "name": "页面1",
  "title": "页面1",
  "layout": "relative",
  "style": {
      "height": 768,
      "width": 1024,
      "position": "relative",
      "layout": "relative",
      "minHeight": 768,
      "left": 0,
      "top": 0,
      "backgroundColor": "#fff",
      "fontSize": "14",
      "fontWeight": "normal",
      "lineHeight": "20"
  },
  "items": [],
  "contentType": "PPT",
  "h5Type": null
}

export const transformed = (items: any[]) => {
  const elements = items.reduce((elements: any[], current: any) => {
    const transform = transformTypeMap[current.type as keyof typeof transformTypeMap]
    return elements.concat(transform(current))
  }, [])
  page.items = elements
  return JSON.stringify(page)
}
