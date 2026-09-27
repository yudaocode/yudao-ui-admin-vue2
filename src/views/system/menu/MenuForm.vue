<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="上级菜单"><treeselect v-model="formData.parentId" :options="menuTree" :normalizer="normalizer" placeholder="请选择上级菜单" /></el-form-item>
      <el-form-item label="菜单名称" prop="name"><el-input v-model="formData.name" clearable placeholder="请输入菜单名称" /></el-form-item>
      <el-form-item label="菜单类型" prop="type"><el-radio-group v-model="formData.type"><el-radio v-for="dict in menuTypeDictDatas" :key="dict.value" :label="Number(dict.value)">{{ dict.label }}</el-radio></el-radio-group></el-form-item>
      <el-form-item v-if="formData.type !== 3" label="菜单图标"><IconSelect v-model="formData.icon" /></el-form-item>
      <el-form-item v-if="formData.type !== 3" label="路由地址" prop="path"><el-input v-model="formData.path" clearable placeholder="请输入路由地址" /></el-form-item>
      <el-form-item v-if="formData.type === 2" label="组件地址" prop="component"><el-input v-model="formData.component" clearable placeholder="例如说：system/user/index" /></el-form-item>
      <el-form-item v-if="formData.type === 2" label="组件名字" prop="componentName"><el-input v-model="formData.componentName" clearable placeholder="例如说：SystemUser" /></el-form-item>
      <el-form-item v-if="formData.type !== 1" label="权限标识"><el-input v-model="formData.permission" clearable placeholder="请输入权限标识" /></el-form-item>
      <el-form-item label="显示排序" prop="sort"><el-input-number v-model="formData.sort" :min="0" controls-position="right" /></el-form-item>
      <el-form-item label="菜单状态" prop="status"><el-radio-group v-model="formData.status"><el-radio v-for="dict in statusDictDatas" :key="dict.value" :label="Number(dict.value)">{{ dict.label }}</el-radio></el-radio-group></el-form-item>
      <el-form-item v-if="formData.type !== 3" label="显示状态"><el-radio-group v-model="formData.visible"><el-radio :label="true">显示</el-radio><el-radio :label="false">隐藏</el-radio></el-radio-group></el-form-item>
      <el-form-item v-if="formData.type !== 3" label="总是显示"><el-radio-group v-model="formData.alwaysShow"><el-radio :label="true">总是</el-radio><el-radio :label="false">不是</el-radio></el-radio-group></el-form-item>
      <el-form-item v-if="formData.type === 2" label="缓存状态"><el-radio-group v-model="formData.keepAlive"><el-radio :label="true">缓存</el-radio><el-radio :label="false">不缓存</el-radio></el-radio-group></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer"><el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></div>
  </el-dialog>
</template>
<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'
import { getMenu, getSimpleMenusList, createMenu, updateMenu } from '@/api/system/menu'
import { CommonStatusEnum, SystemMenuTypeEnum } from '@/utils/constants'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { isExternal } from '@/utils/validate'
import { handleTree } from '@/utils/tree'

export default {
  name: 'SystemMenuForm',
  components: { Treeselect, IconSelect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formType: 'create',
      formLoading: false,
      formData: this.defaultForm(),
      menuTree: [],
      menuTypeDictDatas: getDictDatas(DICT_TYPE.SYSTEM_MENU_TYPE),
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      formRules: {
        name: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '菜单类型不能为空', trigger: 'change' }],
        sort: [{ required: true, message: '菜单顺序不能为空', trigger: 'change' }],
        path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return {
        id: undefined, name: '', permission: '', type: SystemMenuTypeEnum.DIR,
        sort: 0, parentId: 0, path: '', icon: '', component: '', componentName: '',
        status: CommonStatusEnum.ENABLE, visible: true, keepAlive: true, alwaysShow: true
      }
    },
    normalizer(node) {
      return { id: node.id, label: node.name, children: node.children }
    },
    open(type, id, parentId) {
      this.dialogVisible = true
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改菜单' : '添加菜单'
      this.formData = this.defaultForm()
      if (parentId !== undefined && parentId !== null) this.formData.parentId = parentId
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      getSimpleMenusList().then(response => {
        this.menuTree = [{ id: 0, name: '主类目', children: handleTree(response.data, 'id') }]
      })
      if (id !== undefined && id !== null) {
        this.formLoading = true
        getMenu(id).then(response => {
          this.formData = response.data
        }).finally(() => { this.formLoading = false })
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const path = this.formData.path || ''
        if ((this.formData.type === SystemMenuTypeEnum.DIR || this.formData.type === SystemMenuTypeEnum.MENU) && !isExternal(path)) {
          if (this.formData.parentId === 0 && path.charAt(0) !== '/') {
            this.$modal.msgError('路径必须以 / 开头')
            return
          }
          if (this.formData.parentId !== 0 && path.charAt(0) === '/') {
            this.$modal.msgError('路径不能以 / 开头')
            return
          }
        }
        this.formLoading = true
        const request = this.formType === 'create' ? createMenu(this.formData) : updateMenu(this.formData)
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
