<template>
  <dialog-component :title="dialogTitle" v-model="dialogVisible" width="900px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="150px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属部门" prop="deptId">
            <dept-select v-model="formData.deptId" placeholder="请选择所属部门" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="印章编号">
            <el-input v-model="formData.no" placeholder="保存后自动生成" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="印章名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入印章名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="印章类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择印章类型" style="width: 100%">
              <el-option
                v-for="dict in typeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="印章分类" prop="category">
            <el-select v-model="formData.category" placeholder="请选择印章分类" style="width: 100%">
              <el-option
                v-for="dict in categoryOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="保管人" prop="keeperUserId">
            <user-select-v2 v-model="formData.keeperUserId" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="保管部门" prop="keeperDeptId">
            <dept-select v-model="formData.keeperDeptId" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 状态及日期随表单保存 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
              <el-option
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="购买时间" prop="purchaseTime">
            <el-date-picker
              v-model="formData.purchaseTime"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择购买时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="启用时间" prop="enableTime">
            <el-date-picker
              v-model="formData.enableTime"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择启用时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="停用时间" prop="disableTime">
            <el-date-picker
              v-model="formData.disableTime"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择停用时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="印章照片" prop="picUrl">
            <upload-img v-model="formData.picUrl" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示顺序" prop="sort">
            <el-input-number
              v-model="formData.sort"
              :min="0"
              :precision="0"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              placeholder="请输入备注"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </dialog-component>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { OaSealStatus } from '@/views/oa/utils/constants'
import * as SealApi from '@/api/oa/seal'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import DialogComponent from '@/components/Dialog'
import UploadImg from '@/components/UploadImg'

function createDefaultForm() {
  return {
    id: undefined,
    deptId: undefined,
    no: '',
    name: '',
    type: undefined,
    category: undefined,
    status: OaSealStatus.AVAILABLE,
    keeperUserId: undefined,
    keeperDeptId: undefined,
    purchaseTime: undefined,
    enableTime: undefined,
    disableTime: undefined,
    picUrl: '',
    sort: 0,
    remark: ''
  }
}

export default {
  name: 'OaSealForm',
  components: { UserSelectV2, DeptSelect, DialogComponent, UploadImg },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: createDefaultForm(),
      formRules: {
        deptId: [{ required: true, message: '所属部门不能为空', trigger: 'change' }],
        name: [{ required: true, message: '印章名称不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '印章类型不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
        keeperUserId: [{ required: true, message: '保管人不能为空', trigger: 'change' }],
        keeperDeptId: [{ required: true, message: '保管部门不能为空', trigger: 'change' }],
        sort: [{ required: true, message: '显示顺序不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SEAL_TYPE)
    },
    categoryOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SEAL_CATEGORY)
    },
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SEAL_STATUS)
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.formType = type
      this.resetForm()
      if (!id) return
      this.formLoading = true
      return SealApi.getSeal(id).then(response => {
        this.formData = response.data
      }).finally(() => {
        this.formLoading = false
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? SealApi.createSeal(this.formData)
          : SealApi.updateSeal(this.formData)
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
      this.formData = createDefaultForm()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
