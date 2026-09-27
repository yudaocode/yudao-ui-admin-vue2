<template>
  <section
    class="backlog-list"
    aria-label="待进入公海的客户"
  >
    <el-card
      shadow="never"
      class="filter-card"
    >
      <div class="list-title">待进入公海的客户</div>
      <el-form
        :inline="true"
        :model="queryParams"
        label-width="68px"
        size="small"
      >
        <el-form-item label="归属">
          <el-select
            v-model="queryParams.sceneType"
            placeholder="归属"
            @change="handleQuery"
          >
            <el-option
              v-for="option in SCENE_TYPES"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <customer-backlog-table
        :loading="loading"
        :list="list"
        :show-pool-day="true"
        @open-detail="openDetail"
      />
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
  </section>
</template>

<script>
import * as CustomerApi from '@/api/crm/customer'
import CustomerBacklogTable from './CustomerBacklogTable.vue'
import { SCENE_TYPES } from './common'

export default {
  name: 'CrmCustomerPutPoolRemindList',
  components: { CustomerBacklogTable },
  data() {
    return {
      SCENE_TYPES,
      loading: false,
      total: 0,
      list: [],
      requestSequence: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        sceneType: 1,
        pool: true
      }
    }
  },
  created() {
    this.getList()
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    async getList() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const page = (await CustomerApi.getPutPoolRemindCustomerPage(this.queryParams)).data
        if (requestId !== this.requestSequence) return
        this.list = page.list
        this.total = page.total
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    openDetail(id) {
      if (!id) return
      this.$router.push({ name: 'CrmCustomerDetail', params: { id }}).catch(() => {})
    }
  }
}
</script>

<style scoped>
.filter-card { margin-bottom: 16px; }
.list-title { margin-bottom: 18px; font-size: 18px; line-height: 24px; font-weight: 500; }
</style>
