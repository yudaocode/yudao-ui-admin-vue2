/** 标题栏组件 */
export const component = {
  id: 'TitleBar',
  name: '标题栏',
  icon: 'material-symbols:line-start',
  property: {
    title: '主标题',
    description: '副标题',
    titleSize: 16,
    descriptionSize: 12,
    titleWeight: 400,
    textAlign: 'left',
    descriptionWeight: 200,
    titleColor: 'rgba(50, 50, 51, 10)',
    descriptionColor: 'rgba(150, 151, 153, 10)',
    marginLeft: 0,
    height: 40,
    more: {
      show: false,
      type: 'icon',
      text: '查看更多',
      url: ''
    },
    style: {
      bgType: 'color',
      bgColor: '#fff'
    }
  }
}
