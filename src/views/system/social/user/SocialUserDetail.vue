<template>
  <Dialog title="详情" v-model="visible" width="800px">
    <div v-if="loading" v-loading="true" class="detail-loading">正在加载...</div>
    <el-descriptions v-else :column="1" border>
      <el-descriptions-item label="社交平台">
        <dict-tag :type="DICT_TYPE.SYSTEM_SOCIAL_TYPE" :value="detailData.type" />
      </el-descriptions-item>
      <el-descriptions-item label="用户昵称">{{ detailData.nickname }}</el-descriptions-item>
      <el-descriptions-item label="用户头像">
        <el-image v-if="detailData.avatar" :src="detailData.avatar" :preview-src-list="[detailData.avatar]"
                  fit="cover" style="width: 30px; height: 30px" />
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="社交 token">{{ detailData.token }}</el-descriptions-item>
      <el-descriptions-item label="原始 Token 数据">
        <el-input :value="detailData.rawTokenInfo" type="textarea" :autosize="{ maxRows: 20 }" readonly />
      </el-descriptions-item>
      <el-descriptions-item label="原始 User 数据">
        <el-input :value="detailData.rawUserInfo" type="textarea" :autosize="{ maxRows: 20 }" readonly />
      </el-descriptions-item>
      <el-descriptions-item label="最后一次的认证 code">{{ detailData.code }}</el-descriptions-item>
      <el-descriptions-item label="最后一次的认证 state">{{ detailData.state }}</el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>

<script>
import { getSocialUser } from '@/api/system/social/user'
import Dialog from '@/components/Dialog'

export default {
  name: 'SystemSocialUserDetail',
  components: { Dialog },
  data() {
    return {
      visible: false,
      loading: false,
      detailData: {}
    }
  },
  methods: {
    async open(id) {
      this.visible = true
      this.loading = true
      try {
        const response = await getSocialUser(id)
        this.detailData = response.data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.detail-loading { min-height: 180px; padding: 70px 0; text-align: center; color: #909399; }
</style>
