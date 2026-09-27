<template>
  <div class="app-container">
    <doc-alert
      title="【营销】拼团活动"
      url="https://doc.iocoder.cn/mall/promotion-combination/"
    />

    <!-- 统计信息 -->
    <el-row
      :gutter="12"
      class="summary-row"
    >
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        class="summary-col"
      >
        <div class="summary-card">
          <div class="summary-icon summary-icon--users">
            <svg-icon icon-class="peoples" />
          </div>
          <div class="summary-content">
            <div class="summary-title">参与人数(个)</div>
            <count-to
              :start-val="0"
              :end-val="recordSummary.userCount"
              :duration="2600"
            />
          </div>
        </div>
      </el-col>
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        class="summary-col"
      >
        <div class="summary-card">
          <div class="summary-icon summary-icon--success">
            <svg-icon icon-class="people" />
          </div>
          <div class="summary-content">
            <div class="summary-title">成团数量(个)</div>
            <count-to
              :start-val="0"
              :end-val="recordSummary.successCount"
              :duration="2600"
            />
          </div>
        </div>
      </el-col>
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        class="summary-col"
      >
        <div class="summary-card">
          <div class="summary-icon summary-icon--virtual">
            <svg-icon icon-class="user" />
          </div>
          <div class="summary-content">
            <div class="summary-title">虚拟成团(个)</div>
            <count-to
              :start-val="0"
              :end-val="recordSummary.virtualGroupCount"
              :duration="2600"
            />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 搜索工作栏 -->
    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
    >
      <el-form-item
        label="创建时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          :picker-options="recordDatePickerOptions"
          class="query-control"
        />
      </el-form-item>
      <el-form-item
        label="拼团状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="全部"
          clearable
          class="query-control"
        >
          <el-option
            v-for="dict in getStatusOptions()"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <el-row
      :gutter="10"
      class="mb8"
    >
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <!-- 拼团记录 -->
    <el-table
      v-loading="loading"
      :data="pageList"
      stripe
    >
      <el-table-column
        align="center"
        label="编号"
        prop="id"
        min-width="70"
      />
      <el-table-column
        align="center"
        label="头像"
        prop="avatar"
        min-width="80"
      >
        <template v-slot="scope">
          <el-avatar :src="scope.row.avatar" />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="昵称"
        prop="nickname"
        min-width="110"
        show-overflow-tooltip
      />
      <el-table-column
        align="center"
        label="开团团长"
        prop="headId"
        min-width="120"
      >
        <template v-slot="scope">{{ getHeadNickname(scope.row) }}</template>
      </el-table-column>
      <el-table-column
        align="center"
        label="开团时间"
        prop="startTime"
        width="180"
      >
        <template v-slot="scope">{{ formatTime(scope.row.startTime) }}</template>
      </el-table-column>
      <el-table-column
        align="center"
        label="拼团商品"
        prop="spuName"
        min-width="300"
        show-overflow-tooltip
      >
        <template v-slot="scope">
          <div class="product-cell">
            <el-image
              :src="scope.row.picUrl"
              :preview-src-list="[scope.row.picUrl]"
              class="product-image"
            />
            <span>{{ scope.row.spuName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="几人团"
        prop="userSize"
        min-width="90"
      />
      <el-table-column
        align="center"
        label="参与人数"
        prop="userCount"
        min-width="90"
      />
      <el-table-column
        align="center"
        label="参团时间"
        prop="createTime"
        width="180"
      >
        <template v-slot="scope">{{ formatTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column
        align="center"
        label="结束时间"
        prop="endTime"
        width="180"
      >
        <template v-slot="scope">{{ formatTime(scope.row.endTime) }}</template>
      </el-table-column>
      <el-table-column
        align="center"
        label="拼团状态"
        prop="status"
        min-width="120"
      >
        <template v-slot="scope">
          <dict-tag
            :type="recordStatusDictType"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        fixed="right"
        label="操作"
        width="110"
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['promotion:combination-record:query']"
            type="text"
            size="mini"
            icon="el-icon-view"
            @click="openRecordListDialog(scope.row)"
          >
            查看拼团
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <CombinationRecordListDialog ref="recordListDialog" />
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
import * as CombinationRecordApi from '@/api/mall/promotion/combination/combinationRecord'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import CombinationRecordListDialog from './CombinationRecordListDialog.vue'

const RECORD_STATUS_DICT_TYPE = DICT_TYPE.PROMOTION_COMBINATION_RECORD_STATUS ||
  'promotion_combination_record_status'

function startOfDay(date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function endOfDay(date) {
  const value = new Date(date)
  value.setHours(23, 59, 59, 999)
  return value
}

function dateRangeShortcut(text, getRange) {
  return {
    text,
    onClick(picker) {
      picker.$emit('pick', getRange())
    }
  }
}

const RECORD_DATE_PICKER_OPTIONS = {
  shortcuts: [
    dateRangeShortcut('今天', () => {
      const now = new Date()
      return [startOfDay(now), endOfDay(now)]
    }),
    dateRangeShortcut('昨天', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return [startOfDay(yesterday), endOfDay(yesterday)]
    }),
    dateRangeShortcut('最近七天', () => {
      const now = new Date()
      const start = new Date(now)
      start.setDate(start.getDate() - 6)
      return [startOfDay(start), endOfDay(now)]
    }),
    dateRangeShortcut('最近 30 天', () => {
      const now = new Date()
      const start = new Date(now)
      start.setDate(start.getDate() - 29)
      return [startOfDay(start), endOfDay(now)]
    }),
    dateRangeShortcut('本月', () => {
      const now = new Date()
      return [new Date(now.getFullYear(), now.getMonth(), 1), endOfDay(now)]
    }),
    dateRangeShortcut('今年', () => {
      const now = new Date()
      return [new Date(now.getFullYear(), 0, 1), endOfDay(now)]
    })
  ]
}

export default {
  name: 'PromotionCombinationRecord',
  components: { CountTo, CombinationRecordListDialog },
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      pageList: [],
      queryParams: {
        status: undefined,
        createTime: undefined,
        pageSize: 10,
        pageNo: 1
      },
      recordSummary: {
        successCount: 0,
        userCount: 0,
        virtualGroupCount: 0
      },
      recordStatusDictType: RECORD_STATUS_DICT_TYPE,
      recordDatePickerOptions: RECORD_DATE_PICKER_OPTIONS
    }
  },
  created() {
    this.getSummary()
    this.getList()
  },
  methods: {
    /** 查询拼团记录。 */
    getList() {
      this.loading = true
      return CombinationRecordApi.getCombinationRecordPage(this.queryParams)
        .then((response) => {
          const data = response.data
          this.pageList = data.list
          this.total = data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    /** 查询全量概要统计。 */
    getSummary() {
      return CombinationRecordApi.getCombinationRecordSummary().then((response) => {
        const data = response.data
        this.recordSummary = {
          successCount: Number(data.successCount || 0),
          userCount: Number(data.userCount || 0),
          virtualGroupCount: Number(data.virtualGroupCount || 0)
        }
      })
    },
    getStatusOptions() {
      return getDictDatas(RECORD_STATUS_DICT_TYPE)
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    openRecordListDialog(row) {
      return this.$refs.recordListDialog.open(row.headId || row.id)
    },
    getHeadNickname(row) {
      if (!row.headId) return row.nickname || '-'
      const head = this.pageList.find((item) => String(item.id) === String(row.headId))
      return head && head.nickname ? head.nickname : '记录 #' + row.headId
    },
    formatTime(value) {
      return parseTime(value) || '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.summary-row {
  margin-bottom: 8px;
}

.summary-col {
  margin-bottom: 12px;
}

.summary-card {
  display: flex;
  align-items: center;
  height: 110px;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
}

.summary-icon {
  display: flex;
  flex: 0 0 50px;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  margin-right: 20px;
  font-size: 23px;

  &--users {
    color: rgb(24 144 255);
    background: rgb(24 144 255 / 10%);
  }

  &--success {
    color: rgb(103 194 58);
    background: rgb(103 194 58 / 10%);
  }

  &--virtual {
    color: rgb(162 119 255);
    background: rgb(162 119 255 / 10%);
  }
}

.summary-content {
  min-width: 0;
  font-size: 20px;
}

.summary-title {
  margin-bottom: 8px;
  color: #909399;
  font-size: 14px;
}

.query-control {
  width: 240px;
}

.product-cell {
  display: flex;
  align-items: center;
  min-width: 0;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.product-image {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  margin-right: 5px;
}

@media (max-width: 768px) {
  .query-control {
    width: 100%;
  }

  .summary-card {
    height: 96px;
    padding: 16px;
  }
}
</style>
