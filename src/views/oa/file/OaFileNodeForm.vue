<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item v-if="formType === 'create' || formType === 'rename'" label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" maxlength="255" />
      </el-form-item>
      <el-form-item v-else label="目标目录" prop="parentId">
        <el-select
          v-model="formData.parentId"
          placeholder="请选择目标目录"
          style="width: 100%"
          @change="handleParentChange"
        >
          <el-option
            v-for="item in directoryOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import * as NodeApi from '@/api/oa/file/node'
import { handleTree } from '@/utils/tree'
import { OA_FILE_NODE_TYPE, OA_FILE_PARENT_ID_ROOT } from '@/views/oa/utils/constants'

function createDefaultFormData() {
  return {
    id: undefined,
    name: '',
    parentId: OA_FILE_PARENT_ID_ROOT,
    type: OA_FILE_NODE_TYPE.FOLDER
  }
}

/** 在目录树中查找满足条件的节点 */
function findDirectoryNode(list, predicate) {
  for (const item of list) {
    if (predicate(item)) return item
    if (item.children && item.children.length) {
      const found = findDirectoryNode(item.children, predicate)
      if (found) return found
    }
  }
  return undefined
}

/** 将目录树扁平化为带缩进层级的下拉选项 */
function flattenDirectoryTree(list, depth, result) {
  for (const item of list) {
    result.push({ id: item.id, label: '　'.repeat(depth) + item.name })
    if (item.children && item.children.length) {
      flattenDirectoryTree(item.children, depth + 1, result)
    }
  }
  return result
}

export default {
  name: 'OaFileNodeForm',
  components: { Dialog },
  data() {
    return {
      dialogVisible: false, // 弹窗的是否展示
      dialogTitle: '', // 弹窗的标题
      formLoading: false, // 表单的加载中：1）目录加载；2）提交的按钮禁用
      formType: '', // 表单类型：create - 新建文件夹；rename - 重命名；move - 移动；copy - 复制
      formData: createDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        parentId: [{ required: true, message: '目标目录不能为空', trigger: 'change' }]
      },
      directoryList: [], // 可移动的目录树
      directoryOptions: [] // 扁平化的目录下拉选项
    }
  },
  methods: {
    /** 打开弹窗 */
    open(type, parentId, row) {
      this.dialogVisible = true
      this.dialogTitle = { create: '新建文件夹', move: '移动', copy: '复制', rename: '重命名' }[type] || ''
      this.formType = type
      this.resetForm()
      // 重命名、移动时回显当前节点
      this.formData.id = row && row.id
      this.formData.name = (row && row.name) || ''
      this.formData.parentId = type === 'copy' ? OA_FILE_PARENT_ID_ROOT : parentId
      if (type !== 'move' && type !== 'copy') return
      // 加载目标目录，移除当前节点的整棵子树，避免移动到自身及下级目录
      this.formLoading = true
      return NodeApi.getFileDirectoryList().then(response => {
        this.directoryList = [
          { id: OA_FILE_PARENT_ID_ROOT, name: '我的文件', children: handleTree(response.data) }
        ]
        const parent = findDirectoryNode(this.directoryList, item =>
          (item.children || []).some(child => child.id === (row && row.id))
        )
        if (parent) {
          parent.children = (parent.children || []).filter(item => item.id !== (row && row.id))
        }
        this.directoryOptions = flattenDirectoryTree(this.directoryList, 0, [])
      }).finally(() => {
        this.formLoading = false
      })
    },
    /** 提交表单 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request =
          this.formType === 'create'
            ? NodeApi.createFileNode(this.formData)
            : this.formType === 'move'
              ? NodeApi.updateFileNodeParent(this.formData.id, this.formData.parentId)
              : this.formType === 'copy'
                ? NodeApi.copyFileNode(this.formData.id, this.formData.parentId)
                : NodeApi.updateFileNodeName(this.formData.id, this.formData.name)
        request.then(() => {
          this.$modal.msgSuccess(
            { create: '新增成功', move: '移动成功', copy: '复制成功', rename: '重命名成功' }[this.formType]
          )
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    /** 目标目录变化 */
    handleParentChange() {
      if (this.$refs.form) this.$refs.form.clearValidate('parentId')
    },
    /** 重置表单 */
    resetForm() {
      this.formData = createDefaultFormData()
      this.directoryList = []
      this.directoryOptions = []
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    }
  }
}
</script>
