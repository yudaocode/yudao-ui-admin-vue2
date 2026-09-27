<template>
  <div class="app-container">
    <el-card shadow="never">
      <div
        slot="header"
        class="card-header"
      >
        <span>原因列表</span>
        <div>
          <el-button
            v-hasPermi="['hrm:recruit:config:update']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="addReason"
          >新增</el-button>
          <el-button
            v-hasPermi="['hrm:recruit:config:update']"
            :loading="saving"
            type="primary"
            icon="el-icon-check"
            @click="saveReasonList"
          >保存</el-button>
        </div>
      </div>
      <el-table
        v-loading="loading"
        :data="reasonList"
        border
      >
        <el-table-column
          label="序号"
          type="index"
          align="center"
          width="80"
        />
        <el-table-column
          label="淘汰原因"
          min-width="320"
        >
          <template slot-scope="scope">
            <el-input
              v-model="reasonList[scope.$index]"
              maxlength="255"
              placeholder="请输入淘汰原因"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['hrm:recruit:config:update']"
              type="text"
              class="danger-text"
              @click="removeReason(scope.$index)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getRecruitEliminateReasonList, saveRecruitEliminateReason } from '@/api/hrm/recruit/config'

export default {
  name: 'HrmRecruitEliminateReason',
  data() {
    return { loading: true, saving: false, reasonList: [] }
  },
  created() { this.getReasonList() },
  methods: {
    async getReasonList() {
      this.loading = true
      try {
        const response = await getRecruitEliminateReasonList()
        this.reasonList = response.data
      } finally {
        this.loading = false
      }
    },
    addReason() {
      if (this.reasonList.some(reason => !reason.trim())) {
        this.$modal.msgWarning('请先填写新增的淘汰原因')
        return
      }
      this.reasonList.push('')
    },
    removeReason(index) { this.reasonList.splice(index, 1) },
    async saveReasonList() {
      const reasons = this.reasonList.map(reason => reason.trim())
      if (reasons.some(reason => !reason)) {
        this.$modal.msgWarning('淘汰原因不能为空')
        return
      }
      if (new Set(reasons).size !== reasons.length) {
        this.$modal.msgWarning('淘汰原因不能重复')
        return
      }
      this.saving = true
      try {
        await saveRecruitEliminateReason(reasons)
        this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        await this.getReasonList()
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
.danger-text { color: #f56c6c; }
</style>
