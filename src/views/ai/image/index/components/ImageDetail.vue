<template>
  <el-drawer
    :visible.sync="showDrawer"
    title="图片详细"
    custom-class="drawer-class"
    append-to-body
    @close="handleDrawerClose"
  >
    <div class="mb-5">
      <el-image
        :src="detail.picUrl"
        :preview-src-list="detail.picUrl ? [detail.picUrl] : []"
        fit="contain"
        class="w-full rounded-2"
      />
    </div>

    <el-descriptions title="基础信息" :column="1" :label-width="100" border size="small">
      <el-descriptions-item label="提交时间">
        {{ formatTime(detail.createTime, 'yyyy-MM-dd HH:mm:ss') }}
      </el-descriptions-item>
      <el-descriptions-item label="生成时间">
        {{ formatTime(detail.finishTime, 'yyyy-MM-dd HH:mm:ss') }}
      </el-descriptions-item>
      <el-descriptions-item label="模型">
        {{ detail.model }}({{ detail.height }}x{{ detail.width }})
      </el-descriptions-item>
      <el-descriptions-item label="提示词">
        <div class="break-words">{{ detail.prompt }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="图片地址">
        <div class="break-all text-xs">{{ detail.picUrl }}</div>
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions
      v-if="detail.platform === AiPlatformEnum.STABLE_DIFFUSION && hasStableDiffusionOptions"
      title="StableDiffusion 参数"
      :column="1"
      :label-width="100"
      border
      size="small"
      class="mt-5"
    >
      <el-descriptions-item v-if="detail.options && detail.options.sampler" label="采样方法">
        {{ findLabel(StableDiffusionSamplers, detail.options.sampler) }}
      </el-descriptions-item>
      <el-descriptions-item
        v-if="detail.options && detail.options.clipGuidancePreset"
        label="CLIP"
      >
        {{
          findLabel(StableDiffusionClipGuidancePresets, detail.options.clipGuidancePreset)
        }}
      </el-descriptions-item>
      <el-descriptions-item v-if="detail.options && detail.options.stylePreset" label="风格">
        {{ findLabel(StableDiffusionStylePresets, detail.options.stylePreset) }}
      </el-descriptions-item>
      <el-descriptions-item v-if="detail.options && detail.options.steps" label="迭代步数">
        {{ detail.options.steps }}
      </el-descriptions-item>
      <el-descriptions-item v-if="detail.options && detail.options.scale" label="引导系数">
        {{ detail.options.scale }}
      </el-descriptions-item>
      <el-descriptions-item v-if="detail.options && detail.options.seed" label="随机因子">
        {{ detail.options.seed }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions
      v-if="detail.platform === AiPlatformEnum.OPENAI && detail.options && detail.options.style"
      title="DALL-E 3 参数"
      :column="1"
      :label-width="100"
      border
      size="small"
      class="mt-5"
    >
      <el-descriptions-item label="风格选择">
        {{ findLabel(Dall3StyleList, detail.options.style) }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions
      v-if="detail.platform === AiPlatformEnum.MIDJOURNEY && hasMidjourneyOptions"
      title="Midjourney 参数"
      :column="1"
      :label-width="100"
      border
      size="small"
      class="mt-5"
    >
      <el-descriptions-item v-if="detail.options && detail.options.version" label="模型版本">
        {{ detail.options.version }}
      </el-descriptions-item>
      <el-descriptions-item v-if="detail.options && detail.options.referImageUrl" label="参考图">
        <el-image
          :src="detail.options.referImageUrl"
          class="max-w-[200px] rounded-2"
          fit="contain"
        />
      </el-descriptions-item>
    </el-descriptions>
  </el-drawer>
</template>

<script>
import { ImageApi } from '@/api/ai/image'
import {
  AiPlatformEnum,
  Dall3StyleList,
  StableDiffusionClipGuidancePresets,
  StableDiffusionSamplers,
  StableDiffusionStylePresets
} from '@/views/ai/utils/constants'
import { formatTime } from '@/utils'

export default {
  name: 'ImageDetail',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      AiPlatformEnum,
      Dall3StyleList,
      StableDiffusionClipGuidancePresets,
      StableDiffusionSamplers,
      StableDiffusionStylePresets,
      showDrawer: false,
      detail: {}
    }
  },
  computed: {
    hasStableDiffusionOptions() {
      const options = this.detail && this.detail.options
      return !!(
        (options && options.sampler) ||
        (options && options.clipGuidancePreset) ||
        (options && options.stylePreset) ||
        (options && options.steps) ||
        (options && options.scale) ||
        (options && options.seed)
      )
    },
    hasMidjourneyOptions() {
      const options = this.detail && this.detail.options
      return !!((options && options.version) || (options && options.referImageUrl))
    }
  },
  watch: {
    show: {
      handler(val) {
        this.showDrawer = val
        if (val && this.id) {
          this.getImageDetail(this.id)
        }
      },
      immediate: true
    },
    id: {
      handler(val) {
        if (val) {
          this.getImageDetail(val)
        }
      }
    }
  },
  methods: {
    formatTime,
    handleDrawerClose() {
      this.$emit('handleDrawerClose')
    },
    getImageDetail(id) {
      return ImageApi.getImageMy(id).then(response => {
        this.detail = response.data
      })
    },
    findLabel(list, key) {
      const item = (list || []).find(entry => entry.key === key)
      return item ? item.name : key
    }
  }
}
</script>
