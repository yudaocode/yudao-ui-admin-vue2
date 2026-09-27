<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="1300px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item
        label="模板名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入模板名称"
        />
      </el-form-item>
      <el-form-item
        label="计费方式"
        prop="chargeMode"
      >
        <el-radio-group
          v-model="formData.chargeMode"
          @change="changeChargeMode"
        >
          <el-radio
            v-for="dict in chargeModeDictDatas"
            :key="dict.value"
            :label="parseInt(dict.value)"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="运费"
        prop="charges"
      >
        <el-table
          border
          style="width: 100%"
          :data="formData.charges"
        >
          <el-table-column
            align="center"
            label="区域"
            width="360"
          >
            <template v-slot="scope">
              <el-cascader
                v-model="scope.row.areaIds"
                :options="areaTree"
                :props="areaCascaderProps"
                class="area-cascader"
                clearable
                placeholder="请选择地区"
                filterable
                collapse-tags
              />
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            :label="columnTitle.startCountTitle"
            width="180"
            prop="startCount"
          >
            <template v-slot="scope">
              <el-input-number
                v-model="scope.row.startCount"
                :min="1"
              />
            </template>
          </el-table-column>
          <el-table-column
            width="180"
            align="center"
            label="运费(元)"
            prop="startPrice"
          >
            <template v-slot="scope">
              <el-input-number
                v-model="scope.row.startPrice"
                :min="1"
              />
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            :label="columnTitle.extraCountTitle"
            width="180"
            prop="extraCount"
          >
            <template v-slot="scope">
              <el-input-number
                v-model="scope.row.extraCount"
                :min="1"
              />
            </template>
          </el-table-column>
          <el-table-column
            width="180"
            align="center"
            label="续费(元)"
            prop="extraPrice"
          >
            <template v-slot="scope">
              <el-input-number
                v-model="scope.row.extraPrice"
                :min="1"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
          >
            <template v-slot="scope">
              <el-button
                type="text"
                size="mini"
                icon="el-icon-delete"
                @click="deleteChargeArea(scope.$index)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          @click="addChargeArea"
        >添加区域</el-button>
      </el-form-item>
      <el-form-item
        label="包邮区域"
        prop="frees"
      >
        <el-table
          border
          style="width: 100%"
          :data="formData.frees"
        >
          <el-table-column
            align="center"
            label="区域"
            width="360"
          >
            <template v-slot="scope">
              <el-cascader
                v-model="scope.row.areaIds"
                :options="areaTree"
                :props="areaCascaderProps"
                class="area-cascader"
                clearable
                placeholder="请选择商品分类"
                filterable
                collapse-tags
              />
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            :label="columnTitle.freeCountTitle"
            prop="freeCount"
          >
            <template v-slot="scope">
              <el-input-number
                v-model="scope.row.freeCount"
                :min="1"
              />
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="包邮金额（元）"
            prop="freePrice"
          >
            <template v-slot="scope">
              <el-input-number
                v-model="scope.row.freePrice"
                :min="1"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
          >
            <template v-slot="scope">
              <el-button
                type="text"
                size="mini"
                icon="el-icon-delete"
                @click="deleteFreeArea(scope.$index)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          @click="addFreeArea"
        >添加区域</el-button>
      </el-form-item>
      <el-form-item
        label="排序"
        prop="sort"
      >
        <el-input-number
          v-model="formData.sort"
          controls-position="right"
          :min="0"
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
import * as DeliveryExpressTemplateApi from '@/api/mall/trade/delivery/expressTemplate'
import { getAreaTree } from '@/api/system/area'
import { getDictDatas } from '@/utils/dict'

const EXPRESS_CHARGE_MODE_DICT_TYPE = 'trade_delivery_express_charge_mode'
const COLUMN_TITLE_MAP = {
  1: {
    startCountTitle: '首件',
    extraCountTitle: '续件',
    freeCountTitle: '包邮件数'
  },
  2: {
    startCountTitle: '首件重量(kg)',
    extraCountTitle: '续件重量(kg)',
    freeCountTitle: '包邮重量(kg)'
  },
  3: {
    startCountTitle: '首件体积(m³)',
    extraCountTitle: '续件体积(m³)',
    freeCountTitle: '包邮体积(m³)'
  }
}

