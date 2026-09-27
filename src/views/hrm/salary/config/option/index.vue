<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="option-header">
        <el-tabs v-model="activeTab" class="option-tabs">
          <el-tab-pane label="企业可选项" name="enterprise" />
          <el-tab-pane label="系统默认项" name="system" />
        </el-tabs>
        <el-button
          v-hasPermi="['hrm:salary:option:update']"
          icon="el-icon-refresh"
          @click="handleSync"
        >同步标准薪资项</el-button>
      </div>
      <el-table
        v-loading="loading"
        :data="activeList"
        :tree-props="{ children: 'children' }"
        default-expand-all
        row-key="id"
      >
        <el-table-column label="薪资项" min-width="220" prop="name" show-overflow-tooltip />
        <el-table-column align="center" label="类型" width="100">
          <template slot-scope="scope">
            <el-tag v-if="isCategory(scope.row)" type="info">分类</el-tag>
            <el-tag v-else-if="scope.row.templateId" type="warning">标准项</el-tag>
            <el-tag v-else>自定义项</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="加减类型" prop="type" width="100">
          <template slot-scope="scope">
            <dict-tag
              v-if="!isCategory(scope.row) && scope.row.type !== HrmSalaryOptionType.CALCULATED"
              :type="DICT_TYPE.HRM_SALARY_OPTION_TYPE"
              :value="scope.row.type"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="计税" prop="taxEnabled" width="90">
          <template slot-scope="scope">
            <dict-tag
              v-if="!isCategory(scope.row)"
              :type="DICT_TYPE.HRM_SALARY_YES_NO"
              :value="scope.row.taxEnabled ? 1 : 0"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="activeTab === 'enterprise' ? '分类状态' : '显示状态'"
          width="100"
        >
          <template slot-scope="scope">
            <el-switch
              v-if="activeTab === 'enterprise' && isOptionalCategory(scope.row)"
              v-model="scope.row.enabled"
              @change="handleUpdateEnabled(scope.row)"
            />
            <el-switch
              v-else-if="activeTab === 'system' && isSystemStandardOption(scope.row)"
              v-model="scope.row.visible"
              @change="handleUpdateVisible(scope.row)"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="180" prop="remark" show-overflow-tooltip />
        <el-table-column
          v-if="activeTab === 'enterprise'"
          align="center"
          fixed="right"
          label="操作"
          width="150"
        >
          <template slot-scope="scope">
            <template v-if="isOptionalCategory(scope.row)">
              <el-dropdown
                v-if="scope.row.enabled"
                v-hasPermi="['hrm:salary:option:create']"
                trigger="click"
                @command="handleAddOption($event, scope.row)"
              >
                <el-button type="text">
                  <i class="el-icon-plus" />添加薪资项<i class="el-icon-arrow-down el-icon--right" />
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="option in getInactiveStandardOptions(scope.row)"
                    :key="option.code"
                    :command="option.code"
                  >{{ option.name }}</el-dropdown-item>
                  <el-dropdown-item
                    command="custom"
                    :divided="getInactiveStandardOptions(scope.row).length > 0"
                  >自定义薪资项</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <span v-else>-</span>
            </template>
            <el-button
              v-else-if="isEnterpriseOption(scope.row)"
              v-hasPermi="['hrm:salary:option:delete']"
              type="text"
              class="danger-text"
              @click="handleDelete(scope.row)"
            >删除</el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <salary-option-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { handleTree } from '@/utils/tree'
import {
  deleteSalaryOption,
  getSalaryOptionList,
  syncSalaryOption,
  updateSalaryOptionEnabled,
  updateSalaryOptionVisible
} from '@/api/hrm/salary/config/option'
import { HrmSalaryOptionType } from '@/views/hrm/utils/constants'
import SalaryOptionForm from './SalaryOptionForm.vue'

export default {
  name: 'HrmSalaryOption',
  components: { SalaryOptionForm },
  data() {
    return {
      DICT_TYPE,
      HrmSalaryOptionType,
      loading: false,
      list: [],
      activeTab: 'enterprise'
    }
  },
  computed: {
    enterpriseOptionList() {
      return this.list
        .filter(item => !item.systemFlag)
        .map(item => ({
          ...item,
          children: item.enabled ? (item.children || []).filter(child => child.enabled) : []
        }))
    },
    systemOptionList() {
      return this.list.filter(item => item.systemFlag)
    },
    activeList() {
      return this.activeTab === 'enterprise' ? this.enterpriseOptionList : this.systemOptionList
    }
  },
  created() {
    this.getList()
  },
  methods: {
    isCategory(option) {
      return !option.parentCode
    },
    isOptionalCategory(option) {
      return this.isCategory(option) && Boolean(option.templateId) && !option.systemFlag
    },
    isEnterpriseOption(option) {
      return !this.isCategory(option) && !option.systemFlag
    },
    isSystemStandardOption(option) {
      return !this.isCategory(option) && Boolean(option.templateId) && option.systemFlag
    },
    getInactiveStandardOptions(category) {
      const sourceCategory = this.list.find(item => item.id === category.id)
      return sourceCategory
        ? (sourceCategory.children || []).filter(item => item.templateId && !item.enabled)
        : []
    },
    async getList() {
      this.loading = true
      try {
        const response = await getSalaryOptionList()
        this.list = handleTree(response.data, 'code', 'parentCode')
      } finally {
        this.loading = false
      }
    },
    openForm(parentCode) {
      this.$refs.form.open(parentCode)
    },
    async handleAddOption(command, category) {
      if (command === 'custom') {
        this.openForm(category.code)
        return
      }
      const option = this.getInactiveStandardOptions(category).find(item => item.code === command)
      if (!option) return
      await updateSalaryOptionEnabled(option.id, true)
      this.$modal.msgSuccess(this.$t('common.createSuccess'))
      await this.getList()
    },
    async handleUpdateEnabled(option) {
      try {
        await updateSalaryOptionEnabled(option.id, option.enabled)
        this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        await this.getList()
      } catch (error) {
        await this.getList()
      }
    },
    async handleUpdateVisible(option) {
      try {
        await updateSalaryOptionVisible(option.id, option.visible)
        this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        await this.getList()
      } catch (error) {
        await this.getList()
      }
    },
    async handleSync() {
      await syncSalaryOption()
      this.$modal.msgSuccess(this.$t('common.updateSuccess'))
      await this.getList()
    },
    async handleDelete(option) {
      try {
        await this.$modal.confirm()
        if (option.templateId) {
          await updateSalaryOptionEnabled(option.id, false)
        } else {
          await deleteSalaryOption(option.id)
        }
        this.$modal.msgSuccess(this.$t('common.delSuccess'))
        await this.getList()
      } catch (error) {}
    }
  }
}
</script>

<style scoped>
.option-header { display: flex; align-items: flex-start; justify-content: space-between; }
.option-tabs { flex: 1; margin-right: 16px; }
.danger-text { color: #f56c6c; }
</style>
