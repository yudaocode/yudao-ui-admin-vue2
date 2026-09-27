<template>
  <div class="app-container">
    <doc-alert
      title="【员工】员工管理"
      url="https://doc.iocoder.cn/hrm/employee/"
    />
    <el-card shadow="never">
      <div class="config-wrap">
        <el-tabs v-model="activeTab">
          <el-tab-pane
            label="新建员工字段设置"
            name="create"
          ><employee-create-field-config ref="createFieldConfig" /></el-tab-pane>
          <el-tab-pane
            label="员工档案设置"
            name="archive"
          ><employee-archive-field-config ref="archiveFieldConfig" /></el-tab-pane>
        </el-tabs>
        <el-button
          v-hasPermi="['hrm:employee:config:update']"
          class="save-button"
          type="primary"
          :loading="saving"
          @click="submitForm"
        >
          <i class="el-icon-check" /> 保存
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import EmployeeArchiveFieldConfig from './EmployeeArchiveFieldConfig.vue'
import EmployeeCreateFieldConfig from './EmployeeCreateFieldConfig.vue'

export default {
  name: 'HrmEmployeeConfig',
  components: { EmployeeArchiveFieldConfig, EmployeeCreateFieldConfig },
  data() { return { activeTab: 'create', saving: false } },
  methods: {
    async submitForm() {
      this.saving = true
      try {
        if (this.activeTab === 'create') await this.$refs.createFieldConfig.submitForm()
        else await this.$refs.archiveFieldConfig.submitForm()
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.config-wrap { position: relative; }
.save-button { position: absolute; top: 0; right: 0; }
</style>
