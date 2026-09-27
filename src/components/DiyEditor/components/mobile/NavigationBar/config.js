export const NAVIGATION_BAR_SHOW_TYPES = ['always', 'scroll']

export const isNavigationBarShowType = showType =>
  NAVIGATION_BAR_SHOW_TYPES.includes(showType)

const NAVIGATION_BAR_SCROLL_SHOW_VALUES = [false, 0, '0', 'false']

export const isNavigationBarAlwaysShow = property => {
  if (isNavigationBarShowType(property.showType)) {
    return property.showType === 'always'
  }
  return !NAVIGATION_BAR_SCROLL_SHOW_VALUES.includes(property.alwaysShow)
}

/** 顶部导航栏组件 */
export const component = {
  id: 'NavigationBar',
  name: '顶部导航栏',
  icon: 'tabler:layout-navbar',
  property: {
    bgType: 'color',
    bgColor: '#fff',
    bgImg: '',
    styleType: 'normal',
    showType: 'always',
    alwaysShow: true,
    mpCells: [
      {
        type: 'text',
        textColor: '#111111'
      }
    ],
    otherCells: [
      {
        type: 'text',
        textColor: '#111111'
      }
    ],
    _local: {
      previewMp: true,
      previewOther: false
    }
  }
}
