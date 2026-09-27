<template>
  <el-dialog
    title="部门选择"
    :visible.sync="dialogVisible"
    width="600px"
    append-to-body
  >
    <el-row v-loading="formLoading">
      <el-col :span="24">
        <el-card shadow="never" :body-style="{ padding: '10px' }" style="height: 360px; overflow: auto">
          <el-tree
            ref="treeRef"
            :data="deptTree"
            :props="defaultProps"
            show-checkbox
            :check-strictly="checkStrictly"
            check-on-click-node
            default-expand-all
            highlight-current
            node-key="id"
            @check="handleCheck"
          />
        </el-card>
      </el-col>
    </el-row>
    <div slot="footer">
      <el-button
        :disabled="formLoading || !selectedDeptIds.length"
        type="primary"
        @click="submitForm"
      >
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
/**
 * DeptSelectForm 部门选择弹窗（Vue3 版本移植）
 * 通过 ref.open(selectedList?) 打开，选择完成后 emit('confirm', deptList)
 */
import { getSimpleDeptList } from '@/api/system/dept'
import { handleTree } from '@/utils/ruoyi'

export default {
  name: 'DeptSelectForm',
  props: {
    // 是否严格的遵循父子不互相关联
    checkStrictly: {
      type: Boolean,
      default: false
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      deptTree: [], // 部门树形结构
      selectedDeptIds: [], // 选中的部门 ID 列表
      dialogVisible: false, // 弹窗的是否展示
      formLoading: false // 表单的加载中
    }
  },
  methods: {
    /** 打开弹窗 */
    async open(selectedList) {
      this.resetForm()
      this.formLoading = true
      try {
        // 加载部门列表
        const deptResp = await getSimpleDeptList()
        this.deptTree = handleTree(deptResp.data || [], 'id')
      } finally {
        this.formLoading = false
      }
      this.dialogVisible = true
      // 设置已选择的部门
      if (selectedList && selectedList.length) {
        await this.$nextTick()
        const selectedIds = selectedList
          .map((dept) => dept.id)
          .filter((id) => id !== undefined)
        this.selectedDeptIds = selectedIds
        this.$refs.treeRef.setCheckedKeys(selectedIds)
      }
    },

    /** 处理选中状态变化 */
    handleCheck(_data, _checked) {
      this.selectedDeptIds = this.$refs.treeRef.getCheckedKeys()
      if (!this.multiple && this.selectedDeptIds.length > 1) {
        // 单选模式下，只保留最后选择的节点
        const lastSelectedId = this.selectedDeptIds[this.selectedDeptIds.length - 1]
        this.selectedDeptIds = [lastSelectedId]
        this.$refs.treeRef.setCheckedKeys([lastSelectedId])
      }
    },

    /** 提交选择 */
    async submitForm() {
      // 获取选中的完整部门数据
      const checkedNodes = this.$refs.treeRef.getCheckedNodes()
      this.$modal.msgSuccess('选择成功')
      this.dialogVisible = false
      this.$emit('confirm', checkedNodes)
    },

    /** 重置表单 */
    resetForm() {
      this.deptTree = []
      this.selectedDeptIds = []
      if (this.$refs.treeRef) {
        this.$refs.treeRef.setCheckedKeys([])
      }
    }
  }
}
</script>
