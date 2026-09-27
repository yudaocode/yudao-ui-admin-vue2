/** 轮播图组件 */
export const component = {
  id: 'Carousel',
  name: '轮播图',
  icon: 'system-uicons:carousel',
  property: {
    type: 'default',
    indicator: 'dot',
    autoplay: false,
    interval: 3,
    height: 174,
    items: [
      { type: 'img', imgUrl: 'https://static.iocoder.cn/mall/banner-01.jpg', videoUrl: '' },
      { type: 'img', imgUrl: 'https://static.iocoder.cn/mall/banner-02.jpg', videoUrl: '' }
    ],
    style: {
      bgType: 'color',
      bgColor: '#fff',
      marginBottom: 8
    }
  }
}
