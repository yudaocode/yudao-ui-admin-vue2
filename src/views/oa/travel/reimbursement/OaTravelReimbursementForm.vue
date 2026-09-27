<template>
  <dialog-component :title="dialogTitle" v-model="dialogVisible" width="1200px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="关联出差申请" prop="travelApplyId">
            <el-input
              :value="formData.travelApplyNo"
              readonly
              placeholder="请选择出差申请单（可选）"
              @click.native="$refs.applySelect.open(formData.travelApplyId)"
            >
              <i slot="suffix" class="el-input__icon el-icon-search" />
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="出差事由" prop="reason">
        <el-input
          v-model="formData.reason"
          type="textarea"
          :rows="2"
          placeholder="请输入出差事由"
        />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始日期" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择开始日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束日期" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择结束日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出差天数">
            <el-input :value="days" placeholder="自动计算" disabled>
              <template slot="append">天</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报销总金额">
            <el-input :value="totalPrice" placeholder="自动汇总" disabled>
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="附件" prop="fileUrls">
        <upload-file v-model="formData.fileUrls" :is-show-tip="false" />
      </el-form-item>
      <div class="item-header">
        <span class="item-title">费用明细</span>
        <el-button type="primary" plain size="mini" @click="addItem">添加费用</el-button>
      </div>
      <el-table :data="formData.items" border show-summary :summary-method="getSummaries">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="费用类型" min-width="140">
          <template slot-scope="scope">
            <el-select v-model="scope.row.expenseType" clearable placeholder="请选择费用类型">
              <el-option
                v-for="dict in expenseTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="发生日期" min-width="160">
          <template slot-scope="scope">
            <el-date-picker
              v-model="scope.row.expenseTime"
              type="date"
              value-format="timestamp"
              placeholder="请选择发生日期"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="出发地" min-width="160">
          <template slot-scope="scope">
            <el-input v-model="scope.row.departureCity" placeholder="请输入出发地" />
          </template>
        </el-table-column>
        <el-table-column label="到达地" min-width="160">
          <template slot-scope="scope">
            <el-input v-model="scope.row.arrivalCity" placeholder="请输入到达地" />
          </template>
        </el-table-column>
        <el-table-column
          label="金额(元)"
          prop="price"
          min-width="160"
          align="right"
          header-align="center"
        >
          <template slot="header">
            <span class="required-mark">*</span>
            金额(元)
          </template>
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.price"
              :min="0"
              :precision="2"
              controls-position="right"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="费用说明" min-width="180">
          <template slot-scope="scope">
            <el-input v-model="scope.row.description" placeholder="请输入费用说明" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="75" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" class="danger-text" @click="deleteItem(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button
        v-hasPermi="['oa:travel-reimbursement:save']"
        :disabled="formLoading"
        type="primary"
        @click="submitForm"
      >保 存</el-button>
      <el-button :disabled="formLoading" @click="dialogVisible = false">取 消</el-button>
    </div>

    <oa-travel-apply-select ref="applySelect" @select="handleApplySelect" />
  </dialog-component>
</template>

<script>
import dayjs from 'dayjs'
import * as TravelApi from '@/api/oa/travel/reimbursement'
import OaTravelApplySelect from '@/views/oa/travel/apply/components/OaTravelApplySelect.vue'
import DialogComponent from '@/components/Dialog'
import UploadFile from '@/components/UploadFile'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { BpmProcessInstanceStatus } from '@/utils/constants'

function createDefaultForm() {
  return {
    id: undefined,
    no: undefined,
    status: BpmProcessInstanceStatus.NOT_START,
    travelApplyId: undefined,
    travelApplyNo: undefined,
    reason: undefined,
    startTime: undefined,
    endTime: undefined,
    remark: undefined,
    items: [],
    fileUrls: []
  }
}

export default {
  name: 'OaTravelReimbursementForm',
  components: { OaTravelApplySelect, DialogComponent, UploadFile },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formData: createDefaultForm(),
      formRules: {
        reason: [{ required: true, message: '出差事由不能为空', trigger: 'blur' }],
        startTime: [{ required: true, message: '开始日期不能为空', trigger: 'change' }],
        endTime: [{ required: true, message: '结束日期不能为空', trigger: 'change' }],
        fileUrls: [{ type: 'array', required: true, message: '请上传报销附件', trigger: 'change' }]
      }
    }
  },
  computed: {
    expenseTypeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_EXPENSE_TYPE)
    },
    days() {
      if (!this.formData.startTime || !this.formData.endTime) return undefined
      return Math.ceil(
        dayjs(Number(this.formData.endTime)).diff(
          dayjs(Number(this.formData.startTime)),
          'hour',
          true
        ) / 24
      )
    },
    totalPrice() {
      return (
        this.formData.items.reduce((sum, item) => sum + Math.round((item.price || 0) * 100), 0) / 100
      ).toFixed(2)
    }
  },
  methods: {
    getSummaries({ columns }) {
      return columns.map((column, index) =>
        index === 0 ? '合计' : column.property === 'price' ? this.totalPrice : ''
      )
    },
    handleApplySelect(apply) {
      this.formData.travelApplyId = apply.id
      this.formData.travelApplyNo = apply.no
      this.formData.reason = apply.reason
      this.formData.startTime = apply.startTime
      this.formData.endTime = apply.endTime
    },
    addItem() {
      this.formData.items.push({
        expenseType: undefined,
        expenseTime: undefined,
        departureCity: undefined,
        arrivalCity: undefined,
        price: undefined,
        description: undefined
      })
    },
    deleteItem(index) {
      this.formData.items.splice(index, 1)
    },
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = (type === 'create' ? '新增' : '修改') + '差旅报销'
      this.resetForm()
      if (!id) return
      this.formLoading = true
      return TravelApi.getTravelReimbursement(id).then(response => {
        this.formData = response.data
      }).finally(() => {
        this.formLoading = false
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (!this.formData.items.length) {
          return this.$modal.msgWarning('请添加费用明细')
        }
        if (this.formData.items.some(item => item.price === undefined || item.price === null)) {
          return this.$modal.msgWarning('请填写每行费用金额')
        }
        this.formLoading = true
        const isUpdate = !!this.formData.id
        const request = isUpdate
          ? TravelApi.updateTravelReimbursement(this.formData)
          : TravelApi.createTravelReimbursement(this.formData).then(response => {
            this.formData.id = response.data
          })
        request.then(() => {
          this.$modal.msgSuccess('保存成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = createDefaultForm()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>

<style scoped>
.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 12px;
}

.item-title {
  font-weight: 700;
}

.required-mark {
  margin-right: 4px;
  color: #f56c6c;
}

.danger-text {
  color: #f56c6c;
}
</style>
