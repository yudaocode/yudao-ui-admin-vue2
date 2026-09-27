<template>
  <el-dialog title="凭证摘要库" :visible.sync="dialogVisible" append-to-body width="620px">
    <el-form ref="form" :model="formData" :rules="formRules" label-position="top">
      <el-form-item label="摘要内容" prop="content">
        <el-input
          v-model="formData.content"
          :rows="3"
          maxlength="500"
          placeholder="请输入摘要内容"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
    </el-form>
    <div class="form-actions">
      <el-button
        v-if="!formData.id && isWritable"
        v-hasPermi="['fms:config:digest:create']"
        :loading="formLoading"
        type="primary"
        @click="submitForm"
      >新增</el-button>
      <el-button
        v-else-if="isWritable"
        v-hasPermi="['fms:config:digest:update']"
        :loading="formLoading"
        type="primary"
        @click="submitForm"
      >保存</el-button>
      <el-button @click="resetForm">取消</el-button>
    </div>
    <el-table
      v-loading="loading"
      :data="list"
      border
      highlight-current-row
      stripe
      @row-dblclick="selectDigest"
    >
      <el-table-column label="摘要内容" min-width="360" prop="content" show-overflow-tooltip />
      <el-table-column align="center" label="操作" width="160">
        <template slot-scope="scope">
          <el-button
            v-if="isWritable"
            v-hasPermi="['fms:config:digest:update']"
            type="text"
            @click="editDigest(scope.row)"
          >编辑</el-button>
          <el-button
            v-if="isWritable"
            v-hasPermi="['fms:config:digest:delete']"
            class="danger-text"
            type="text"
            @click="handleDelete(scope.row)"
          >删除</el-button>
          <el-button type="text" @click="selectDigest(scope.row)">套用</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="library-tip">双击摘要可直接套用到当前分录</div>
  </el-dialog>
</template>

<script>
import { FmsDigestApi } from '@/api/fms/config/digest'
import { FMS_ACCOUNT_SET_CACHE_KEY } from '@/views/fms/utils/context'

export default {
  name: 'FmsDigestLibrary',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      formLoading: false,
      accountSetId: 0,
      isWritable: false,
      list: [],
      formData: this.defaultForm(),
      formRules: {
        content: [{ required: true, message: '摘要内容不能为空', trigger: 'blur' }]
      },
      requestSequence: 0
    }
  },
  methods: {
    defaultForm(accountSetId) {
      return { id: undefined, accountSetId: Number(accountSetId) || 0, content: '' }
    },
    open(accountSetId) {
      this.accountSetId = Number(accountSetId) || 0
      if (!this.accountSetId) return
      this.isWritable = this.readWritableStatus()
      this.resetForm()
      this.dialogVisible = true
      this.getList()
    },
    readWritableStatus() {
      try {
        const current = JSON.parse(localStorage.getItem(FMS_ACCOUNT_SET_CACHE_KEY) || 'null')
        return !!(current && Number(current.id) === this.accountSetId && [1, 3].includes(Number(current.level)))
      } catch (e) {
        return false
      }
    },
    getList() {
      const accountSetId = this.accountSetId
      const sequence = ++this.requestSequence
      if (!accountSetId) return
      this.loading = true
      return FmsDigestApi.getDigestSimpleList(accountSetId).then(response => {
        if (sequence !== this.requestSequence || accountSetId !== this.accountSetId) return
        const rows = response.data
        this.list = rows
      }).finally(() => {
        if (sequence === this.requestSequence) this.loading = false
      })
    },
    editDigest(row) {
      this.formData = Object.assign(this.defaultForm(this.accountSetId), row || {})
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      if (!this.accountSetId || !this.isWritable) return
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formData.id
          ? FmsDigestApi.updateDigest(this.formData)
          : FmsDigestApi.createDigest(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formData.id ? '修改成功' : '新增成功')
          this.resetForm()
          this.getList()
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    handleDelete(row) {
      if (!this.accountSetId || !this.isWritable) return
      this.$modal.confirm('是否确认删除常用摘要“' + row.content + '”？').then(() => {
        return FmsDigestApi.deleteDigest(this.accountSetId, row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        if (this.formData.id === row.id) this.resetForm()
        this.getList()
      }).catch(() => {})
    },
    selectDigest(row) {
      this.$emit('select', row.content)
      this.dialogVisible = false
    },
    resetForm() {
      this.formData = this.defaultForm(this.accountSetId)
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>

<style scoped>
.form-actions { display: flex; justify-content: flex-end; margin-bottom: 16px; }
.library-tip { margin-top: 10px; color: #909399; font-size: 12px; }
.danger-text { color: #f56c6c; }
</style>
