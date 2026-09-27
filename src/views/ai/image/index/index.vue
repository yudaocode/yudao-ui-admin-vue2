<template>
  <div class="app-container ai-image-page">
    <doc-alert title="AI 绘画创作" url="https://doc.iocoder.cn/ai/image/" />
    <div class="ai-image-page__layout">
      <div class="ai-image-page__left">
        <div class="ai-image-page__platforms">
          <el-radio-group v-model="selectPlatform" size="small">
            <el-radio-button label="common">通用</el-radio-button>
            <el-radio-button :label="AiPlatformEnum.OPENAI">DALL3 绘画</el-radio-button>
            <el-radio-button :label="AiPlatformEnum.MIDJOURNEY">MJ 绘画</el-radio-button>
            <el-radio-button :label="AiPlatformEnum.STABLE_DIFFUSION">SD 绘图</el-radio-button>
          </el-radio-group>
        </div>

        <div class="ai-image-page__form">
          <Common
            v-if="selectPlatform === 'common'"
            ref="commonRef"
            :models="models"
            @onDrawStart="handleDrawStart"
            @onDrawComplete="handleDrawComplete"
          />
          <Dall3
            v-if="selectPlatform === AiPlatformEnum.OPENAI"
            ref="dall3Ref"
            :models="models"
            @onDrawStart="handleDrawStart"
            @onDrawComplete="handleDrawComplete"
          />
          <Midjourney
            v-if="selectPlatform === AiPlatformEnum.MIDJOURNEY"
            ref="midjourneyRef"
            :models="models"
            @onDrawStart="handleDrawStart"
            @onDrawComplete="handleDrawComplete"
          />
          <StableDiffusion
            v-if="selectPlatform === AiPlatformEnum.STABLE_DIFFUSION"
            ref="stableDiffusionRef"
            :models="models"
            @onDrawStart="handleDrawStart"
            @onDrawComplete="handleDrawComplete"
          />
        </div>
      </div>

      <div class="ai-image-page__right">
        <ImageList ref="imageListRef" @onRegeneration="handleRegeneration" />
      </div>
    </div>
  </div>
</template>

<script>
import ImageList from './components/ImageList.vue'
import Common from './components/common/index.vue'
import Dall3 from './components/dall3/index.vue'
import Midjourney from './components/midjourney/index.vue'
import StableDiffusion from './components/stableDiffusion/index.vue'
import { ModelApi } from '@/api/ai/model/model'
import { AiModelTypeEnum, AiPlatformEnum } from '@/views/ai/utils/constants'

export default {
  name: 'AiImageCreate',
  components: {
    Common,
    Dall3,
    Midjourney,
    StableDiffusion,
    ImageList
  },
  data() {
    return {
      AiPlatformEnum,
      selectPlatform: 'common',
      models: [],
      platformOptions: [
        { label: '通用', value: 'common' },
        { label: 'DALL3 绘画', value: AiPlatformEnum.OPENAI },
        { label: 'MJ 绘画', value: AiPlatformEnum.MIDJOURNEY },
        { label: 'SD 绘图', value: AiPlatformEnum.STABLE_DIFFUSION }
      ]
    }
  },
  created() {
    this.loadModels()
  },
  methods: {
    handleDrawStart() {},
    handleDrawComplete() {
      if (this.$refs.imageListRef && this.$refs.imageListRef.getImageList) {
        this.$refs.imageListRef.getImageList()
      }
    },
    handleRegeneration(image) {
      this.selectPlatform = image.platform

      this.$nextTick(() => {
        if (image.platform === AiPlatformEnum.MIDJOURNEY && this.$refs.midjourneyRef) {
          this.$refs.midjourneyRef.settingValues(image)
        } else if (image.platform === AiPlatformEnum.OPENAI && this.$refs.dall3Ref) {
          this.$refs.dall3Ref.settingValues(image)
        } else if (image.platform === AiPlatformEnum.STABLE_DIFFUSION && this.$refs.stableDiffusionRef) {
          this.$refs.stableDiffusionRef.settingValues(image)
        }
      })
    },
    loadModels() {
      return ModelApi.getModelSimpleList(AiModelTypeEnum.IMAGE).then(response => {
        this.models = response.data
      })
    }
  }
}
</script>

<style scoped>
.ai-image-page {
  min-height: calc(100vh - 84px);
}

.ai-image-page__layout {
  display: flex;
  min-height: calc(100vh - 150px);
}

.ai-image-page__left {
  width: 390px;
  padding: 20px;
  box-sizing: border-box;
}

.ai-image-page__platforms {
  margin-bottom: 24px;
}

.ai-image-page__form {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.ai-image-page__right {
  flex: 1;
  background: #fff;
  min-width: 0;
}
</style>
