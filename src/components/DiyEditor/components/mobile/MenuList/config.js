export const EMPTY_MENU_LIST_ITEM_PROPERTY = {
  title: '标题',
  titleColor: '#333',
  subtitle: '副标题',
  subtitleColor: '#bbb'
}

/** 列表导航组件 */
export const component = {
  id: 'MenuList',
  name: '列表导航',
  icon: 'fa-solid:list',
  property: {
    list: [{ ...EMPTY_MENU_LIST_ITEM_PROPERTY }],
    style: {
      bgType: 'color',
      bgColor: '#fff',
      marginBottom: 8
    }
  }
}
