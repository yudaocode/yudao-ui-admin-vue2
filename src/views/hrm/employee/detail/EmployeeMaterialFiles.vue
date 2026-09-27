<template><div v-loading="loading"><el-card
  v-for="group in HrmEmployeeFileGroups"
  :key="group.label"
  shadow="never"
  class="section-card"
><div slot="header">{{ group.label }}</div><el-row :gutter="12"><el-col
  v-for="option in group.options"
  :key="option.value"
  :span="6"
><button
  class="file-category"
  type="button"
  @click="openFileDialog(option)"
><i class="el-icon-folder-opened file-icon" /><span class="file-category__name">{{ option.label }}</span><span class="file-category__count">{{ getFileUrls(option.value).length }}</span></button></el-col></el-row></el-card><el-dialog
  :title="dialogTitle"
  :visible.sync="dialogVisible"
  width="620px"
  append-to-body
><file-upload
  v-if="canUpdate"
  v-model="dialogFileUrlsUploadValue"
  :file-type="fileTypes"
  :limit="20"
  :file-size="20"
/><div v-else><el-link
  v-for="url in dialogFileUrls"
  :key="url"
  :href="url"
  target="_blank"
  type="primary"
>{{ url }}</el-link></div><span slot="footer"><el-button @click="dialogVisible = false">取消</el-button><el-button
  v-if="canUpdate"
  type="primary"
  :loading="saving"
  @click="saveFiles"
>保存</el-button></span></el-dialog></div></template>
<script>import { checkPermi } from '@/utils/permission'; import { getEmployeeFileList, saveEmployeeFiles } from '@/api/hrm/employee/file'; import { HrmEmployeeFileGroups } from '@/views/hrm/utils/constants'; export default { name: 'HrmEmployeeMaterialFiles', props: { employeeId: { type: Number, required: true }}, data() { return { HrmEmployeeFileGroups, canUpdate: checkPermi(['hrm:employee:update']), fileTypes: ['png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx'], loading: false, saving: false, fileList: [], dialogVisible: false, dialogTitle: '', selectedType: undefined, dialogFileUrls: [] } }, computed: { dialogFileUrlsUploadValue: { get() { return this.dialogFileUrls.join(',') }, set(value) { this.dialogFileUrls = value ? value.split(',').filter(Boolean) : [] } }}, created() { this.getFileList() }, methods: { getFileUrls(type) { return this.fileList.filter(file => file.type === type).map(file => file.url) }, async getFileList() { this.loading = true; try { const response = await getEmployeeFileList(this.employeeId); this.fileList = response.data } finally { this.loading = false } }, openFileDialog(option) { this.selectedType = option.value; this.dialogTitle = option.label; this.dialogFileUrls = [...this.getFileUrls(option.value)]; this.dialogVisible = true }, async saveFiles() { if (this.selectedType === undefined) return; this.saving = true; try { await saveEmployeeFiles({ employeeId: this.employeeId, type: this.selectedType, fileUrls: this.dialogFileUrls }); this.$modal.msgSuccess('保存成功'); this.dialogVisible = false; await this.getFileList(); this.$emit('success') } finally { this.saving = false } } }}</script>
<style scoped>.section-card { margin-bottom:16px; }.file-category { display:flex; align-items:center; width:100%; min-height:72px; margin-bottom:12px; padding:14px 16px; color:#606266; text-align:left; cursor:pointer; background:#fff; border:1px solid #ebeef5; border-radius:6px; }.file-category:hover { color:#409eff; border-color:#a0cfff; }.file-icon { font-size:28px; }.file-category__name { flex:1; margin-left:12px; }.file-category__count { min-width:24px; text-align:right; }</style>
