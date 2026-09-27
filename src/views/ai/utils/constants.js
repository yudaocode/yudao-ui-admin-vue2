// AI 可选模块枚举（对应 Vue3 views/ai/utils/constants.ts）
export const AiPlatformEnum = {
  TONG_YI: 'TongYi',
  YI_YAN: 'YiYan',
  DEEP_SEEK: 'DeepSeek',
  ZHI_PU: 'ZhiPu',
  XING_HUO: 'XingHuo',
  SiliconFlow: 'SiliconFlow',
  OPENAI: 'OpenAI',
  Ollama: 'Ollama',
  STABLE_DIFFUSION: 'StableDiffusion',
  MIDJOURNEY: 'Midjourney',
  SUNO: 'Suno'
}

export const AiModelTypeEnum = {
  CHAT: 1,
  IMAGE: 2,
  VOICE: 3,
  VIDEO: 4,
  EMBEDDING: 5,
  RERANK: 6
}

// AI 图片生成状态
export const AiImageStatusEnum = {
  IN_PROGRESS: 10,
  SUCCESS: 20,
  FAIL: 30
}

// AI 音乐生成状态
export const AiMusicStatusEnum = {
  IN_PROGRESS: 10,
  SUCCESS: 20,
  FAIL: 30
}

// AI 写作类型
export const AiWriteTypeEnum = {
  WRITING: 1,
  REPLY: 2
}

export const ImageHotWords = [
  '中国旗袍',
  '古装美女',
  '卡通头像',
  '机甲战士',
  '童话小屋',
  '中国长城'
]

export const ImageHotEnglishWords = [
  'Chinese Cheongsam',
  'Ancient Beauty',
  'Cartoon Avatar',
  'Mech Warrior',
  'Fairy Tale Cottage',
  'The Great Wall of China'
]

export const OtherPlatformEnum = [
  { key: AiPlatformEnum.TONG_YI, name: '通义万相' },
  { key: AiPlatformEnum.YI_YAN, name: '百度千帆' },
  { key: AiPlatformEnum.ZHI_PU, name: '智谱 AI' },
  { key: AiPlatformEnum.SiliconFlow, name: '硅基流动' }
]

export const StableDiffusionSamplers = [
  { key: 'DDIM', name: 'DDIM' },
  { key: 'DDPM', name: 'DDPM' },
  { key: 'K_DPMPP_2M', name: 'K_DPMPP_2M' },
  { key: 'K_DPMPP_2S_ANCESTRAL', name: 'K_DPMPP_2S_ANCESTRAL' },
  { key: 'K_DPM_2', name: 'K_DPM_2' },
  { key: 'K_DPM_2_ANCESTRAL', name: 'K_DPM_2_ANCESTRAL' },
  { key: 'K_EULER', name: 'K_EULER' },
  { key: 'K_EULER_ANCESTRAL', name: 'K_EULER_ANCESTRAL' },
  { key: 'K_HEUN', name: 'K_HEUN' },
  { key: 'K_LMS', name: 'K_LMS' }
]

export const StableDiffusionStylePresets = [
  { key: '3d-model', name: '3d-model' },
  { key: 'analog-film', name: 'analog-film' },
  { key: 'anime', name: 'anime' },
  { key: 'cinematic', name: 'cinematic' },
  { key: 'comic-book', name: 'comic-book' },
  { key: 'digital-art', name: 'digital-art' },
  { key: 'enhance', name: 'enhance' },
  { key: 'fantasy-art', name: 'fantasy-art' },
  { key: 'isometric', name: 'isometric' },
  { key: 'line-art', name: 'line-art' },
  { key: 'low-poly', name: 'low-poly' },
  { key: 'modeling-compound', name: 'modeling-compound' },
  { key: 'neon-punk', name: 'neon-punk' },
  { key: 'origami', name: 'origami' },
  { key: 'photographic', name: 'photographic' },
  { key: 'pixel-art', name: 'pixel-art' },
  { key: 'tile-texture', name: 'tile-texture' }
]

export const StableDiffusionClipGuidancePresets = [
  { key: 'NONE', name: 'NONE' },
  { key: 'FAST_BLUE', name: 'FAST_BLUE' },
  { key: 'FAST_GREEN', name: 'FAST_GREEN' },
  { key: 'SIMPLE', name: 'SIMPLE' },
  { key: 'SLOW', name: 'SLOW' },
  { key: 'SLOWER', name: 'SLOWER' },
  { key: 'SLOWEST', name: 'SLOWEST' }
]

export const Dall3Models = [
  { key: 'dall-e-3', name: 'DALL·E 3', image: require('@/assets/ai/dall2.jpg') },
  { key: 'dall-e-2', name: 'DALL·E 2', image: require('@/assets/ai/dall3.jpg') }
]

export const Dall3StyleList = [
  { key: 'vivid', name: '清晰', image: require('@/assets/ai/qingxi.jpg') },
  { key: 'natural', name: '自然', image: require('@/assets/ai/ziran.jpg') }
]

export const Dall3SizeList = [
  {
    key: '1024x1024',
    name: '1:1',
    width: '1024',
    height: '1024',
    style: 'width: 30px; height: 30px;background-color: #dcdcdc;'
  },
  {
    key: '1024x1792',
    name: '3:5',
    width: '1024',
    height: '1792',
    style: 'width: 30px; height: 50px;background-color: #dcdcdc;'
  },
  {
    key: '1792x1024',
    name: '5:3',
    width: '1792',
    height: '1024',
    style: 'width: 50px; height: 30px;background-color: #dcdcdc;'
  }
]

export const MidjourneyModels = [
  {
    key: 'midjourney',
    name: 'MJ',
    image: 'https://bigpt8.com/pc/_nuxt/mj.34a61377.png'
  },
  {
    key: 'niji',
    name: 'NIJI',
    image: 'https://bigpt8.com/pc/_nuxt/nj.ca79b143.png'
  }
]

export const MidjourneySizeList = [
  {
    key: '1:1',
    width: '1',
    height: '1',
    style: 'width: 30px; height: 30px;background-color: #dcdcdc;'
  },
  {
    key: '3:4',
    width: '3',
    height: '4',
    style: 'width: 30px; height: 40px;background-color: #dcdcdc;'
  },
  {
    key: '4:3',
    width: '4',
    height: '3',
    style: 'width: 40px; height: 30px;background-color: #dcdcdc;'
  },
  {
    key: '9:16',
    width: '9',
    height: '16',
    style: 'width: 30px; height: 50px;background-color: #dcdcdc;'
  },
  {
    key: '16:9',
    width: '16',
    height: '9',
    style: 'width: 50px; height: 30px;background-color: #dcdcdc;'
  }
]

export const MidjourneyVersions = [
  { value: '6.0', label: 'v6.0' },
  { value: '5.2', label: 'v5.2' },
  { value: '5.1', label: 'v5.1' },
  { value: '5.0', label: 'v5.0' },
  { value: '4.0', label: 'v4.0' }
]

export const NijiVersionList = [
  { value: '5', label: 'v5' }
]
