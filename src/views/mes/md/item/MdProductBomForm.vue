<!-- MES 产品 BOM 列表 -->
<template>
  <div>
    <el-button v-if="!isReadOnly" type="primary" plain size="small" icon="el-icon-plus" class="add-button" @click="handleAdd">添加 BOM 物料</el-button>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true" border>
      <el-table-column label="物料编码" align="center" prop="bomItemCode" />
      <el-table-column label="物料名称" align="center" prop="bomItemName" />
      <el-table-column label="规格型号" align="center" prop="bomItemSpecification" />
      <el-table-column label="单位" align="center" prop="unitMeasureName" width="80" />
      <el-table-column label="物料/产品" align="center" prop="itemOrProduct" width="100"><template v-slot="scope"><dict-tag :type="MES_ITEM_OR_PRODUCT" :value="scope.row.itemOrProduct" /></template></el-table-column>
      <el-table-column label="用量比例" align="center" prop="quantity" width="100" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column v-if="!isReadOnly" label="操作" align="center" width="120"><template v-slot="scope"><el-button type="text" @click="openForm('update', scope.row)">编辑</el-button><el-button type="text" class="danger" @click="handleDelete(scope.row.id)">删除</el-button></template></el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" append-to-body>
      <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="BOM 物料编码"><el-input v-model="formData.bomItemCode" readonly /></el-form-item>
        <el-form-item label="BOM 物料名称"><el-input v-model="formData.bomItemName" readonly /></el-form-item>
        <el-form-item label="规格型号"><el-input v-model="formData.bomItemSpecification" readonly /></el-form-item>
        <el-form-item label="单位"><el-input v-model="formData.unitMeasureName" readonly /></el-form-item>
        <el-form-item label="用量比例" prop="quantity"><el-input-number v-model="formData.quantity" :min="0" :precision="4" :step="0.1" controls-position="right" class="full-width" /></el-form-item>
        <el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
    </el-dialog>
    <md-item-select-dialog ref="itemSelect" @selected="handleItemSelected" />
  </div>
</template>

<script>
import { MdProductBomApi } from '@/api/mes/md/item/productBom'
import MdItemSelectDialog from '@/views/mes/md/item/components/MdItemSelectDialog.vue'

const MES_ITEM_OR_PRODUCT = 'mes_md_item_or_product'

export default {
  name: 'MdProductBomForm',
  components: { MdItemSelectDialog },
  props: { itemId: { type: Number, required: true }, formType: { type: String, default: '' }},
  data() {
    return {
      MES_ITEM_OR_PRODUCT,
      loading: false,
      list: [],
      dialogVisible: false,
      dialogTitle: '',
      dialogFormType: '',
      formLoading: false,
      formData: this.getDefaultForm(),
      formRules: { quantity: [{ required: true, message: '用量比例不能为空', trigger: 'blur' }] }
    }
  },
  computed: {
    isReadOnly() {
      return this.formType === 'detail'
    }
  },
  watch: {
    itemId: { immediate: true, handler(value) { if (value) this.getList() } }
  },
  methods: {
    getDefaultForm() {
      return { id: undefined, itemId: this.itemId, bomItemId: undefined, bomItemCode: undefined, bomItemName: undefined, bomItemSpecification: undefined, unitMeasureName: undefined, quantity: 1, remark: undefined }
    },
    async getList() {
      this.loading = true
      try {
        this.list = (await MdProductBomApi.getProductBomListByItemId(this.itemId)).data
      } finally {
        this.loading = false
      }
    },
    handleAdd() {
      this.$refs.itemSelect.open()
    },
    async handleItemSelected(rows) {
      if (!rows || rows.length === 0) return
      for (const item of rows) {
        await MdProductBomApi.createProductBom({ itemId: this.itemId, bomItemId: item.id, quantity: 1 })
      }
      this.$modal.msgSuccess('新增成功')
      await this.getList()
    },
    openForm(type, row) {
      this.dialogVisible = true
      this.dialogTitle = type === 'update' ? '修改' : '新增'
      this.dialogFormType = type
      this.formData = this.getDefaultForm()
      if (type === 'update' && row) this.formData = { id: row.id, itemId: row.itemId, bomItemId: row.bomItemId, bomItemCode: row.bomItemCode, bomItemName: row.bomItemName, bomItemSpecification: row.bomItemSpecification, unitMeasureName: row.unitMeasureName, quantity: row.quantity, remark: row.remark }
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.formLoading = true
        try {
          if (this.dialogFormType === 'create') await MdProductBomApi.createProductBom(this.formData)
          else await MdProductBomApi.updateProductBom(this.formData)
          this.$modal.msgSuccess(this.dialogFormType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          await this.getList()
        } finally {
          this.formLoading = false
        }
      })
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除该 BOM 物料？')
        await MdProductBomApi.deleteProductBom(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消时不做处理
      }
    }
  }
}
</script>

<style scoped>
.add-button { margin-bottom: 10px; }
.full-width { width: 100%; }
.danger { color: #f56c6c; }
</style>
