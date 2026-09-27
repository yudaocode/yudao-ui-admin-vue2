// 定义组件
export const component = {
  id: 'PromotionCombination',
  name: '拼团',
  icon: 'mdi:account-group',
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
      text: '去拼团',
      bgBeginColor: '#FF6000',
      bgEndColor: '#FE832A',
      imgUrl: ''
    },
    borderRadiusTop: 8,
    borderRadiusBottom: 8,
    space: 8,
    style: {
      bgType: 'color',
      bgColor: '',
      marginLeft: 8,
      marginRight: 8,
      marginBottom: 8
    }
  }
}

