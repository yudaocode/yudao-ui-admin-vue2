4<template>
  <div>
    <el-select
      filterable
      placeholder="请选择租户"
      style="width: 180px"
      v-model="value"
      @change="handleChange"
      clearable
    >
      <el-option v-for="item in tenants" :key="item.id" :label="item.name" :value="item.id" />
    </el-select>
  </div>
</template>

<script>
import { getTenantList } from '@/api/system/tenant'
import { getVisitTenantId, setVisitTenantId } from '@/utils/auth'

export default {
  name: 'TenantVisit',
  data() {
    return {
      value: getVisitTenantId() ? Number(getVisitTenantId()) : undefined, // 当前选中的租户 ID
      tenants: [] // 租户列表
    }
  },
  methods: {
    handleChange(id) {
      // 设置访问租户 ID
      setVisitTenantId(id)
      // 关闭其他标签页，只保留当前页
      this.$tab.closeOtherPage();
      // 刷新当前页面
      this.$tab.refreshPage();
      // 提示切换成功
      const tenant = this.tenants.find((item) => item.id === id)
      if (tenant) {
        this.$message.success(`切换当前租户为: ${tenant.name}`)
      }
    }
  },
  async mounted() {
    try {
      const response = await getTenantList()
      this.tenants = response.data || []
    } catch (error) {
      console.error('获取租户列表失败:', error)
    }
  }
}
</script>
