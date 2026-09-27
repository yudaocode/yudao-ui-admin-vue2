<template>
  <div v-loading="loading" class="dept-details-header">
    <div class="dept-details-header__top">
      <div class="dept-details-header__identity">
        <div class="dept-details-header__name">
          <span>{{ dept.name || '-' }}</span>
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="dept.status" />
        </div>
        <div class="dept-details-header__number">部门编号：{{ dept.id || '-' }}</div>
      </div>
      <div><slot /></div>
    </div>
    <el-card shadow="never" class="dept-details-header__statistics">
      <el-descriptions :column="5" direction="vertical">
        <el-descriptions-item label="上级部门">{{ parentDeptName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="部门负责人">{{ leaderUserName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="在职员工">{{ statistics.activeCount }}</el-descriptions-item>
        <el-descriptions-item label="全职员工">{{ statistics.fullTimeCount }}</el-descriptions-item>
        <el-descriptions-item label="非全职人数">{{ statistics.nonFullTimeCount }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'HrmDeptDetailsHeader',
  props: {
    dept: { type: Object, required: true },
    parentDeptName: { type: String, default: undefined },
    leaderUserName: { type: String, default: undefined },
    statistics: { type: Object, required: true },
    loading: { type: Boolean, required: true }
  },
  data() {
    return { DICT_TYPE }
  }
}
</script>

<style scoped>
.dept-details-header__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.dept-details-header__identity { min-width: 0; }
.dept-details-header__name { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; color: #303133; font-size: 20px; font-weight: 700; word-break: break-all; }
.dept-details-header__number { margin-top: 6px; color: #909399; font-size: 14px; }
.dept-details-header__statistics { margin-top: 10px; }
</style>
