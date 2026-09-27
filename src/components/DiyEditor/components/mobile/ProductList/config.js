// 定义组件
export const component = {
  id: 'ProductList',
  name: '商品栏',
  icon: 'fluent:text-column-two-24-filled',
  property: {
    layoutType: 'twoCol',
    fields: {
      name: { show: true, color: '#000' },
      price: { show: true, color: '#ff3000' }
    },
    badge: { show: false, imgUrl: '' },
    borderRadiusTop: 8,
    borderRadiusBottom: 8,
    space: 8,
    spuIds: [],
    style: {
      bgType: 'color',
      bgColor: '',
      marginLeft: 8,
      marginRight: 8,
      marginBottom: 8
    }
  }
}

