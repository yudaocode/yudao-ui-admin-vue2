<template>
  <el-table
    v-loading="loading"
    :data="list"
  >
    <el-table-column
      v-if="msgType === MsgType.Message"
      label="请求消息类型"
      align="center"
      prop="requestMessageType"
    />
    <el-table-column
      v-if="msgType === MsgType.Keyword"
      label="关键词"
      align="center"
      prop="requestKeyword"
    />
    <el-table-column
      v-if="msgType === MsgType.Keyword"
      label="匹配类型"
      align="center"
      prop="requestMatch"
    >
      <template v-slot="scope">
        <dict-tag
          :type="DICT_TYPE.MP_AUTO_REPLY_REQUEST_MATCH"
          :value="scope.row.requestMatch"
        />
      </template>
    </el-table-column>
    <el-table-column
      label="回复消息类型"
      align="center"
    >
      <template v-slot="scope">
        <dict-tag
          :type="DICT_TYPE.MP_MESSAGE_TYPE"
          :value="scope.row.responseMessageType"
        />
      </template>
    </el-table-column>
    <el-table-column
      label="回复内容"
      align="center"
    >
      <template v-slot="scope">
        <div v-if="scope.row.responseMessageType === 'text'">
          {{ scope.row.responseContent }}
        </div>
        <wx-voice-player
          v-else-if="scope.row.responseMessageType === 'voice' && scope.row.responseMediaUrl"
          :url="scope.row.responseMediaUrl"
        />
        <a
          v-else-if="scope.row.responseMessageType === 'image'"
          target="_blank"
          rel="noopener noreferrer"
          :href="scope.row.responseMediaUrl"
        >
          <img
            :src="scope.row.responseMediaUrl"
            alt="自动回复图片"
            class="reply-image"
          >
        </a>
        <wx-video-player
          v-else-if="isVideo(scope.row) && scope.row.responseMediaUrl"
          :url="scope.row.responseMediaUrl"
          class="reply-video"
        />
        <wx-news
          v-else-if="scope.row.responseMessageType === 'news'"
          :articles="scope.row.responseArticles"
        />
        <wx-music
          v-else-if="scope.row.responseMessageType === 'music'"
          :title="scope.row.responseTitle"
          :description="scope.row.responseDescription"
          :thumb-media-url="scope.row.responseThumbMediaUrl"
          :music-url="scope.row.responseMusicUrl"
          :hq-music-url="scope.row.responseHqMusicUrl"
        />
      </template>
    </el-table-column>
    <el-table-column
      label="创建时间"
      align="center"
      prop="createTime"
      width="180"
    >
      <template v-slot="scope">
        <span>{{ parseTime(scope.row.createTime) }}</span>
      </template>
    </el-table-column>
    <el-table-column
      label="操作"
      align="center"
      class-name="small-padding fixed-width"
    >
      <template v-slot="scope">
        <el-button
          v-hasPermi="['mp:auto-reply:update']"
          size="mini"
          type="text"
          icon="el-icon-edit"
          @click="$emit('update', scope.row.id)"
        >修改</el-button>
        <el-button
          v-hasPermi="['mp:auto-reply:delete']"
          size="mini"
          type="text"
          icon="el-icon-delete"
          @click="$emit('delete', scope.row.id)"
        >删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import WxVideoPlayer from '@/views/mp/components/wx-video-play/main.vue'
import WxVoicePlayer from '@/views/mp/components/wx-voice-play/main.vue'
import WxMusic from '@/views/mp/components/wx-music/main.vue'
import WxNews from '@/views/mp/components/wx-news/main.vue'
import { parseTime } from '@/utils/ruoyi'
import { MsgType } from './types'

export default {
  name: 'ReplyTable',
  components: {
    WxVideoPlayer,
    WxVoicePlayer,
    WxMusic,
    WxNews
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => []
    },
    msgType: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return { MsgType }
  },
  methods: {
    parseTime,
    isVideo(row) {
      return row.responseMessageType === 'video' || row.responseMessageType === 'shortvideo'
    }
  }
}
</script>

<style scoped>
.reply-image {
  width: 100px;
}

.reply-video {
  margin-top: 10px;
}
</style>