function fenToYuanNumber(value) {
  const price = Number(value)
  return Number.isFinite(price) ? Number((price / 100).toFixed(2)) : 0
}

function yuanToFen(value) {
  const price = Number(value)
  return Number.isFinite(price) ? Math.round(price * 100) : 0
}

export default {
  name: 'ExpressTemplateForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.getDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
        chargeMode: [{ required: true, message: '配送计费方式不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '分类排序不能为空', trigger: 'blur' }]
      },
      chargeModeDictDatas: getDictDatas(EXPRESS_CHARGE_MODE_DICT_TYPE),
      columnTitle: this.getColumnTitle(1),
      areaTree: [],
      areaCascaderProps: {
        children: 'children',
        label: 'name',
        value: 'id',
        leaf: 'leaf',
        emitPath: false,
        multiple: true
      }
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        name: '',
        chargeMode: 1,
        charges: [
          {
            areaIds: [1],
            startCount: 2,
            startPrice: 5,
            extraCount: 5,
            extraPrice: 10
          }
        ],
        frees: [],
        sort: 0
      }
    },
    getColumnTitle(chargeMode) {
      return Object.assign({}, COLUMN_TITLE_MAP[Number(chargeMode)] || COLUMN_TITLE_MAP[1])
    },
    /** 初始化区域数据 */
    initData() {
      return getAreaTree()
        .then((response) => {
          this.areaTree = response.data
        })
    },
    /** 打开弹窗 */
    open(type, id) {
      this.dialogVisible = true
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改' : '新增'
      this.resetForm()
      if (id === undefined || id === null) return Promise.resolve()
      this.formLoading = true
      return DeliveryExpressTemplateApi.getDeliveryExpressTemplate(id)
        .then((response) => {
          const detail = response.data
          this.formData = Object.assign(this.getDefaultFormData(), detail, {
            charges: Array.isArray(detail.charges)
              ? detail.charges.map((item) => Object.assign({}, item, {
                startPrice: fenToYuanNumber(item.startPrice),
                extraPrice: fenToYuanNumber(item.extraPrice)
              }))
              : [],
            frees: Array.isArray(detail.frees)
              ? detail.frees.map((item) => Object.assign({}, item, {
                freePrice: fenToYuanNumber(item.freePrice)
              }))
              : []
          })
          this.columnTitle = this.getColumnTitle(this.formData.chargeMode)
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    /** 构建后端以分为单位的提交数据 */
    buildSubmitData() {
      return Object.assign({}, this.formData, {
        charges: (this.formData.charges || []).map((item) => Object.assign({}, item, {
          startPrice: yuanToFen(item.startPrice),
          extraPrice: yuanToFen(item.extraPrice)
        })),
        frees: (this.formData.frees || []).map((item) => Object.assign({}, item, {
          freePrice: yuanToFen(item.freePrice)
        }))
      })
    },
    /** 提交表单 */
    submitForm() {
      if (!this.$refs.form) return
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.formLoading = true
        const data = this.buildSubmitData()
        const request = this.formType === 'create'
          ? DeliveryExpressTemplateApi.createDeliveryExpressTemplate(data)
          : DeliveryExpressTemplateApi.updateDeliveryExpressTemplate(data)
        request
          .then(() => {
            this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
            this.dialogVisible = false
            this.$emit('success')
          })
          .finally(() => {
            this.formLoading = false
          })
      })
    },
    /** 重置表单 */
    resetForm() {
      this.formData = this.getDefaultFormData()
      this.columnTitle = this.getColumnTitle(1)
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    /** 配送计费方法改变 */
    changeChargeMode(chargeMode) {
      this.columnTitle = this.getColumnTitle(chargeMode)
    },
    /** 添加计费区域 */
    addChargeArea() {
      this.formData.charges.push({
        areaIds: [],
        startCount: 1,
        startPrice: 1,
        extraCount: 1,
        extraPrice: 1
      })
    },
    /** 删除计费区域 */
    deleteChargeArea(index) {
      this.formData.charges.splice(index, 1)
    },
    /** 添加包邮区域 */
    addFreeArea() {
      this.formData.frees.push({
        areaIds: [],
        freeCount: 1,
        freePrice: 1
      })
    },
    /** 删除包邮区域 */
    deleteFreeArea(index) {
      this.formData.frees.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.area-cascader {
  width: 100%;
}
</style>
