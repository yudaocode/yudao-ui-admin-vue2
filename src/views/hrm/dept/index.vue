<template>
  <div class="app-container hrm-dept-page">
    <doc-alert title="【组织】工作台、组织架构" url="https://doc.iocoder.cn/hrm/organization/" />
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryParams" size="small" @submit.native.prevent>
        <el-form-item label="部门名称"><el-input v-model="queryParams.name" clearable placeholder="请输入部门名称" @keyup.enter.native="handleQuery" /></el-form-item>
        <el-form-item><el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button><el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button><el-button v-hasPermi="['system:dept:create']" type="primary" plain icon="el-icon-plus" @click="openDeptManagement">新建部门</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never"><el-alert title="人数格式为：直属人数（包含下级部门人数）" type="info" :closable="false" show-icon class="statistics-tip" /><el-table v-loading="loading" :data="filteredDeptList" row-key="id" default-expand-all stripe>
      <el-table-column label="部门名称" min-width="280"><template slot-scope="scope"><el-link type="primary" :underline="false" @click="openDetail(scope.row.id)">{{ scope.row.name }}</el-link></template></el-table-column>
      <el-table-column label="在职员工" align="center" min-width="150"><template slot-scope="scope">{{ formatStatistics(scope.row.directStatistics, scope.row.totalStatistics, 'activeCount') }}</template></el-table-column>
      <el-table-column label="全职员工" align="center" min-width="150"><template slot-scope="scope">{{ formatStatistics(scope.row.directStatistics, scope.row.totalStatistics, 'fullTimeCount') }}</template></el-table-column>
      <el-table-column label="非全职人数" align="center" min-width="150"><template slot-scope="scope">{{ formatStatistics(scope.row.directStatistics, scope.row.totalStatistics, 'nonFullTimeCount') }}</template></el-table-column>
    </el-table></el-card>
  </div>
</template>
<script>
import { getSimpleDeptList } from '@/api/system/dept'
import { getEmployeeDeptStatistics } from '@/api/hrm/employee'
const EMPTY = { activeCount: 0, fullTimeCount: 0, nonFullTimeCount: 0 }
export default {
  name: 'HrmDept',
  data() { return { loading: false, deptTree: [], appliedName: '', queryParams: { name: '' }} },
  computed: { filteredDeptList() { return this.filterDeptTree(this.deptTree, this.appliedName) } },
  created() { this.getList() },
  methods: {
    async getList() {
      this.loading = true
      try {
        const responses = await Promise.all([getSimpleDeptList(), getEmployeeDeptStatistics()])
        this.deptTree = this.buildDeptTree((responses[0] && responses[0].data) || [], (responses[1] && responses[1].data) || [])
      } finally { this.loading = false }
    },
    buildDeptTree(deptList, statisticsList) {
      const build = (dept) => {
        const children = Array.isArray(dept.children) ? dept.children.map(build) : []
        const directStatistics = statisticsList.find((item) => String(item.deptId) === String(dept.id)) || { ...EMPTY }
        const totalStatistics = children.reduce((sum, child) => ({ activeCount: sum.activeCount + child.totalStatistics.activeCount, fullTimeCount: sum.fullTimeCount + child.totalStatistics.fullTimeCount, nonFullTimeCount: sum.nonFullTimeCount + child.totalStatistics.nonFullTimeCount }), { ...directStatistics })
        return { ...dept, children, directStatistics, totalStatistics }
      }
      const tree = this.handleTree(Array.isArray(deptList) ? deptList : [], 'id')
      return (Array.isArray(tree) ? tree : []).map(build)
    },
    filterDeptTree(list, name) {
      const keyword = String(name || '').trim()
      if (!keyword) return list
      return (list || []).reduce((result, dept) => { const children = this.filterDeptTree(dept.children || [], keyword); if (String(dept.name || '').includes(keyword) || children.length) result.push({ ...dept, children }); return result }, [])
    },
    formatStatistics(direct, total, field) { const d = direct && direct[field] !== undefined ? direct[field] : 0; const t = total && total[field] !== undefined ? total[field] : d; return `${d}（${t}）` },
    handleQuery() { this.appliedName = this.queryParams.name },
    resetQuery() { this.queryParams.name = ''; this.appliedName = '' },
    openDeptManagement() { this.$router.push('/system/dept') },
    openDetail(id) { this.$router.push({ name: 'HrmDeptDetail', params: { id }}) }
  }
}
</script>
<style scoped>.search-card { margin-bottom: 16px; }.statistics-tip { margin-bottom: 12px; }</style>
