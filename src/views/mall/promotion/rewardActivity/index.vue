<template>
  <div class="app-container">
    <doc-alert
      title="【营销】满减送"
      url="https://doc.iocoder.cn/mall/promotion-record/"
    />

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
        label="活动名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入活动名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="活动状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="请选择活动状态"
          clearable
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="活动时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="-"
          start-placeholder="活动开始日期"
          end-placeholder="活动结束日期"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 240px"
        />
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
        <el-button
          v-hasPermi="['promotion:reward-activity:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >
          新增
        </el-button>
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

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      row-key="id"
      default-expand-all
    >
      <el-table-column
        label="活动名称"
        prop="name"
        min-width="140"
        show-overflow-tooltip
      />
      <el-table-column
        label="活动范围"
        prop="productScope"
        align="center"
        min-width="100"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.PROMOTION_PRODUCT_SCOPE"
            :value="scope.row.productScope"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="活动开始时间"
        prop="startTime"
        align="center"
        width="180"
      >
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.startTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="活动结束时间"
        prop="endTime"
        align="center"
        width="180"
      >
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.endTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        prop="status"
        align="center"
        min-width="90"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.COMMON_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="180"
      >
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="180"
        fixed="right"
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['promotion:reward-activity:update']"
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-if="scope.row.status === 0"
            v-hasPermi="['promotion:reward-activity:close']"
            type="text"
            size="mini"
            class="danger-button"
            icon="el-icon-close"
            @click="handleClose(scope.row.id)"
          >
            关闭
          </el-button>
          <el-button
            v-hasPermi="['promotion:reward-activity:delete']"
            type="text"
            size="mini"
            class="danger-button"
            icon="el-icon-delete"
            @click="handleDelete(scope.row.id)"
          >
            删除
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

    <!-- 表单弹窗：添加/修改 -->
    <RewardForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import * as RewardActivityApi from '@/api/mall/promotion/reward/rewardActivity'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import RewardForm from './RewardForm.vue'

export default {
  name: 'PromotionRewardActivity',
  components: { RewardForm },
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        status: undefined,
        createTime: []
      },
      statusOptions: getDictDatas(DICT_TYPE.COMMON_STATUS),
      DICT_TYPE
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询满减送活动列表。 */
    getList() {
      this.loading = true
      return RewardActivityApi.getRewardActivityPage(this.queryParams)
        .then((response) => {
          const data = response.data
          this.list = data.list
          this.total = data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    /** 添加/修改满减送活动。 */
    openForm(type, id) {
      return this.$refs.form.open(type, id)
    },
    /** 关闭满减送活动。 */
    handleClose(id) {
      return this.$modal.confirm('确认关闭该满减活动吗？')
        .then(() => RewardActivityApi.closeRewardActivity(id))
        .then(() => {
          this.$modal.msgSuccess('关闭成功')
          return this.getList()
        })
        .catch(() => false)
    },
    /** 删除满减送活动。 */
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除该满减送活动？')
        .then(() => RewardActivityApi.deleteRewardActivity(id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          return this.getList()
        })
        .catch(() => false)
    },
    parseTime
  }
}
</script>

<style scoped>
.danger-button {
  color: #f56c6c;
}
</style>
