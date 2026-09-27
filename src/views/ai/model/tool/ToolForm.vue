<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="560px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        label="工具名称"
        prop="name"
      ><el-input
        v-model="formData.name"
        placeholder="请输入工具名称"
      /></el-form-item>
      <el-form-item
        label="工具描述"
        prop="description"
      ><el-input
        v-model="formData.description"
        type="textarea"
        placeholder="请输入工具描述"
      /></el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      ><el-radio-group v-model="formData.status"><el-radio
        v-for="item in statusDictDatas"
        :key="item.value"
        :label="Number(item.value)"
      >{{ item.label }}</el-radio></el-radio-group></el-form-item>
    </el-form>
    <span slot="footer"><el-button
      type="primary"
      :disabled="loading"
      @click="submitForm"
    >确 定</el-button><el-button @click="visible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { ToolApi } from '@/api/ai/model/tool'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'

export default {
  name: 'AiToolForm',
  data() { return { DICT_TYPE, visible: false, loading: false, title: '', formType: 'create', statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS), formData: this.getDefaultForm(), rules: { name: [{ required: true, message: '工具名称不能为空', trigger: 'blur' }] }} },
  methods: {
    getDefaultForm() { return { id: undefined, name: undefined, description: undefined, status: CommonStatusEnum.ENABLE } },
    open(type, id) { this.visible = true; this.formType = type; this.title = type === 'create' ? '新增' : '编辑'; this.formData = this.getDefaultForm(); this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()); if (id) { this.loading = true; ToolApi.getTool(id).then(response => { this.formData = response.data }).finally(() => { this.loading = false }) } },
    submitForm() { this.$refs.form.validate(valid => { if (!valid) return; this.loading = true; const action = this.formType === 'create' ? ToolApi.createTool : ToolApi.updateTool; action(this.formData).then(() => { this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功'); this.visible = false; this.$emit('success') }).finally(() => { this.loading = false }) }) }
  }
}
</script>
