<template>
  <div class="app-container mp-material-page">
    <doc-alert
      title="公众号素材"
      url="https://doc.iocoder.cn/mp/material/"
    />

    <el-form
      size="small"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="公众号">
        <wx-account-select @change="onAccountChanged" />
      </el-form-item>
    </el-form>

    <el-tabs
      v-model="type"
    >
      <el-tab-pane :name="UploadType.Image">
        <span slot="label"><i class="el-icon-picture" /> 图片</span>
        <upload-file
          v-hasPermi="['mp:material:upload-permanent']"
          :type="UploadType.Image"
          @uploaded="getList"
        >支持 bmp/png/jpeg/jpg/gif 格式，大小不超过 2M</upload-file>
        <image-table
          :loading="loading"
          :list="list"
          @delete="handleDelete"
        />
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNo"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-tab-pane>

      <el-tab-pane :name="UploadType.Voice">
        <span slot="label"><i class="el-icon-microphone" /> 语音</span>
        <upload-file
          v-hasPermi="['mp:material:upload-permanent']"
          :type="UploadType.Voice"
          @uploaded="getList"
        >格式支持 mp3/wma/wav/amr，文件大小不超过 2M，播放长度不超过 60s</upload-file>
        <voice-table
          :loading="loading"
          :list="list"
          @delete="handleDelete"
        />
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNo"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-tab-pane>

      <el-tab-pane :name="UploadType.Video">
        <span slot="label"><i class="el-icon-video-play" /> 视频</span>
        <el-button
          v-hasPermi="['mp:material:upload-permanent']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="showCreateVideo = true"
        >新建视频</el-button>
        <upload-video
          :value="showCreateVideo"
          @input="showCreateVideo = $event"
          @uploaded="getList"
        />
        <video-table
          :loading="loading"
          :list="list"
          @delete="handleDelete"
        />
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNo"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import WxAccountSelect from '@/views/mp/components/wx-account-select'
import ImageTable from './components/ImageTable.vue'
import VoiceTable from './components/VoiceTable.vue'
import VideoTable from './components/VideoTable.vue'
import UploadFile from './components/UploadFile.vue'
import UploadVideo from './components/UploadVideo.vue'
import { UploadType } from './components/upload'
import * as MpMaterialApi from '@/api/mp/material'

export default {
  name: 'MpMaterial',
  components: {
    ImageTable,
    UploadFile,
    UploadVideo,
    VideoTable,
    VoiceTable,
    WxAccountSelect
  },
  provide() {
    return {
      mpAccountContext: this.accountContext
    }
  },
  data() {
    return {
      UploadType,
      type: UploadType.Image,
      loading: false,
      list: [],
      total: 0,
      accountId: -1,
      accountContext: { value: -1 },
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        accountId: -1,
        permanent: true
      },
      showCreateVideo: false,
      requestSequence: 0
    }
  },
  watch: {
    type: 'onTabChange'
  },
  methods: {
    onAccountChanged(id) {
      this.accountId = Number(id)
      this.accountContext.value = this.accountId
      this.queryParams.accountId = this.accountId
      this.queryParams.pageNo = 1
      return this.getList()
    },
    async getList() {
      const requestId = ++this.requestSequence
      if (this.accountId <= 0) {
        this.list = []
        this.total = 0
        this.loading = false
        return
      }
      this.loading = true
      try {
        const response = await MpMaterialApi.getMaterialPage({
          ...this.queryParams,
          type: this.type
        })
        const data = response.data
        if (requestId === this.requestSequence) {
          this.list = data.list
          this.total = data.total
        }
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    onTabChange() {
      this.list = []
      this.total = 0
      this.queryParams.pageNo = 1
      return this.getList()
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('此操作将永久删除该文件, 是否继续?')
        await MpMaterialApi.deletePermanentMaterial(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消删除
      }
    }
  }
}
</script>
