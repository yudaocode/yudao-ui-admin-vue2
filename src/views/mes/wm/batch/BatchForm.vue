<template>
  <div class="wm-migrated">
    <el-dialog
      title="批次详情"
      :visible.sync="dialogVisible"
      width="980px"
      append-to-body
    >
      <el-form
        v-loading="formLoading"
        :model="formData"
        label-width="120px"
        disabled
      >
        <el-row>
          <el-col :span="8">
            <el-form-item label="批次编号">
              <el-input v-model="formData.code" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="物料编码">
              <el-input v-model="formData.itemCode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="物料名称">
              <el-input v-model="formData.itemName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="规格型号">
              <el-input v-model="formData.itemSpecification" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单位">
              <el-input v-model="formData.unitName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="生产批号">
              <el-input v-model="formData.lotNumber" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="生产日期">
              <el-input
                :value="
                  formData.produceDate ? formatDate(formData.produceDate, 'YYYY-MM-DD') : ''
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="有效期">
              <el-input
                :value="
                  formData.expireDate ? formatDate(formData.expireDate, 'YYYY-MM-DD') : ''
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="入库日期">
              <el-input
                :value="
                  formData.receiptDate ? formatDate(formData.receiptDate, 'YYYY-MM-DD') : ''
                "
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="供应商">
              <el-input v-model="formData.vendorName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户">
              <el-input v-model="formData.clientName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="工作站">
              <el-input v-model="formData.workstationCode" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="采购订单编号">
              <el-input v-model="formData.purchaseOrderCode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="销售订单编号">
              <el-input v-model="formData.salesOrderCode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="生产工单">
              <el-input v-model="formData.workOrderCode" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="formData.remark"
                type="textarea"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
import { formatDate } from '@/utils/formatTime'
import { BatchApi } from '@/api/mes/wm/batch'
export default {
  name: 'BatchForm',
  setup(props, { emit }) {
    const dialogVisible = ref(false)
    const formLoading = ref(false)
    const formData = ref({})
    /** 打开弹窗 */
    const open = async(id) => {
      dialogVisible.value = true
      formLoading.value = true
      try {
        formData.value = (await BatchApi.getBatch(id)).data
      } finally {
        formLoading.value = false
      }
    }
    return { dialogVisible, formData, formLoading, formatDate, open }
  }
}
</script>

<style scoped>
.wm-content-wrap { margin-bottom: 20px; }
.wm-w-full { width: 100%; }
.wm-w-240 { width: 240px; }
.wm-w-220 { width: 220px; }
.wm-w-200 { width: 200px; }
.mr-5px { margin-right: 5px; }
</style>
