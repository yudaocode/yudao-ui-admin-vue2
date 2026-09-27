<template>
  <el-table
    v-loading="loading"
    :data="list"
    border
  >
    <el-table-column
      label="字段分组"
      prop="groupName"
      width="180"
    />
    <el-table-column
      label="字段名称"
      prop="title"
      min-width="220"
    />
    <el-table-column
      label="员工是否可见"
      align="center"
      width="160"
    >
      <template slot-scope="scope">
        <el-switch
          v-model="scope.row.visible"
          :disabled="scope.row.visibleLocked"
          @change="handleVisibleChange(scope.row)"
        />
      </template>
    </el-table-column>
    <el-table-column
      label="员工是否可编辑"
      align="center"
      width="160"
    >
      <template slot-scope="scope">
        <el-switch
          v-model="scope.row.editable"
          :disabled="!scope.row.visible || scope.row.editableLocked"
          @change="handleEditableChange(scope.row)"
        />
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { getEmployeeArchiveFieldConfigList, saveEmployeeArchiveFieldConfig } from '@/api/hrm/employee/config'

export default {
  name: 'HrmEmployeeArchiveFieldConfig',
  data() { return { loading: true, list: [] } },
  created() { this.getList() },
  methods: {
    async getList() {
      this.loading = true
      try {
        const response = await getEmployeeArchiveFieldConfigList()
        this.list = response.data
      } finally {
        this.loading = false
      }
    },
    handleVisibleChange(field) { if (!field.visible) field.editable = false },
    handleEditableChange(field) { if (field.editable) field.visible = true },
    async submitForm() {
      await saveEmployeeArchiveFieldConfig(this.list)
      this.$modal.msgSuccess('保存成功')
      await this.getList()
    }
  }
}
</script>
