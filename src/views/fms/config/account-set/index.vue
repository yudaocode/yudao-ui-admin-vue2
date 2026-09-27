<template>
  <div class="app-container">
    <doc-alert title="【设置】账套管理、财务参数、财务指标" url="https://doc.iocoder.cn/fms/config/account-set/" />
    <el-form :inline="true"><el-form-item><el-button type="primary" plain icon="el-icon-plus" @click="openForm('create')" v-hasPermi="['fms:config:account-set:create']">新增</el-button></el-form-item></el-form>
    <el-table v-loading="loading" :data="list" border>
      <el-table-column label="账套名称" min-width="220" prop="companyName"><template slot-scope="scope">{{ scope.row.companyName }} <el-tag v-if="scope.row.defaultStatus" size="mini">默认</el-tag></template></el-table-column>
      <el-table-column label="公司编码" prop="companyCode" align="center" min-width="140" />
      <el-table-column label="联系人" prop="contactName" align="center" />
      <el-table-column label="手机号码" prop="mobile" align="center" />
      <el-table-column label="启用期间" prop="startTime" align="center"><template slot-scope="scope">{{ formatPeriod(scope.row.startTime) }}</template></el-table-column>
      <el-table-column label="账套状态" prop="initialized" align="center"><template slot-scope="scope"><el-tag v-if="scope.row.initialized" type="success">已启用</el-tag><el-tag v-else type="info">待初始化</el-tag></template></el-table-column>
      <el-table-column label="创建时间" prop="createTime" align="center"><template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="220"><template slot-scope="scope"><el-button v-if="scope.row.level === FmsAccountUserLevelEnum.OWNER" v-hasPermi="['fms:config:account-set:update']" type="text" @click="openForm('update', scope.row.id)">编辑</el-button><el-button v-if="scope.row.level === FmsAccountUserLevelEnum.OWNER" v-hasPermi="['fms:config:account-set:authorize']" type="text" @click="openMemberForm(scope.row)">授权</el-button><el-button v-if="!scope.row.initialized && scope.row.level !== FmsAccountUserLevelEnum.READ" v-hasPermi="['fms:config:account-set:initialize']" type="text" @click="openInitializeForm(scope.row)">开始记账</el-button></template></el-table-column>
    </el-table>
    <FmsAccountSetForm ref="form" @success="getList" /><FmsAccountSetInitializeForm ref="initializeForm" @success="getList" /><FmsAccountSetMemberForm ref="memberForm" @success="getList" />
  </div>
</template>
<script>
import { getAccountSetList } from '@/api/fms/config/account-set'
import { FmsAccountUserLevelEnum } from '@/api/fms/config/account-user'
import { useFmsStore } from '@/views/fms/store/fms'

import FmsAccountSetForm from './FmsAccountSetForm.vue'
import FmsAccountSetInitializeForm from './FmsAccountSetInitializeForm.vue'
import FmsAccountSetMemberForm from './FmsAccountSetMemberForm.vue'
export default {
  name: 'FmsAccountSet', components: { FmsAccountSetForm, FmsAccountSetInitializeForm, FmsAccountSetMemberForm },
  data() { return { FmsAccountUserLevelEnum, fmsStore: useFmsStore(), loading: false, list: [] } },
  created() { this.getList() },
  methods: {
    getList() {
      this.loading = true
      return getAccountSetList().then(response => {
        const rows = response.data
        this.list = rows
        if (this.fmsStore.getAccountSetId &&
          !this.list.some(item => item.id === this.fmsStore.getAccountSetId)) {
          this.fmsStore.clearAccountSet()
        }
      }).finally(() => { this.loading = false })
    },
    openForm(type, id) { this.$refs.form.open(type, id) },
    openInitializeForm(row) { this.$refs.initializeForm.open(row) },
    openMemberForm(row) { this.$refs.memberForm.open(row) },
    formatPeriod(value) { if (!value) return '-'; const text = String(value); return text.length === 6 ? text.slice(0, 4) + '-' + text.slice(4) : text }
  }
}
</script>
