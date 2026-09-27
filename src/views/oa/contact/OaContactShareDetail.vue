<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="760px">
    <el-table v-loading="loading" :data="detailData.shares || []" border>
      <el-table-column label="共享接收人" min-width="160">
        <template slot-scope="shareScope">
          <div class="share-user">
            <el-avatar :src="shareScope.row.userAvatar" :size="26" />
            <span class="share-user__name">{{ shareScope.row.userName || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="接收人分类" min-width="140">
        <template slot-scope="shareScope">{{ shareScope.row.categoryName || '未分类' }}</template>
      </el-table-column>
      <el-table-column label="处理状态" width="100">
        <template slot-scope="shareScope">
          <el-tag :type="shareScope.row.handleStatus ? 'success' : 'warning'">
            {{ shareScope.row.handleStatus ? '已处理' : '待处理' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="共享人" prop="creatorName" width="120" />
      <el-table-column :formatter="dateFormatter" label="共享时间" prop="createTime" width="180" />
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import * as ContactApi from '@/api/oa/contact'
import { dateFormatter } from '@/utils/formatTime'

export default {
  name: 'OaContactShareDetail',
  components: { Dialog },
  data() {
    return {
      dialogVisible: false, // 弹窗是否显示
      dialogTitle: '共享接收人', // 弹窗标题
      loading: false, // 共享明细加载中
      detailData: {} // 联系人共享明细
    }
  },
  methods: {
    dateFormatter,
    /** 打开共享接收人明细 */
    open(id, name) {
      this.dialogVisible = true
      this.dialogTitle = name + ' · 共享接收人'
      this.detailData = {}
      this.loading = true
      return ContactApi.getContact(id).then(response => {
        this.detailData = response.data
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.share-user {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
