<template>
  <el-dialog
    title="测试发送"
    :visible.sync="dialogVisible"
    width="500px"
    append-to-body
    v-dialogDrag
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="140px"
    >
      <el-form-item label="模板内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          placeholder="请输入模板内容"
          readonly
        />
      </el-form-item>
      <el-form-item label="用户类型" prop="userType">
        <el-radio-group v-model="formData.userType">
          <el-radio
            v-for="dict in getDictDatas(DICT_TYPE.USER_TYPE)"
            :key="dict.value"
            :label="toNumber(dict.value)"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-show="formData.userType === 1" label="接收人ID" prop="userId">
        <el-input v-model="formData.userId" style="width: 160px" placeholder="请输入会员编号" />
      </el-form-item>
      <el-form-item v-show="formData.userType === 2" label="接收人" prop="userId">
        <el-select v-model="formData.userId" placeholder="请选择接收人" filterable clearable>
          <el-option
            v-for="item in userOption"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-for="param in formData.params"
        :key="param"
        :label="'参数 {' + param + '}'"
        :prop="'templateParams.' + param"
      >
        <el-input
          v-model="formData.templateParams[param]"
          :placeholder="'请输入 ' + param + ' 参数'"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getSimpleUserList } from '@/api/system/user'
import { getNotifyTemplate, sendNotify } from '@/api/system/notify/template'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'SystemNotifyTemplateSendForm',
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      formLoading: false,
      formData: this.defaultForm(),
      formRules: {
        userType: [{ required: true, message: '用户类型不能为空', trigger: 'change' }],
        userId: [{ required: true, message: '用户编号不能为空', trigger: 'change' }],
        templateCode: [{ required: true, message: '模版编号不能为空', trigger: 'blur' }],
        templateParams: {}
      },
      userOption: []
    }
  },
  methods: {
    getDictDatas,
    toNumber(value) {
      const number = Number(value)
      return Number.isNaN(number) ? value : number
    },
    defaultForm() {
      return {
        content: '',
        params: [],
        userId: undefined,
        userType: 1,
        templateCode: '',
        templateParams: {}
      }
    },
    /** 打开测试发送弹窗并加载模板详情 */
    open(id) {
      this.dialogVisible = true
      this.reset()
      this.formLoading = true
      getNotifyTemplate(id)
        .then(response => {
          const data = response.data
          const params = data.params
          this.formData.content = data.content
          this.formData.params = params
          this.formData.templateCode = data.code
          this.formData.templateParams = params.reduce((result, item) => {
            result[item] = ''
            return result
          }, {})
          this.formRules.templateParams = params.reduce((result, item) => {
            result[item] = { required: true, message: '参数 ' + item + ' 不能为空', trigger: 'blur' }
            return result
          }, {})
        })
        .finally(() => {
          this.formLoading = false
        })

      // 管理员类型需要从后台用户精简列表中选择接收人。
      getSimpleUserList()
        .then(response => {
          this.userOption = response.data
        })
    },
    cancel() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.formData = this.defaultForm()
      this.formRules.templateParams = {}
      this.formLoading = false
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const payload = {
          userId: this.formData.userId,
          userType: this.toNumber(this.formData.userType),
          templateCode: this.formData.templateCode,
          templateParams: this.formData.templateParams
        }
        sendNotify(payload)
          .then(response => {
            const logId = response.data
            if (logId) {
              this.$modal.msgSuccess('提交发送成功！发送结果，见发送日志编号：' + logId)
            }
            this.dialogVisible = false
          })
          .finally(() => {
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
