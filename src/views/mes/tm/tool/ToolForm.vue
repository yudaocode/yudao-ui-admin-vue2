<template>
  <div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="960px"
      append-to-body
    >
      <el-form
        ref="form"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        :disabled="isDetail"
        label-width="120px"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item
              label="工具编码"
              prop="code"
            >
              <el-input
                v-model="formData.code"
                placeholder="请输入工具编码"
                :disabled="formType !== 'create'"
              >
                <el-button
                  v-if="formType === 'create'"
                  slot="append"
                  @click="generateCode"
                >生成</el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="工具名称"
              prop="name"
            >
              <el-input
                v-model="formData.name"
                placeholder="请输入工具名称"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item
              label="工具类型"
              prop="toolTypeId"
            >
              <tm-tool-type-select
                v-model="formData.toolTypeId"
                placeholder="请选择工具类型"
                @change="handleToolTypeChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="品牌"
              prop="brand"
            >
              <el-input
                v-model="formData.brand"
                placeholder="请输入品牌"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="型号规格"
              prop="specification"
            >
              <el-input
                v-model="formData.specification"
                placeholder="请输入型号规格"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item
              label="库存数量"
              prop="quantity"
            >
              <el-input-number
                v-model="formData.quantity"
                :min="1"
                :disabled="selectedToolType && selectedToolType.codeFlag === true"
                style="width: 100%"
                @change="handleQuantityChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="可用数量"
              prop="availableQuantity"
            >
              <el-input-number
                v-model="formData.availableQuantity"
                :min="0"
                disabled
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="状态"
              prop="status"
            >
              <el-select
                v-model="formData.status"
                disabled
                placeholder="请选择状态"
                style="width: 100%"
              >
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.MES_TM_TOOL_STATUS)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item
              label="保养维护类型"
              prop="maintenType"
            >
              <el-select
                v-model="formData.maintenType"
                clearable
                placeholder="请选择保养维护类型"
                style="width: 100%"
              >
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.MES_TM_MAINTEN_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="formData.maintenType === MesMaintenTypeEnum.REGULAR"
            :span="8"
          >
            <el-form-item
              label="下次保养日期"
              prop="nextMaintenDate"
            >
              <el-date-picker
                v-model="formData.nextMaintenDate"
                type="datetime"
                value-format="timestamp"
                placeholder="请选择下次保养日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="formData.maintenType === MesMaintenTypeEnum.USAGE"
            :span="8"
          >
            <el-form-item
              label="下次保养周期"
              prop="nextMaintenPeriod"
            >
              <el-input-number
                v-model="formData.nextMaintenPeriod"
                :min="1"
                placeholder="次数"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="备注"
          prop="remark"
        >
          <el-input
            v-model="formData.remark"
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          v-if="isDetail && formData.id"
          type="primary"
          plain
          @click="handleBarcode"
        >查看条码</el-button>
        <el-button
          v-if="!isDetail"
          type="primary"
          :loading="formLoading"
          @click="submitForm"
        >确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <barcode-detail ref="barcodeDetail" />
  </div>
</template>

<script>
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { TmToolApi } from '@/api/mes/tm/tool'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import TmToolTypeSelect from '@/views/mes/tm/tool/type/components/TmToolTypeSelect.vue'
import {
  BarcodeBizTypeEnum,
  MesAutoCodeRuleCode,
  MesMaintenTypeEnum,
  MesToolStatusEnum
} from '@/views/mes/utils/constants'
import { BarcodeDetail } from '@/views/mes/wm/barcode/components'

const createFormData = () => ({
  id: undefined,
  code: undefined,
  name: undefined,
  brand: undefined,
  specification: undefined,
  toolTypeId: undefined,
  quantity: 1,
  availableQuantity: 1,
  maintenType: undefined,
  nextMaintenPeriod: undefined,
  nextMaintenDate: undefined,
  status: MesToolStatusEnum.STORE,
  remark: undefined
})

export default {
  name: 'ToolForm',
  components: { BarcodeDetail, TmToolTypeSelect },
  data() {
    return {
      DICT_TYPE,
      MesMaintenTypeEnum,
      dialogVisible: false,
      formLoading: false,
      formType: '',
      formData: createFormData(),
      selectedToolType: undefined,
      formRules: {
        code: [{ required: true, message: '工具编码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '工具名称不能为空', trigger: 'blur' }],
        toolTypeId: [{ required: true, message: '工具类型不能为空', trigger: 'change' }],
        quantity: [{ required: true, message: '数量不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      const titles = { create: '新增工具', update: '修改工具', detail: '查看工具' }
      return titles[this.formType] || this.formType
    },
    isDetail() {
      return this.formType === 'detail'
    }
  },
  methods: {
    getIntDictOptions,
    handleBarcode() {
      if (!this.$refs.barcodeDetail || !this.formData.id) return
      this.$refs.barcodeDetail.openByBusiness(
        this.formData.id,
        BarcodeBizTypeEnum.TOOL,
        this.formData.code,
        this.formData.name
      )
    },
    open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.resetForm()
      if (id === undefined || id === null) return Promise.resolve()
      this.formLoading = true
      return TmToolApi.getTool(id).then((response) => {
        this.formData = response.data
      }).finally(() => {
        this.formLoading = false
      })
    },
    generateCode() {
      return AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.TM_TOOL_CODE)
        .then((response) => {
          this.formData.code = response.data
        })
    },
    handleQuantityChange(value) {
      if (this.formType === 'create') this.formData.availableQuantity = value
    },
    handleToolTypeChange(item) {
      this.selectedToolType = item
      if (!item || item.codeFlag !== true) return
      this.formData.quantity = 1
      this.formData.availableQuantity = 1
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? TmToolApi.createTool(this.formData)
          : TmToolApi.updateTool(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = createFormData()
      this.selectedToolType = undefined
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
