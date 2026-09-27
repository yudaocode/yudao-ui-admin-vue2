<template>
  <el-table
    v-loading="loading"
    :data="list"
    stripe
    border
    class="material-table"
  >
    <el-table-column
      label="编号"
      align="center"
      prop="mediaId"
    />
    <el-table-column
      label="文件名"
      align="center"
      prop="name"
    />
    <el-table-column
      label="语音"
      align="center"
    >
      <template #default="scope">
        <wx-voice-player
          v-if="scope.row.url"
          :url="scope.row.url"
        />
      </template>
    </el-table-column>
    <el-table-column
      label="上传时间"
      align="center"
      prop="createTime"
      :formatter="dateFormatter"
      width="180"
    />
    <el-table-column
      label="操作"
      align="center"
      class-name="small-padding fixed-width"
    >
      <template #default="scope">
        <el-button
          type="text"
          icon="el-icon-download"
          @click="handleDownload(scope.row.url)"
        >下载</el-button>
        <el-button
          v-hasPermi="['mp:material:delete']"
          type="text"
          icon="el-icon-delete"
          @click="$emit('delete', scope.row.id)"
        >删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import WxVoicePlayer from '@/views/mp/components/wx-voice-play'
import { dateFormatter } from '@/utils'

export default {
  name: 'VoiceTable',
  components: { WxVoicePlayer },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    dateFormatter,
    handleDownload(url) {
      window.open(url, '_blank')
    }
  }
}
</script>

<style scoped>
.material-table {
  margin-top: 10px;
}
</style>
