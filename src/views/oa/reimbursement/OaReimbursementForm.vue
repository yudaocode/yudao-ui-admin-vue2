<template>
  <Dialog
    :title="dialogTitle"
    v-model="dialogVisible"
    width="1100px"
    append-to-body
    @closed="resetForm"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="150px"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" maxlength="255" />
      </el-form-item>
      <el-form-item label="紧急程度" prop="urgency">
        <el-select v-model="formData.urgency" placeholder="请选择紧急程度" style="width: 100%">
          <el-option
            v-for="dict in urgencyOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="证明人" prop="witnessUserId">
        <user-select v-model="formData.witnessUserId" placeholder="请选择证明人" style="width: 100%" />
      </el-form-item>
      <el-form-item label="相关客户" prop="customerName">
        <el-input v-model="formData.customerName" placeholder="请输入相关客户" maxlength="255" />
      </el-form-item>
      <el-form-item label="报销方式" prop="paymentMethod">
        <el-select v-model="formData.paymentMethod" placeholder="请选择报销方式" style="width: 100%">
          <el-option
            v-for="dict in paymentMethodOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="申请原因" prop="reason">
        <el-input
          v-model="formData.reason"
          maxlength="5000"
          placeholder="请输入申请原因"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="附件" prop="fileUrls">
        <upload-file v-model="formData.fileUrls" :is-show-tip="false" />
      </el-form-item>
      <!-- 报销费用明细 -->
      <div class="items-header">
        <span class="items-title">报销明细</span>
        <el-button type="primary" plain size="mini" @click="addItem">新增明细</el-button>
      </div>
      <el-table :data="formData.items" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="费用发生时间" min-width="210">
          <template slot-scope="scope">
            <el-date-picker
              v-model="scope.row.expenseTime"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择费用时间"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="费用类型" min-width="160">
          <template slot-scope="scope">
            <el-select v-model="scope.row.expenseType" placeholder="请选择费用类型">
              <el-option
                v-for="dict in expenseTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="费用说明" min-width="160">
          <template slot-scope="scope">
            <el-form-item
              :prop="'items.' + scope.$index + '.description'"
              :label-width="'0'"
              :rules="[{ required: true, message: '费用说明不能为空', trigger: 'blur' }]"
              class="item-form-item"
            >
              <el-input v-model="scope.row.description" placeholder="请输入费用说明" />
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="票据张数" min-width="160">
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.invoiceCount"
              :min="0"
              :precision="0"
              :max="2147483647"
              controls-position="right"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="报销金额" min-width="160">
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.price"
              :min="0"
              :precision="2"
              :max="9999999999999999.99"
              controls-position="right"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="75" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" class="danger-text" @click="deleteItem(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="items-summary">
        票据合计：{{ invoiceCount }} 张；金额合计：{{ totalPrice }} 元
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="formLoading" @click="submitForm">保 存</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import UserSelect from '@/views/system/user/components/UserSelect.vue'
import * as ReimbursementApi from '@/api/oa/reimbursement'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

function createDefaultForm() {
  return {
    title: undefined,
    urgency: undefined,
    witnessUserId: undefined,
    customerName: undefined,
    paymentMethod: undefined,
    reason: undefined,
    items: [],
    fileUrls: []
  }
}

export default {
  name: 'OaReimbursementForm',
  components: { Dialog, UserSelect },
  data() {
    return {
      dialogVisible: false, // 弹窗是否展示
      dialogTitle: '', // 弹窗标题
      formLoading: false, // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
      formType: '', // 表单类型：create - 新增；update - 修改
      formData: createDefaultForm(), // 表单数据
      formRules: {
        customerName: [{ required: true, message: '相关客户不能为空', trigger: 'blur' }],
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        urgency: [{ required: true, message: '紧急程度不能为空', trigger: 'change' }],
        witnessUserId: [{ required: true, message: '证明人不能为空', trigger: 'change' }],
        paymentMethod: [{ required: true, message: '报销方式不能为空', trigger: 'change' }],
        reason: [{ required: true, message: '申请原因不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    urgencyOptions() {
      return getIntDictOptions(DICT_TYPE.OA_APPLY_URGENCY)
    },
    paymentMethodOptions() {
      return getIntDictOptions(DICT_TYPE.OA_REIMBURSEMENT_PAYMENT_METHOD)
    },
    expenseTypeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_EXPENSE_TYPE)
    },
    /** 报销总金额 */
    totalPrice() {
      return (this.formData.items || []).reduce(
        (total, item) => total + Math.round((item.price || 0) * 100),
        0
      ) / 100
    },
    /** 票据总数 */
    invoiceCount() {
      return (this.formData.items || []).reduce((total, item) => total + (item.invoiceCount || 0), 0)
    }
  },
  methods: {
    /** 新增费用明细 */
    addItem() {
      this.formData.items.push({ invoiceCount: 0, price: 0 })
    },
    /** 删除费用明细 */
    deleteItem(index) {
      this.formData.items.splice(index, 1)
    },
    /** 打开弹窗 */
    open(type, id) {
      this.resetForm()
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.formType = type
      // 修改时，设置数据
      if (id) {
        this.formLoading = true
        return ReimbursementApi.getReimbursement(id).then(response => {
          this.formData = response.data
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    /** 提交表单 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.formLoading = true
        const request = this.formType === 'create'
          ? ReimbursementApi.createReimbursement(this.formData)
          : ReimbursementApi.updateReimbursement(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          // 发送操作成功的事件
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    /** 重置表单 */
    resetForm() {
      this.formData = createDefaultForm()
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.items-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  .items-title {
    font-weight: bold;
  }
}

.items-summary {
  margin-top: 12px;
  margin-bottom: 12px;
  text-align: right;
}

.item-form-item {
  margin-bottom: 0;
}

.danger-text {
  color: #f56c6c;
}
</style>
