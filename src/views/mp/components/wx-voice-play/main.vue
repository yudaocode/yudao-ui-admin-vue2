<!--
  - Copyright (C) 2018-2019
  - All rights reserved, Designed By www.joolun.com
  【微信消息 - 语音】
   芋道源码：
  ① bug 修复：
    1）joolun 的做法：使用 mediaId 从微信公众号，下载对应的 mp4 素材，从而播放内容；
      存在的问题：mediaId 有效期是 3 天，超过时间后无法播放
    2）重构后的做法：后端接收到微信公众号的视频消息后，将视频消息的 media_id 的文件内容保存到文件服务器中，这样前端可以直接使用 URL 播放。
  ② 代码优化：将 props 中的 objData 调成为 data 中对应的属性，并补充相关注释
-->
<template>
  <div
    class="wx-voice-div"
    @click="playVoice"
  >
    <i :class="playing !== true ? 'el-icon-video-play': 'el-icon-video-pause'">
      <span
        v-if="duration"
        class="amr-duration"
      >{{ duration }} 秒</span>
    </i>
    <div v-if="content">
      <el-tag
        type="success"
        size="mini"
      >语音识别</el-tag>
      {{ content }}
    </div>
  </div>
</template>

<script>
// 因为微信语音是 amr 格式，所以需要用到 amr 解码器：https://www.npmjs.com/package/benz-amr-recorder
const BenzAMRRecorder = require('benz-amr-recorder')

export default {
  name: 'WxVoicePlayer',
  props: {
    url: { // 语音地址，例如说：https://www.iocoder.cn/xxx.amr
      type: String,
      required: true
    },
    content: { // 语音文本
      type: String,
      required: false,
      default: ''
    }
  },
  data() {
    return {
      amr: undefined, // BenzAMRRecorder 对象
      initializing: false,
      playing: false, // 是否在播放中
      duration: undefined // 播放时长
    }
  },
  watch: {
    url() {
      this.resetRecorder()
    }
  },
  beforeDestroy() {
    this.resetRecorder()
  },
  methods: {
    playVoice() {
      // 情况一：未初始化，则创建 BenzAMRRecorder
      if (this.amr === undefined) {
        this.amrInit()
        return
      }
      if (this.initializing) return

      if (this.amr.isPlaying()) {
        this.amrStop()
      } else {
        this.amrPlay()
      }
    },
    amrInit() {
      const amr = new BenzAMRRecorder()
      const url = this.url
      this.amr = amr
      this.initializing = true
      amr.initWithUrl(url).then(() => {
        if (this.amr !== amr || this.url !== url) return
        this.initializing = false
        this.amrPlay()
        this.duration = amr.getDuration()
      }).catch(() => {
        if (this.amr !== amr) return
        this.initializing = false
        this.playing = false
        this.amr = undefined
        this.$message.error('语音加载失败')
      })
      // 监听暂停
      amr.onEnded(() => {
        if (this.amr === amr) this.playing = false
      })
    },
    amrPlay() {
      this.playing = true
      this.amr.play()
    },
    amrStop() {
      this.playing = false
      this.amr.stop()
    },
    resetRecorder() {
      if (this.amr && typeof this.amr.isPlaying === 'function' && this.amr.isPlaying()) {
        this.amr.stop()
      }
      this.amr = undefined
      this.initializing = false
      this.playing = false
      this.duration = undefined
    }
  }
}
</script>

<style lang="scss" scoped>
  .wx-voice-div {
    display: flex;
    width: 120px;
    min-height: 50px;
    padding: 5px;
    background-color: #eaeaea;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
  }
  .amr-duration {
    font-size: 11px;
    margin-left: 5px;
  }
</style>
