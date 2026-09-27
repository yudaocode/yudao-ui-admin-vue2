export const EMPTY_MENU_GRID_ITEM_PROPERTY = {
  title: '标题',
  titleColor: '#333',
  subtitle: '副标题',
  subtitleColor: '#bbb',
  badge: {
    show: false,
    textColor: '#fff',
    bgColor: '#FF6000'
  }
}

const createEmptyMenuItem = () => ({
  ...EMPTY_MENU_GRID_ITEM_PROPERTY,
  badge: { ...EMPTY_MENU_GRID_ITEM_PROPERTY.badge }
})

/** 宫格导航组件 */
export const component = {
  id: 'MenuGrid',
  name: '宫格导航',
  icon: 'bi:grid-3x3-gap',
  property: {
    column: 3,
    list: [createEmptyMenuItem()],
    style: {
      bgType: 'color',
      bgColor: '#fff',
      marginBottom: 8,
      marginLeft: 8,
      marginRight: 8,
      padding: 8,
      paddingTop: 8,
      paddingRight: 8,
      paddingBottom: 8,
      paddingLeft: 8,
      borderRadius: 8,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
      borderBottomLeftRadius: 8
    }
  }
}
