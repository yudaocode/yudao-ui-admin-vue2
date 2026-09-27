<template>
  <div>
    <MusicTitle
      title="歌词"
      desc="自己编写歌词或使用Ai生成歌词，两节/8行效果最佳"
    >
      <el-input
        v-model="formData.lyric"
        type="textarea"
        :rows="6"
        resize="none"
        maxlength="1200"
        show-word-limit
        placeholder="请输入您自己的歌词"
      />
    </MusicTitle>

    <MusicTitle title="音乐风格">
      <div class="music-style-tags">
        <el-tag
          v-for="tag in tags"
          :key="tag"
          class="music-style-tags__item"
        >{{ tag }}</el-tag>
      </div>
      <el-button
        :type="showCustom ? 'primary' : 'default'"
        round
        size="small"
        class="music-style-button"
        @click="showCustom = !showCustom"
      >自定义风格</el-button>
    </MusicTitle>

    <MusicTitle
      v-show="showCustom"
      desc="描述您想要的音乐风格，Suno无法识别艺术家的名字，但可以理解流派和氛围"
      class="music-custom-style"
    >
      <el-input
        v-model="formData.style"
        type="textarea"
        :rows="4"
        resize="none"
        maxlength="256"
        show-word-limit
        placeholder="输入音乐风格(英文)"
      />
    </MusicTitle>

    <MusicTitle title="音乐/歌曲名称">
      <el-input
        v-model="formData.name"
        placeholder="请输入音乐/歌曲名称"
      />
    </MusicTitle>

    <MusicTitle title="版本">
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
  name: 'AiMusicLyric',
  components: { MusicTitle },
  data() {
    return {
      tags: ['rock', 'punk', 'jazz', 'soul', 'country', 'kidsmusic', 'pop'],
      showCustom: false,
      formData: {
        lyric: '',
        style: '',
        name: '',
        version: ''
      }
    }
  }
}
</script>

<style scoped>
.music-style-tags {
  display: flex;
  flex-wrap: wrap;
}

.music-style-tags__item {
  margin: 0 8px 8px 0;
  border-radius: 12px;
}

.music-style-button {
  margin-bottom: 6px;
}

.music-custom-style {
  margin-top: -12px;
}
</style>
