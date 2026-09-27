<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="560px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="130px">
      <el-form-item label="配置名" prop="name"><el-input v-model="formData.name" placeholder="请输入配置名" /></el-form-item>
      <el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" placeholder="请输入备注" /></el-form-item>
      <el-form-item label="存储器" prop="storage">
        <el-select v-model="formData.storage" :disabled="formData.id !== undefined" placeholder="请选择存储器">
          <el-option v-for="dict in getDictDatas(DICT_TYPE.INFRA_FILE_STORAGE)" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.storage >= 10 && formData.storage <= 12" label="基础路径" prop="config.basePath">
        <el-input v-model="formData.config.basePath" placeholder="请输入基础路径" />
      </el-form-item>
      <template v-if="formData.storage >= 11 && formData.storage <= 12">
        <el-form-item label="主机地址" prop="config.host"><el-input v-model="formData.config.host" placeholder="请输入主机地址" /></el-form-item>
        <el-form-item label="主机端口" prop="config.port"><el-input-number v-model="formData.config.port" :min="0" placeholder="请输入主机端口" /></el-form-item>
        <el-form-item label="用户名" prop="config.username"><el-input v-model="formData.config.username" placeholder="请输入用户名" /></el-form-item>
        <el-form-item label="密码" prop="config.password"><el-input v-model="formData.config.password" type="password" show-password placeholder="请输入密码" /></el-form-item>
      </template>
      <el-form-item v-if="formData.storage === 11" label="连接模式" prop="config.mode">
        <el-radio-group v-model="formData.config.mode"><el-radio label="Active">主动模式</el-radio><el-radio label="Passive">被动模式</el-radio></el-radio-group>
      </el-form-item>
      <template v-if="formData.storage === 20">
        <el-form-item label="节点地址" prop="config.endpoint"><el-input v-model="formData.config.endpoint" placeholder="请输入节点地址" /></el-form-item>
        <el-form-item label="存储 bucket" prop="config.bucket"><el-input v-model="formData.config.bucket" placeholder="请输入 bucket" /></el-form-item>
        <el-form-item label="accessKey" prop="config.accessKey"><el-input v-model="formData.config.accessKey" placeholder="请输入 accessKey" /></el-form-item>
        <el-form-item label="accessSecret" prop="config.accessSecret"><el-input v-model="formData.config.accessSecret" type="password" show-password placeholder="请输入 accessSecret" /></el-form-item>
        <el-form-item label="是否 Path Style" prop="config.enablePathStyleAccess">
          <el-radio-group v-model="formData.config.enablePathStyleAccess"><el-radio :label="true">启用</el-radio><el-radio :label="false">禁用</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="公开访问" prop="config.enablePublicAccess">
          <el-radio-group v-model="formData.config.enablePublicAccess"><el-radio :label="true">公开</el-radio><el-radio :label="false">私有</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="区域"><el-input v-model="formData.config.region" placeholder="请填写区域，一般仅 AWS 需要填写" /></el-form-item>
        <el-form-item label="自定义域名"><el-input v-model="formData.config.domain" placeholder="请输入自定义域名" /></el-form-item>
      </template>
      <el-form-item v-else-if="formData.storage" label="自定义域名" prop="config.domain">
        <el-input v-model="formData.config.domain" placeholder="请输入自定义域名" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { createFileConfig, getFileConfig, updateFileConfig } from '@/api/infra/fileConfig'

export default {
  name: 'InfraFileConfigForm',
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      dialogTitle: '',
      formType: 'create',
      formLoading: false,
      formData: this.defaultForm(),
      formRules: {
        name: [{ required: true, message: '配置名不能为空', trigger: 'blur' }],
        storage: [{ required: true, message: '存储器不能为空', trigger: 'change' }],
        // Element UI's async-validator expects nested paths as dotted keys.
        'config.basePath': [{ required: true, message: '基础路径不能为空', trigger: 'blur' }],
        'config.host': [{ required: true, message: '主机地址不能为空', trigger: 'blur' }],
        'config.port': [{ required: true, message: '主机端口不能为空', trigger: 'blur' }],
        'config.username': [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        'config.password': [{ required: true, message: '密码不能为空', trigger: 'blur' }],
        'config.mode': [{ required: true, message: '连接模式不能为空', trigger: 'change' }],
        'config.endpoint': [{ required: true, message: '节点地址不能为空', trigger: 'blur' }],
        'config.bucket': [{ required: true, message: '存储 bucket 不能为空', trigger: 'blur' }],
        'config.accessKey': [{ required: true, message: 'accessKey 不能为空', trigger: 'blur' }],
        'config.accessSecret': [{ required: true, message: 'accessSecret 不能为空', trigger: 'blur' }],
        'config.enablePathStyleAccess': [{ required: true, message: '是否 Path Style 不能为空', trigger: 'change' }],
        'config.enablePublicAccess': [{ required: true, message: '公开访问设置不能为空', trigger: 'change' }],
        'config.domain': [{ required: true, message: '自定义域名不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    defaultConfig() {
      return {
        basePath: '',
        host: '',
        port: undefined,
        username: '',
        password: '',
        mode: '',
        endpoint: '',
        bucket: '',
        accessKey: '',
        accessSecret: '',
        enablePathStyleAccess: undefined,
        enablePublicAccess: undefined,
        region: '',
        domain: ''
      }
    },
    defaultForm() {
      return { id: undefined, name: '', storage: undefined, remark: '', config: this.defaultConfig() }
    },
    open(type, id) {
      this.dialogVisible = true
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改文件配置' : '添加文件配置'
      this.formData = this.defaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id !== undefined && id !== null) {
        this.formLoading = true
        return getFileConfig(id).then(response => {
          this.formData = response.data
        }).finally(() => { this.formLoading = false })
      }
    },
    cancel() {
      this.dialogVisible = false
      this.formData = this.defaultForm()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create' ? createFileConfig(this.formData) : updateFileConfig(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => { this.formLoading = false })
      })
    }
  }
}
</script>
