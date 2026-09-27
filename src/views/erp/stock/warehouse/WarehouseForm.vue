<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="680px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="仓库名称"
            prop="name"
          >
            <el-input
              v-model="form.name"
              placeholder="请输入仓库名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="仓库地址"
            prop="address"
          >
            <el-input
              v-model="form.address"
              placeholder="请输入仓库地址"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="仓库状态"
            prop="status"
          >
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in statusDictDatas"
                :key="dict.value"
                :label="parseInt(dict.value)"
              >{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="排序"
            prop="sort"
          >
            <el-input-number
              v-model="form.sort"
              controls-position="right"
              :min="0"
              :precision="0"
              style="width: 100%"
              placeholder="请输入排序"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="仓储费"
            prop="warehousePrice"
          >
            <el-input-number
              v-model="form.warehousePrice"
              controls-position="right"
              :min="0"
              :precision="2"
              style="width: 100%"
              placeholder="请输入仓储费（元）"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="搬运费"
            prop="truckagePrice"
          >
            <el-input-number
              v-model="form.truckagePrice"
              controls-position="right"
              :min="0"
              :precision="2"
              style="width: 100%"
              placeholder="请输入搬运费（元）"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="负责人"
            prop="principal"
          >
            <el-input
              v-model="form.principal"
              placeholder="请输入负责人"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="备注"
            prop="remark"
          >
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
      </el-row>
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
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  createWarehouse,
  getWarehouse,
  updateWarehouse
} from '@/api/erp/stock/warehouse'
import { CommonStatusEnum } from '@/utils/constants'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'

export default {
  name: 'WarehouseForm',
  data() {
    return {
      dialogVisible: false,
      title: '',
      formLoading: false,
      formType: '',
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      form: this.defaultForm(),
      rules: {
        name: [{ required: true, message: '仓库名称不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '排序不能为空', trigger: 'change' }],
        status: [{ required: true, message: '仓库状态不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        name: undefined,
        address: undefined,
        sort: 0,
        remark: undefined,
        principal: undefined,
        warehousePrice: undefined,
        truckagePrice: undefined,
        status: CommonStatusEnum.ENABLE
      }
    },
    open(type, id) {
      this.formType = type
      this.title = type === 'update' ? '修改仓库' : '添加仓库'
      this.form = this.defaultForm()
      this.dialogVisible = true
      this.formLoading = Boolean(id !== undefined && id !== null)
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id !== undefined && id !== null) {
        getWarehouse(id).then(response => {
          this.form = { ...this.defaultForm(), ...response.data }
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    cancel() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.form = this.defaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const saveRequest = this.formType === 'create'
          ? createWarehouse(this.form)
          : updateWarehouse(this.form)
        saveRequest.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
