<template>
  <div>
    <MusicTitle
      title="音乐/歌词说明"
      desc="描述您想要的音乐风格和主题，使用流派和氛围而不是特定的艺术家和歌曲"
    >
      <el-input
        v-model="formData.desc"
        type="textarea"
        :rows="6"
        resize="none"
        maxlength="1200"
        show-word-limit
        placeholder="一首关于糟糕分手的欢快歌曲"
      />
    </MusicTitle>

    <MusicTitle
      title="纯音乐"
      desc="创建一首没有歌词的歌曲"
    >
      <template slot="extra">
        <el-switch v-model="formData.pure" />
      </template>
    </MusicTitle>

    <MusicTitle
      title="版本"
      desc="描述您想要的音乐风格和主题，使用流派和氛围而不是特定的艺术家和歌曲"
    >
      <el-select
        v-model="formData.version"
        placeholder="请选择"
      >
        <el-option
          label="V3"
          value="3"
        />
        <el-option
          label="V2"
          value="2"
        />
      </el-select>
    </MusicTitle>
  </div>
</template>

<script>
import MusicTitle from '../title/index.vue'

export default {
  name: 'AiMusicDesc',
  components: { MusicTitle },
  data() {
    return {
      formData: {
        desc: '',
        pure: false,
        version: '3'
      }
    }
  }
}
</script>
