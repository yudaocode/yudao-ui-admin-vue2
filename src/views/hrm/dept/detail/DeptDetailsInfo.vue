<template>
  <el-card shadow="never">
    <el-collapse v-model="activeNames">
      <el-collapse-item name="basicInfo">
        <template slot="title"><span class="section-title">基本信息</span></template>
        <el-descriptions :column="3">
          <el-descriptions-item label="部门名称">{{ dept.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="上级部门">{{ parentDeptName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="部门负责人">{{ leaderUserName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="显示排序">{{ dept.sort == null ? '-' : dept.sort }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ dept.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ dept.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="dept.status" />
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ dept.createTime ? parseTime(dept.createTime) : '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'

export default {
  name: 'HrmDeptDetailsInfo',
  props: {
    dept: { type: Object, required: true },
    parentDeptName: { type: String, default: undefined },
    leaderUserName: { type: String, default: undefined }
  },
  data() {
    return {
      DICT_TYPE,
      activeNames: ['basicInfo']
    }
  },
  methods: { parseTime }
}
</script>

<style scoped>
.section-title { color: #303133; font-size: 16px; font-weight: 700; }
</style>
