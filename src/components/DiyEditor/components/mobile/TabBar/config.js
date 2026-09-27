/** 底部导航组件 */
export const component = {
  id: 'TabBar',
  name: '底部导航',
  icon: 'fluent:table-bottom-row-16-filled',
  property: {
    theme: 'red',
    style: {
      bgType: 'color',
      bgColor: '#fff',
      color: '#282828',
      activeColor: '#fc4141'
    },
    items: [
      {
        text: '首页',
        url: '/pages/index/index',
        iconUrl: 'http://mall.yudao.iocoder.cn/static/images/1-001.png',
        activeIconUrl: 'http://mall.yudao.iocoder.cn/static/images/1-002.png'
      },
      {
        text: '分类',
        url: '/pages/index/category?id=3',
        iconUrl: 'http://mall.yudao.iocoder.cn/static/images/2-001.png',
        activeIconUrl: 'http://mall.yudao.iocoder.cn/static/images/2-002.png'
      },
      {
        text: '购物车',
        url: '/pages/index/cart',
        iconUrl: 'http://mall.yudao.iocoder.cn/static/images/3-001.png',
        activeIconUrl: 'http://mall.yudao.iocoder.cn/static/images/3-002.png'
      },
      {
        text: '我的',
        url: '/pages/index/user',
        iconUrl: 'http://mall.yudao.iocoder.cn/static/images/4-001.png',
        activeIconUrl: 'http://mall.yudao.iocoder.cn/static/images/4-002.png'
      }
    ]
  }
}

export const THEME_LIST = [
  { id: 'red', name: '中国红', icon: 'icon-park-twotone:theme', color: '#d10019' },
  { id: 'orange', name: '桔橙', icon: 'icon-park-twotone:theme', color: '#f37b1d' },
  { id: 'gold', name: '明黄', icon: 'icon-park-twotone:theme', color: '#fbbd08' },
  { id: 'green', name: '橄榄绿', icon: 'icon-park-twotone:theme', color: '#8dc63f' },
  { id: 'cyan', name: '天青', icon: 'icon-park-twotone:theme', color: '#1cbbb4' },
  { id: 'blue', name: '海蓝', icon: 'icon-park-twotone:theme', color: '#0081ff' },
  { id: 'purple', name: '姹紫', icon: 'icon-park-twotone:theme', color: '#6739b6' },
  { id: 'brightRed', name: '嫣红', icon: 'icon-park-twotone:theme', color: '#e54d42' },
  { id: 'forestGreen', name: '森绿', icon: 'icon-park-twotone:theme', color: '#39b54a' },
  { id: 'mauve', name: '木槿', icon: 'icon-park-twotone:theme', color: '#9c26b0' },
  { id: 'pink', name: '桃粉', icon: 'icon-park-twotone:theme', color: '#e03997' },
  { id: 'brown', name: '棕褐', icon: 'icon-park-twotone:theme', color: '#a5673f' },
  { id: 'grey', name: '玄灰', icon: 'icon-park-twotone:theme', color: '#8799a3' },
  { id: 'gray', name: '草灰', icon: 'icon-park-twotone:theme', color: '#aaaaaa' },
  { id: 'black', name: '墨黑', icon: 'icon-park-twotone:theme', color: '#333333' }
]
