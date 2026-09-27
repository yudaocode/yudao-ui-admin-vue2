<!-- MES 产品 SIP 列表 -->
<template>
  <div>
    <el-button v-if="!isReadOnly" type="primary" plain size="small" icon="el-icon-plus" class="add-button" @click="openForm('create')">添加 SIP</el-button>
    <el-row v-loading="loading" :gutter="12">
      <el-col v-for="item in list" :key="item.id" :span="6" class="card-col"><el-card shadow="hover" :body-style="{ padding: '0' }"><el-image v-if="item.url" :src="item.url" fit="cover" class="image" :preview-src-list="[item.url]" /><div v-else class="image-empty"><i class="el-icon-picture-outline" /></div><div class="card-body"><div class="title">{{ item.title }}</div><div v-if="item.description" class="description">{{ item.description }}</div><div v-if="!isReadOnly" class="card-actions"><el-button type="text" size="small" @click="openForm('update', item)">编辑</el-button><el-button type="text" size="small" class="danger" @click="handleDelete(item.id)">删除</el-button></div></div></el-card></el-col>
      <el-col v-if="!loading && list.length === 0" :span="24"><el-empty description="暂无 SIP 数据" /></el-col>
    </el-row>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
      <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="标题" prop="title"><el-input v-model="formData.title" placeholder="请输入标题" /></el-form-item>
        <el-form-item label="展示顺序" prop="sort"><el-input-number v-model="formData.sort" :min="0" controls-position="right" class="full-width" /></el-form-item>
        <el-form-item label="内容说明"><el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入详细描述" /></el-form-item>
        <el-form-item label="所属工序"><pro-process-select v-model="formData.processId" /></el-form-item>
        <el-form-item label="图片"><upload-img v-model="formData.url" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import { MdProductSipApi } from '@/api/mes/md/item/productSip'
import UploadImg from '@/components/UploadImg/index.vue'
import ProProcessSelect from '@/views/mes/pro/process/components/ProProcessSelect.vue'

export default {
  name: 'MdProductSipForm',
  components: { UploadImg, ProProcessSelect },
  props: { itemId: { type: Number, required: true }, formType: { type: String, default: '' }},
  data() {
    return { loading: false, list: [], dialogVisible: false, dialogTitle: '', dialogFormType: '', formLoading: false, formData: this.getDefaultForm(), formRules: { title: [{ required: true, message: '标题不能为空', trigger: 'blur' }], sort: [{ required: true, message: '排列顺序不能为空', trigger: 'blur' }] }}
  },
  computed: { isReadOnly() { return this.formType === 'detail' } },
  watch: { itemId: { immediate: true, handler(value) { if (value) this.getList() } }},
  methods: {
    getDefaultForm() { return { id: undefined, itemId: this.itemId, sort: 0, processId: undefined, title: undefined, description: undefined, url: undefined, remark: undefined } },
    async getList() { this.loading = true; try { this.list = (await MdProductSipApi.getProductSipListByItemId(this.itemId)).data } finally { this.loading = false } },
    openForm(type, row) { this.dialogVisible = true; this.dialogTitle = type === 'create' ? '新增' : '修改'; this.dialogFormType = type; this.formData = row ? { id: row.id, itemId: row.itemId, sort: row.sort, processId: row.processId, title: row.title, description: row.description, url: row.url, remark: row.remark } : this.getDefaultForm(); this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()) },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.dialogFormType === 'create') await MdProductSipApi.createProductSip(this.formData); else await MdProductSipApi.updateProductSip(this.formData); this.$modal.msgSuccess(this.dialogFormType === 'create' ? '新增成功' : '修改成功'); this.dialogVisible = false; await this.getList() } finally { this.formLoading = false } }) },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该 SIP？'); await MdProductSipApi.deleteProductSip(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 用户取消时不做处理 */ } }
  }
}
</script>

<style scoped>
.add-button, .card-col { margin-bottom: 12px; }
.image, .image-empty { width: 100%; height: 160px; display: block; }
.image-empty { display: flex; align-items: center; justify-content: center; background: #f5f7fa; color: #c0c4cc; font-size: 32px; }
.card-body { padding: 10px; }
.title { overflow: hidden; font-weight: bold; text-overflow: ellipsis; white-space: nowrap; }
.description { overflow: hidden; margin-top: 4px; color: #909399; text-overflow: ellipsis; white-space: nowrap; }
.card-actions { margin-top: 8px; text-align: right; }
.danger { color: #f56c6c; }
.full-width { width: 100%; }
</style>
