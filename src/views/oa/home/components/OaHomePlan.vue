<template>
  <oa-home-panel title="工作计划" v-loading="loading">
    <template slot="actions">
      <el-button type="text" @click="$router.push('/oa/plan/list')">更多</el-button>
    </template>
    <div v-if="loadError" class="load-error">
      加载失败，
      <el-button type="text" @click="getList">重新加载</el-button>
    </div>
    <el-table :data="list" :show-overflow-tooltip="true" size="small">
      <el-table-column align="center" label="类型" width="100">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_PLAN_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="计划标题" min-width="260">
        <template slot-scope="scope">
          <el-button type="text" @click="$router.push('/oa/plan/list')">
            {{ scope.row.title }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" width="100">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_PLAN_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="结束时间"
        prop="endTime"
        :formatter="dateFormatter"
        width="170"
      />
    </el-table>
  </oa-home-panel>
</template>

<script>
import OaHomePanel from './OaHomePanel.vue'
import * as PlanApi from '@/api/oa/plan'
import { dateFormatter } from '@/utils/formatTime'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'OaHomePlan',
  components: { OaHomePanel },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      loadError: false,
      list: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    /** 查询当前区块数据 */
    getList() {
      if (this.loading) return Promise.resolve()
      this.loading = true
      this.loadError = false
      return PlanApi.getPlanPage({ pageNo: 1, pageSize: 2 }).then(response => {
        this.list = response.data.list
      }).catch(() => {
        this.loadError = true
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.load-error {
  margin-bottom: 12px;
  font-size: 13px;
  color: #f56c6c;
}
</style>
