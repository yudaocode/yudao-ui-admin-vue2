<template>
  <div>
    <el-table v-loading="loading" :data="list">
      <el-table-column
        label="发送时间"
        align="center"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column label="消息类型" align="center" prop="type" width="80" />
      <el-table-column label="发送方" align="center" prop="sendFrom" width="80">
        <template v-slot="scope">
          <el-tag v-if="scope.row.sendFrom === 1" type="success">粉丝</el-tag>
          <el-tag v-else type="info">公众号</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="用户标识" align="center" prop="openid" width="300" />
      <el-table-column label="内容" prop="content">
        <template v-slot="scope">
          <!-- 【事件】区域 -->
          <div v-if="scope.row.type === MsgType.Event && scope.row.event === 'subscribe'">
            <el-tag type="success" size="mini">关注</el-tag>
          </div>
          <div v-else-if="scope.row.type === MsgType.Event && scope.row.event === 'unsubscribe'">
            <el-tag type="danger" size="mini">取消关注</el-tag>
          </div>
          <div v-else-if="scope.row.type === MsgType.Event && scope.row.event === 'CLICK'">
            <el-tag size="mini">点击菜单</el-tag>
            【{{ scope.row.eventKey }}】
          </div>
          <div v-else-if="scope.row.type === MsgType.Event && scope.row.event === 'VIEW'">
            <el-tag size="mini">点击菜单链接</el-tag>
            【{{ scope.row.eventKey }}】
          </div>
          <div v-else-if="scope.row.type === MsgType.Event && scope.row.event === 'scancode_waitmsg'">
            <el-tag size="mini">扫码结果</el-tag>
            【{{ scope.row.eventKey }}】
          </div>
          <div v-else-if="scope.row.type === MsgType.Event && scope.row.event === 'scancode_push'">
            <el-tag size="mini">扫码结果</el-tag>
            【{{ scope.row.eventKey }}】
          </div>
          <div v-else-if="scope.row.type === MsgType.Event && scope.row.event === 'pic_sysphoto'">
            <el-tag size="mini">系统拍照发图</el-tag>
          </div>
          <div v-else-if="scope.row.type === MsgType.Event && scope.row.event === 'pic_photo_or_album'">
            <el-tag size="mini">拍照或者相册</el-tag>
          </div>
          <div v-else-if="scope.row.type === MsgType.Event && scope.row.event === 'pic_weixin'">
            <el-tag size="mini">微信相册</el-tag>
          </div>
          <div v-else-if="scope.row.type === MsgType.Event && scope.row.event === 'location_select'">
            <el-tag size="mini">选择地理位置</el-tag>
          </div>
          <div v-else-if="scope.row.type === MsgType.Event && scope.row.event === 'SCAN'">
            <el-tag type="success" size="mini">扫码</el-tag>
          </div>
          <div v-else-if="scope.row.type === MsgType.Event">
            <el-tag type="danger" size="mini">未知事件类型</el-tag>
          </div>
          <!-- 【消息】区域 -->
          <div v-else-if="scope.row.type === MsgType.Text">{{ scope.row.content }}</div>
          <div v-else-if="scope.row.type === MsgType.Voice">
            <wx-voice-player :url="scope.row.mediaUrl" :content="scope.row.recognition" />
          </div>
          <div v-else-if="scope.row.type === MsgType.Image">
            <a target="_blank" :href="scope.row.mediaUrl">
              <img :src="scope.row.mediaUrl" style="width: 100px" alt="消息图片" />
            </a>
          </div>
          <div v-else-if="scope.row.type === MsgType.Video || scope.row.type === 'shortvideo'">
            <wx-video-player :url="scope.row.mediaUrl" style="margin-top: 10px" />
          </div>
          <div v-else-if="scope.row.type === MsgType.Link">
            <el-tag size="mini">链接</el-tag>
            ：
            <a :href="scope.row.url" target="_blank">{{ scope.row.title }}</a>
          </div>
          <div v-else-if="scope.row.type === MsgType.Location">
            <wx-location
              :label="scope.row.label"
              :location-y="scope.row.locationY"
              :location-x="scope.row.locationX"
            />
          </div>
          <div v-else-if="scope.row.type === MsgType.Music">
            <wx-music
              :title="scope.row.title"
              :description="scope.row.description"
              :thumb-media-url="scope.row.thumbMediaUrl"
              :music-url="scope.row.musicUrl"
              :hq-music-url="scope.row.hqMusicUrl"
            />
          </div>
          <div v-else-if="scope.row.type === MsgType.News">
            <wx-news :articles="scope.row.articles" />
          </div>
          <div v-else>
            <el-tag type="danger" size="mini">未知消息类型</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button
            size="mini"
            type="text"
            @click="$emit('send', scope.row.userId)"
            v-hasPermi="['mp:message:send']"
          >消息</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import WxVideoPlayer from '@/views/mp/components/wx-video-play/main.vue'
import WxVoicePlayer from '@/views/mp/components/wx-voice-play/main.vue'
import WxLocation from '@/views/mp/components/wx-location/main.vue'
import WxMusic from '@/views/mp/components/wx-music/main.vue'
import WxNews from '@/views/mp/components/wx-news/main.vue'
import { dateFormatter } from '@/utils'

// Keep message type values in one place, matching the Vue3 wx-msg contract.
const MsgType = Object.freeze({
  Event: 'event',
  Text: 'text',
  Voice: 'voice',
  Image: 'image',
  Video: 'video',
  Link: 'link',
  Location: 'location',
  Music: 'music',
  News: 'news'
})

export default {
  name: 'MpMessageTable',
  components: {
    WxVideoPlayer,
    WxVoicePlayer,
    WxLocation,
    WxMusic,
    WxNews
  },
  props: {
    list: {
      type: Array,
      required: true,
      default: () => []
    },
    loading: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data() {
    return { MsgType }
  },
  methods: {
    dateFormatter
  }
}
</script>
