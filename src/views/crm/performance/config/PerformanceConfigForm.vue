<!-- 业绩目标设置表单 -->
<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="960px"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item
            label="年份"
            prop="year"
          >
            <el-date-picker
              v-model="formData.year"
              type="year"
              value-format="yyyy"
              placeholder="请选择年份"
              class="form-control"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="目标类型"
            prop="bizType"
          >
            <el-select
              v-model="formData.bizType"
              class="form-control"
              placeholder="请选择目标类型"
            >
              <el-option
                v-for="item in bizTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="对象类型"
            prop="objectType"
          >
            <el-select
              v-model="formData.objectType"
              class="form-control"
              placeholder="请选择对象类型"
              @change="handleObjectTypeChange"
            >
              <el-option
                v-for="item in objectTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="目标对象"
        prop="objectId"
      >
        <el-cascader
          v-if="formData.objectType === PerformanceConfigObjectTypeEnum.DEPT"
          v-model="formData.objectId"
          :options="deptList"
          :props="deptCascaderProps"
          clearable
          filterable
          placeholder="请选择部门"
          class="form-control"
        />
        <el-select
          v-else
          v-model="formData.objectId"
          class="form-control"
          filterable
          placeholder="请选择员工"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-divider />
      <el-row :gutter="16">
        <el-col
          v-for="item in monthFields"
          :key="item.prop"
          :span="6"
        >
          <el-form-item
            :label="item.label"
            :prop="item.prop"
          >
            <el-input-number
              v-model="formData[item.prop]"
              :min="0"
              :precision="2"
              :step="1000"
              controls-position="right"
              class="form-control"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="年度目标">
        <el-input
          :value="yearTargetPriceText"
          disabled
        />
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  PerformanceConfigApi,
  PerformanceConfigObjectTypeEnum
} from '@/api/crm/performance/config'
import { BizTypeEnum } from '@/api/crm/permission'
import { getSimpleDeptList } from '@/api/system/dept'
import { getSimpleUserList } from '@/api/system/user'
import { erpPriceInputFormatter } from '@/utils'
import { handleTree } from '@/utils/ruoyi'

const monthFields = [
  { label: '一月', prop: 'januaryTargetPrice' },
  { label: '二月', prop: 'februaryTargetPrice' },
  { label: '三月', prop: 'marchTargetPrice' },
  { label: '四月', prop: 'aprilTargetPrice' },
  { label: '五月', prop: 'mayTargetPrice' },
  { label: '六月', prop: 'juneTargetPrice' },
  { label: '七月', prop: 'julyTargetPrice' },
  { label: '八月', prop: 'augustTargetPrice' },
  { label: '九月', prop: 'septemberTargetPrice' },
  { label: '十月', prop: 'octoberTargetPrice' },
  { label: '十一月', prop: 'novemberTargetPrice' },
  { label: '十二月', prop: 'decemberTargetPrice' }
]

function createDefaultFormData() {
  return {
    id: undefined,
    objectId: undefined,
    objectType: PerformanceConfigObjectTypeEnum.DEPT,
    year: String(new Date().getFullYear()),
    bizType: BizTypeEnum.CRM_CONTRACT,
    januaryTargetPrice: 0,
    februaryTargetPrice: 0,
    marchTargetPrice: 0,
    aprilTargetPrice: 0,
    mayTargetPrice: 0,
    juneTargetPrice: 0,
    julyTargetPrice: 0,
    augustTargetPrice: 0,
    septemberTargetPrice: 0,
    octoberTargetPrice: 0,
    novemberTargetPrice: 0,
    decemberTargetPrice: 0
  }
}

export default {
  name: 'CrmPerformanceConfigForm',
  data() {
    return {
      PerformanceConfigObjectTypeEnum,
      bizTypeOptions: [
        { label: '销售目标', value: BizTypeEnum.CRM_CONTRACT },
        { label: '回款目标', value: BizTypeEnum.CRM_RECEIVABLE }
      ],
      objectTypeOptions: [
        { label: '部门', value: PerformanceConfigObjectTypeEnum.DEPT },
        { label: '员工', value: PerformanceConfigObjectTypeEnum.USER }
      ],
      monthFields,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      formData: createDefaultFormData(),
      formRules: {
        year: [{ required: true, message: '年份不能为空', trigger: 'change' }],
        bizType: [{ required: true, message: '目标类型不能为空', trigger: 'change' }],
        objectType: [{ required: true, message: '对象类型不能为空', trigger: 'change' }],
        objectId: [{ required: true, message: '目标对象不能为空', trigger: 'change' }]
      },
      deptList: [],
      userList: [],
      deptCascaderProps: {
        checkStrictly: true,
        emitPath: false,
        value: 'id',
        label: 'name',
        children: 'children'
      }
    }
  },
  computed: {
    /** 年度目标金额 */
    yearTargetPrice() {
      return this.monthFields.reduce((sum, item) => {
        return sum + Number(this.formData[item.prop] || 0)
      }, 0)
    },
    /** 年度目标金额展示文本 */
    yearTargetPriceText() {
      return erpPriceInputFormatter(this.yearTargetPrice)
    }
  },
  methods: {
    /** 打开弹窗 */
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改业绩目标设置' : '新增业绩目标设置'
      this.resetForm()
      this.formLoading = true
      try {
        await this.loadOptions()
        if (id !== undefined && id !== null) {
          const data = (await PerformanceConfigApi.getPerformanceConfig(id)).data
          this.formData = Object.assign(createDefaultFormData(), data, {
            year: String(data.year)
          })
        }
      } finally {
        this.formLoading = false
      }
    },
    /** 提交表单 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const data = Object.assign({}, this.formData, {
          year: Number(this.formData.year)
        })
        const request = this.formType === 'create'
          ? PerformanceConfigApi.createPerformanceConfig(data)
          : PerformanceConfigApi.updatePerformanceConfig(data)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    /** 对象类型变化时重置目标对象 */
    handleObjectTypeChange() {
      this.formData.objectId = undefined
    },
    /** 加载部门和员工选项 */
    async loadOptions() {
      const jobs = []
      if (!this.deptList.length) {
        jobs.push(getSimpleDeptList().then(response => {
          const depts = (response).data
          this.deptList = handleTree(depts, 'id', 'parentId')
        }))
      }
      if (!this.userList.length) {
        jobs.push(getSimpleUserList().then(response => {
          const users = (response).data
          this.userList = users
        }))
      }
      await Promise.all(jobs)
    },
    /** 重置表单 */
    resetForm() {
      this.formData = createDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>

<style scoped>
.form-control {
  width: 100%;
}
</style>
