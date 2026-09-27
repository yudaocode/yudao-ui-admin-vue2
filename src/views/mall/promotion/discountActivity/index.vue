<template>
  <div class="app-container">
    <doc-alert
      title="【营销】限时折扣"
      url="https://doc.iocoder.cn/mall/promotion-discount/"
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
            v-for="dict in getStatusOptions()"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="活动时间"
        prop="activeTime"
      >
        <el-date-picker
          v-model="queryParams.activeTime"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
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
          v-hasPermi="['promotion:discount-activity:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >
          新增活动
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
      stripe
    >
      <el-table-column
        label="活动编号"
        prop="id"
        align="center"
        min-width="80"
      />
      <el-table-column
        label="活动名称"
        prop="name"
        min-width="140"
        show-overflow-tooltip
      />
      <el-table-column
        label="活动时间"
        min-width="210"
      >
        <template v-slot="scope">
          {{ formatDateOnly(scope.row.startTime) }}
          ~ {{ formatDateOnly(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="活动状态"
        prop="status"
        align="center"
        min-width="100"
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
        width="150"
        fixed="right"
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['promotion:discount-activity:update']"
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-if="scope.row.status === 0"
            v-hasPermi="['promotion:discount-activity:close']"
            type="text"
            size="mini"
            class="danger-button"
            icon="el-icon-close"
            @click="handleClose(scope.row.id)"
          >
            关闭
          </el-button>
          <el-button
            v-else
            v-hasPermi="['promotion:discount-activity:delete']"
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
    <DiscountActivityForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import * as DiscountActivityApi from '@/api/mall/promotion/discount/discountActivity'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import DiscountActivityForm from './DiscountActivityForm.vue'

export default {
  name: 'DiscountActivity',
  components: { DiscountActivityForm },
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        activeTime: null,
        name: null,
        status: null
      },
      DICT_TYPE
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询限时折扣活动列表。 */
    getList() {
      this.loading = true
      return DiscountActivityApi.getDiscountActivityPage(this.queryParams)
        .then((response) => {
          const data = response.data
          this.list = data.list
          this.total = data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    getStatusOptions() {
      return getDictDatas(DICT_TYPE.COMMON_STATUS)
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    /** 添加/修改操作。 */
    openForm(type, id) {
      return this.$refs.form.open(type, id)
    },
    /** 关闭限时折扣活动。 */
    handleClose(id) {
      return this.$modal.confirm('确认关闭该限时折扣活动吗？')
        .then(() => DiscountActivityApi.closeDiscountActivity(id))
        .then(() => {
          this.$modal.msgSuccess('关闭成功')
          return this.getList()
        })
        .catch(() => false)
    },
    /** 删除限时折扣活动。 */
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除该限时折扣活动？')
        .then(() => DiscountActivityApi.deleteDiscountActivity(id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          return this.getList()
        })
        .catch(() => false)
    },
    parseTime,
    formatDateOnly(value) {
      return parseTime(value, '{y}-{m}-{d}') || ''
    }
  }
}
</script>

<style scoped>
.danger-button {
  color: #f56c6c;
}
</style>
