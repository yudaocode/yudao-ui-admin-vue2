<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="共享类型" prop="subjectType">
            <el-select
              v-model="formData.subjectType"
              placeholder="请选择共享类型"
              :disabled="formType === 'update'"
              @change="handleSubjectTypeChange"
            >
              <el-option
                v-for="item in subjectTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="共享对象" prop="subjectId">
            <UserSelect
              v-if="formData.subjectType === OA_FILE_SUBJECT_TYPE.USER"
              v-model="formData.subjectId"
              :disabled="formType === 'update'"
            />
            <DeptSelect
              v-else
              v-model="formData.subjectId"
              :disabled="formType === 'update'"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="权限" prop="level">
            <template slot="label">
              权限
              <el-tooltip
                content="查看权限仅可查看文件信息，预览和下载需选择更高权限；管理权限可改名、编辑和管理共享，删除、移动仍由文件所有者操作。"
                placement="top"
              >
                <i class="el-icon-question" />
              </el-tooltip>
            </template>
            <el-select v-model="formData.level" placeholder="请选择权限">
              <el-option
                v-for="item in levelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="继承权限" prop="inherit">
            <template slot="label">
              继承权限
              <el-tooltip content="开启后对子项生效，关闭后子项需单独授权。" placement="top">
                <i class="el-icon-question" />
              </el-tooltip>
            </template>
            <el-switch v-model="formData.inherit" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="到期时间" prop="expireTime">
            <el-date-picker
              v-model="formData.expireTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="不填则长期有效"
              clearable
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import UserSelect from '@/views/system/user/components/UserSelect.vue'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import * as PermissionApi from '@/api/oa/file/permission'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { OA_FILE_PERMISSION_LEVEL, OA_FILE_SUBJECT_TYPE } from '@/views/oa/utils/constants'

function createDefaultFormData(nodeId) {
  return {
    id: undefined,
    nodeId,
    subjectType: OA_FILE_SUBJECT_TYPE.USER,
    subjectId: undefined,
    level: OA_FILE_PERMISSION_LEVEL.READ,
    inherit: true,
    expireTime: undefined
  }
}

export default {
  name: 'OaFilePermissionForm',
  components: { Dialog, UserSelect, DeptSelect },
  data() {
    return {
      dialogVisible: false, // 弹窗的是否展示
      dialogTitle: '', // 弹窗标题
      formLoading: false, // 表单加载中
      formType: '', // 表单类型：create - 新增；update - 修改
      formData: createDefaultFormData(0),
      formRules: {
        subjectType: [{ required: true, message: '共享类型不能为空', trigger: 'change' }],
        subjectId: [{ required: true, message: '共享对象不能为空', trigger: 'change' }],
        level: [{ required: true, message: '权限不能为空', trigger: 'change' }]
      },
      DICT_TYPE,
      OA_FILE_SUBJECT_TYPE
    }
  },
  computed: {
    subjectTypeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_FILE_SUBJECT_TYPE)
    },
    levelOptions() {
      return getIntDictOptions(DICT_TYPE.OA_FILE_PERMISSION_LEVEL)
    }
  },
  methods: {
    /** 打开弹窗 */
    open(type, nodeId, row) {
      this.dialogVisible = true
      this.dialogTitle = (type === 'create' ? '新增' : '修改') + '共享'
      this.formType = type
      this.resetForm(nodeId)
      // 修改时回显已有授权，仅调整权限、继承和到期时间
      if (row) {
        this.formData = { ...row }
      }
    },
    /** 切换共享类型 */
    handleSubjectTypeChange() {
      this.formData.subjectId = undefined
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate('subjectId')
      })
    },
    /** 提交表单 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        PermissionApi.saveFilePermission(this.formData).then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    /** 重置表单 */
    resetForm(nodeId) {
      this.formData = createDefaultFormData(nodeId)
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    }
  }
}
</script>
