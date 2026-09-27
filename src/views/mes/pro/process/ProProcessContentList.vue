<!-- MES 生产工序内容（操作步骤）列表 -->
<template>
  <div>
    <el-row class="mb10"><el-button
      type="primary"
      plain
      icon="el-icon-plus"
      @click="openForm('create')"
    >添加步骤</el-button></el-row>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      show-overflow-tooltip
    >
      <el-table-column
        label="序号"
        align="center"
        prop="sort"
        width="80"
      /><el-table-column
        label="步骤说明"
        align="center"
        prop="content"
        min-width="200"
      />
      <el-table-column
        label="辅助设备"
        align="center"
        prop="device"
        width="150"
      /><el-table-column
        label="辅助材料"
        align="center"
        prop="material"
        width="150"
      />
      <el-table-column
        label="材料文档"
        align="center"
        prop="docUrl"
        width="150"
      /><el-table-column
        label="备注"
        align="center"
        prop="remark"
        min-width="120"
      />
      <el-table-column
        label="操作"
        align="center"
        width="130"
        fixed="right"
      ><template #default="scope"><el-button
        type="text"
        @click="openForm('update', scope.row)"
      >编辑</el-button><el-button
        type="text"
        class="danger-text"
        @click="handleDelete(scope.row.id)"
      >删除</el-button></template></el-table-column>
    </el-table>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      append-to-body
    >
      <el-form
        ref="form"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item
          label="序号"
          prop="sort"
        ><el-input-number
          v-model="formData.sort"
          :min="1"
          :max="999"
          controls-position="right"
          class="full-width"
        /></el-form-item>
        <el-form-item
          label="步骤说明"
          prop="content"
        ><el-input
          v-model="formData.content"
          type="textarea"
          :rows="3"
          placeholder="请输入步骤说明"
        /></el-form-item>
        <el-form-item
          label="辅助设备"
          prop="device"
        ><el-input
          v-model="formData.device"
          placeholder="请输入辅助设备"
        /></el-form-item>
        <el-form-item
          label="辅助材料"
          prop="material"
        ><el-input
          v-model="formData.material"
          placeholder="请输入辅助材料"
        /></el-form-item>
        <el-form-item
          label="材料文档 URL"
          prop="docUrl"
        ><el-input
          v-model="formData.docUrl"
          placeholder="请输入材料文档 URL"
        /></el-form-item>
        <el-form-item
          label="备注"
          prop="remark"
        ><el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
        /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="dialogVisible = false">取 消</el-button><el-button
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import { ProProcessContentApi } from '@/api/mes/pro/process/content'

const emptyForm = processId => ({ id: undefined, processId, sort: 1, content: '', device: '', material: '', docUrl: '', remark: '' })

export default {
  name: 'ProProcessContentList',
  props: { processId: { type: Number, required: true }},
  data() {
    return { loading: false, list: [], dialogVisible: false, dialogTitle: '', formLoading: false, formType: '', formData: emptyForm(this.processId), formRules: { sort: [{ required: true, message: '序号不能为空', trigger: 'blur' }] }}
  },
  watch: { processId: { immediate: true, handler(value) { if (value) this.getList() } }},
  methods: {
    async getList() {
      this.loading = true
      try { const response = await ProProcessContentApi.getProcessContentListByProcessId(this.processId); this.list = response.data } finally { this.loading = false }
    },
    openForm(type, row) {
      const maxSort = this.list.reduce((max, item) => Math.max(max, item.sort || 0), 0)
      this.dialogVisible = true; this.dialogTitle = type === 'create' ? '添加操作步骤' : '编辑操作步骤'; this.formType = type
      this.formData = { ...emptyForm(this.processId), sort: maxSort + 1 }
      this.$nextTick(() => { if (this.$refs.form) this.$refs.form.resetFields(); if (row) this.formData = { ...row } })
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.formLoading = true
        try {
          if (this.formType === 'create') { await ProProcessContentApi.createProcessContent({ ...this.formData }); this.$modal.msgSuccess('新增成功') } else { await ProProcessContentApi.updateProcessContent({ ...this.formData }); this.$modal.msgSuccess('修改成功') }
          this.dialogVisible = false; await this.getList()
        } finally { this.formLoading = false }
      })
    },
    async handleDelete(id) {
      try { await this.$modal.confirm('是否确认删除该操作步骤？'); await ProProcessContentApi.deleteProcessContent(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { if (error !== 'cancel') throw error }
    }
  }
}
</script>

<style scoped>.mb10 { margin-bottom: 10px; }.full-width { width: 100%; }.danger-text { color: #f56c6c; }</style>
