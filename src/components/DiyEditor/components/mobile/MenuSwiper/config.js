export const EMPTY_MENU_SWIPER_ITEM_PROPERTY = {
  title: '标题',
  titleColor: '#333',
  badge: {
    show: false,
    textColor: '#fff',
    bgColor: '#FF6000'
  }
}

const createEmptyMenuItem = () => ({
  ...EMPTY_MENU_SWIPER_ITEM_PROPERTY,
  badge: { ...EMPTY_MENU_SWIPER_ITEM_PROPERTY.badge }
})

/** 菜单导航组件 */
export const component = {
  id: 'MenuSwiper',
  name: '菜单导航',
  icon: 'bi:grid-3x2-gap',
  property: {
    layout: 'iconText',
    row: 1,
    column: 3,
    list: [createEmptyMenuItem()],
    style: {
      bgType: 'color',
      bgColor: '#fff',
      marginBottom: 8
    }
  }
}
