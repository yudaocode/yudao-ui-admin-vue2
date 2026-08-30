<template>
  <el-dialog title="请选择监听器" :visible.sync="visible" width="820px" append-to-body>
    <el-table v-loading="loading" :data="list" size="mini" border>
      <el-table-column prop="name" label="名字" min-width="120" />
      <el-table-column prop="event" label="事件" width="90" />
      <el-table-column prop="valueType" label="类型" width="120" />
      <el-table-column prop="value" label="值" min-width="180" show-overflow-tooltip />
      <el-table-column label="操作" width="80"><template slot-scope="scope"><el-button type="text" size="mini" @click="select(scope.row)">选择</el-button></template></el-table-column>
    </el-table>
    <div class="listener-dialog-pagination"><el-pagination background layout="prev, pager, next" :current-page.sync="query.pageNo" :page-size="query.pageSize" :total="total" @current-change="getList" /></div>
  </el-dialog>
</template>
<script>
import { getProcessListenerPage } from '@/api/bpm/processListener'
export default {
  name: 'ProcessListenerDialog',
  data() { return { visible: false, loading: false, list: [], total: 0, query: { pageNo: 1, pageSize: 10, type: 'execution', status: 0 } } },
  methods: {
    open(type) { this.query.pageNo = 1; this.query.type = type || 'execution'; this.visible = true; this.getList() },
    async getList() { this.loading = true; try { const response = await getProcessListenerPage(this.query); const data = response && response.data ? response.data : response; this.list = data && (data.list || data.records) || []; this.total = data && data.total || 0 } finally { this.loading = false } },
    select(row) { this.visible = false; this.$emit('select', row) }
  }
}
</script>
<style scoped>.listener-dialog-pagination { margin-top: 12px; text-align: right }</style>
