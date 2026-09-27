// 热区的最小宽高
export const HOT_ZONE_MIN_SIZE = 100

// 控制类型
export const CONTROL_TYPE_ENUM = {
  0: 'LEFT',
  1: 'TOP',
  2: 'WIDTH',
  3: 'HEIGHT',
  LEFT: 0,
  TOP: 1,
  WIDTH: 2,
  HEIGHT: 3
}

// 热区的 8 个控制点
export const CONTROL_DOT_LIST = [
  {
    position: '左上角',
    types: [
      CONTROL_TYPE_ENUM.LEFT,
      CONTROL_TYPE_ENUM.TOP,
      CONTROL_TYPE_ENUM.WIDTH,
      CONTROL_TYPE_ENUM.HEIGHT
    ],
    style: { left: '-5px', top: '-5px', cursor: 'nwse-resize' }
  },
  {
    position: '上方中间',
    types: [CONTROL_TYPE_ENUM.TOP, CONTROL_TYPE_ENUM.HEIGHT],
    style: { left: '50%', top: '-5px', cursor: 'n-resize', transform: 'translateX(-50%)' }
  },
  {
    position: '右上角',
    types: [CONTROL_TYPE_ENUM.TOP, CONTROL_TYPE_ENUM.WIDTH, CONTROL_TYPE_ENUM.HEIGHT],
    style: { right: '-5px', top: '-5px', cursor: 'nesw-resize' }
  },
  {
    position: '右侧中间',
    types: [CONTROL_TYPE_ENUM.WIDTH],
    style: { right: '-5px', top: '50%', cursor: 'e-resize', transform: 'translateX(-50%)' }
  },
  {
    position: '右下角',
    types: [CONTROL_TYPE_ENUM.WIDTH, CONTROL_TYPE_ENUM.HEIGHT],
    style: { right: '-5px', bottom: '-5px', cursor: 'nwse-resize' }
  },
  {
    position: '下方中间',
    types: [CONTROL_TYPE_ENUM.HEIGHT],
    style: { left: '50%', bottom: '-5px', cursor: 's-resize', transform: 'translateX(-50%)' }
  },
  {
    position: '左下角',
    types: [CONTROL_TYPE_ENUM.LEFT, CONTROL_TYPE_ENUM.WIDTH, CONTROL_TYPE_ENUM.HEIGHT],
    style: { left: '-5px', bottom: '-5px', cursor: 'nesw-resize' }
  },
  {
    position: '左侧中间',
    types: [CONTROL_TYPE_ENUM.LEFT, CONTROL_TYPE_ENUM.WIDTH],
    style: { left: '-5px', top: '50%', cursor: 'w-resize', transform: 'translateX(-50%)' }
  }
]

// 编辑时放大两倍，保存时缩回移动端坐标
export const HOT_ZONE_SCALE_RATE = 2

export const zoomOut = list =>
  (list || []).map(hotZone => ({
    ...hotZone,
    left: (hotZone.left /= HOT_ZONE_SCALE_RATE),
    top: (hotZone.top /= HOT_ZONE_SCALE_RATE),
    width: (hotZone.width /= HOT_ZONE_SCALE_RATE),
    height: (hotZone.height /= HOT_ZONE_SCALE_RATE)
  }))

export const zoomIn = list =>
  (list || []).map(hotZone => ({
    ...hotZone,
    left: (hotZone.left *= HOT_ZONE_SCALE_RATE),
    top: (hotZone.top *= HOT_ZONE_SCALE_RATE),
    width: (hotZone.width *= HOT_ZONE_SCALE_RATE),
    height: (hotZone.height *= HOT_ZONE_SCALE_RATE)
  }))

/**
 * 封装热区拖拽。
 * 本场景同时需要原始坐标、尺寸和鼠标位移，因此直接监听 document 鼠标事件。
 */
export const useDraggable = (hotZone, downEvent, callback) => {
  downEvent.stopPropagation()
  const { clientX: startX, clientY: startY } = downEvent
  const { left, top, width, height } = hotZone

  document.onmousemove = event => {
    const moveWidth = event.clientX - startX
    const moveHeight = event.clientY - startY
    callback(left, top, width, height, moveWidth, moveHeight)
  }

  document.onmouseup = () => {
    document.onmousemove = null
    document.onmouseup = null
  }
}
