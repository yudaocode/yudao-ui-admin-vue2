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
      label="新建在职员工"
      align="center"
      width="180"
    >
      <template slot-scope="scope"><el-switch
        v-model="scope.row.activeVisible"
        :disabled="scope.row.activeVisibleLocked"
      /></template>
    </el-table-column>
    <el-table-column
      label="新建待入职员工"
      align="center"
      width="180"
    >
      <template slot-scope="scope"><el-switch
        v-model="scope.row.pendingEntryVisible"
        :disabled="scope.row.pendingEntryVisibleLocked"
      /></template>
    </el-table-column>
  </el-table>
</template>

<script>
import { getEmployeeCreateFieldConfigList, saveEmployeeCreateFieldConfig } from '@/api/hrm/employee/config'
import { HrmEmployeeEntryStatus } from '@/views/hrm/utils/constants'

export default {
  name: 'HrmEmployeeCreateFieldConfig',
  data() { return { loading: true, list: [] } },
  created() { this.getList() },
  methods: {
    async getList() {
      this.loading = true
      try {
        const responses = await Promise.all([
          getEmployeeCreateFieldConfigList(HrmEmployeeEntryStatus.ACTIVE),
          getEmployeeCreateFieldConfigList(HrmEmployeeEntryStatus.PENDING_ENTRY)
        ])
        const activeFields = responses[0].data
        const pendingEntryFields = responses[1].data
        const pendingMap = new Map(pendingEntryFields.map(field => [field.name, field]))
        this.list = activeFields.map(field => {
          const pending = pendingMap.get(field.name)
          return Object.assign({}, field, {
            activeVisible: field.visible,
            activeVisibleLocked: field.visibleLocked,
            pendingEntryVisible: pending.visible,
            pendingEntryVisibleLocked: pending.visibleLocked
          })
        })
      } finally {
        this.loading = false
      }
    },
    getVisibleFields(field) { return this.list.map(item => ({ name: item.name, visible: item[field] })) },
    async submitForm() {
      await Promise.all([
        saveEmployeeCreateFieldConfig(HrmEmployeeEntryStatus.ACTIVE, this.getVisibleFields('activeVisible')),
        saveEmployeeCreateFieldConfig(HrmEmployeeEntryStatus.PENDING_ENTRY, this.getVisibleFields('pendingEntryVisible'))
      ])
      this.$modal.msgSuccess('保存成功')
      await this.getList()
    }
  }
}
</script>
