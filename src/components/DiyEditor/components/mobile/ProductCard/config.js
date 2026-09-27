// 定义组件
export const component = {
  id: 'ProductCard',
  name: '商品卡片',
  icon: 'fluent:text-column-two-left-24-filled',
  property: {
    layoutType: 'oneColBigImg',
    fields: {
      name: { show: true, color: '#000' },
      introduction: { show: true, color: '#999' },
      price: { show: true, color: '#ff3000' },
      marketPrice: { show: true, color: '#c4c4c4' },
      salesCount: { show: true, color: '#c4c4c4' },
      stock: { show: false, color: '#c4c4c4' }
    },
    badge: { show: false, imgUrl: '' },
    btnBuy: {
      type: 'text',
      text: '立即购买',
      // todo: @owen 根据主题色配置
      bgBeginColor: '#FF6000',
      bgEndColor: '#FE832A',
      imgUrl: ''
    },
    borderRadiusTop: 6,
    borderRadiusBottom: 6,
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

