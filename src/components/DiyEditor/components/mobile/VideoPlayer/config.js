/** 视频播放组件 */
export const component = {
  id: 'VideoPlayer',
  name: '视频播放',
  icon: 'ep:video-play',
  property: {
    videoUrl: '',
    posterUrl: '',
    autoplay: false,
    style: {
      bgType: 'color',
      bgColor: '#fff',
      marginBottom: 8,
      height: 300
    }
  }
}
