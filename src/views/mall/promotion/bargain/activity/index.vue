<template>
  <div class="app-container bargain-activity">
    <doc-alert
      title="【营销】砍价活动"
      url="https://doc.iocoder.cn/mall/promotion-bargain/"
    />

    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
      class="bargain-activity__filter"
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
          v-hasPermi="['promotion:bargain-activity:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
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

    <el-table
      v-loading="loading"
      :data="list"
      stripe
    >
      <el-table-column
        label="活动编号"
        prop="id"
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
        <template slot-scope="scope">
          {{ formatDateOnly(scope.row.startTime) }}
          ~ {{ formatDateOnly(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="商品图片"
        prop="picUrl"
        min-width="80"
      >
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.picUrl"
            :src="scope.row.picUrl"
            :preview-src-list="[scope.row.picUrl]"
            fit="cover"
            class="bargain-activity__image"
          />
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column
        label="商品标题"
        prop="spuName"
        min-width="300"
        show-overflow-tooltip
      />
      <el-table-column
        label="起始价格"
        prop="bargainFirstPrice"
        min-width="110"
      >
        <template slot-scope="scope">￥{{ fenToYuan(scope.row.bargainFirstPrice) }}</template>
      </el-table-column>
      <el-table-column
        label="砍价底价"
        prop="bargainMinPrice"
        min-width="110"
      >
        <template slot-scope="scope">￥{{ fenToYuan(scope.row.bargainMinPrice) }}</template>
      </el-table-column>
      <el-table-column
        label="总砍价人数"
        prop="recordUserCount"
        min-width="110"
      />
      <el-table-column
        label="成功砍价人数"
        prop="recordSuccessUserCount"
        min-width="120"
      />
      <el-table-column
        label="助力人数"
        prop="helpUserCount"
        min-width="100"
      />
      <el-table-column
        label="活动状态"
        align="center"
        prop="status"
        min-width="100"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.COMMON_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="库存"
        align="center"
        prop="stock"
        min-width="80"
      />
      <el-table-column
        label="总库存"
        align="center"
        prop="totalStock"
        min-width="80"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === 0"
            v-hasPermi="['promotion:bargain-activity:update']"
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-if="scope.row.status === 0"
            v-hasPermi="['promotion:bargain-activity:close']"
            type="text"
            size="mini"
            class="bargain-activity__danger"
            icon="el-icon-close"
            @click="handleClose(scope.row.id)"
          >关闭</el-button>
          <el-button
            v-else
            v-hasPermi="['promotion:bargain-activity:delete']"
            type="text"
            size="mini"
            class="bargain-activity__danger"
            icon="el-icon-delete"
            @click="handleDelete(scope.row.id)"
          >删除</el-button>
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

    <BargainActivityForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import * as BargainActivityApi from '@/api/mall/promotion/bargain/bargainActivity'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import BargainActivityForm from './BargainActivityForm.vue'

export default {
  name: 'PromotionBargainActivity',
  components: { BargainActivityForm },
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      requestSequence: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        status: null
      },
      DICT_TYPE
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
        const response = await BargainActivityApi.getBargainActivityPage({ ...this.queryParams })
        if (requestId !== this.requestSequence) return false
        const page = response.data
        this.list = page.list
        this.total = page.total
        return true
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
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
    openForm(type, id) {
      return this.$refs.form.open(type, id)
    },
    async handleClose(id) {
      try {
        await this.$modal.confirm('确认关闭该砍价活动吗？')
        await BargainActivityApi.closeBargainActivity(id)
        this.$modal.msgSuccess('关闭成功')
        await this.getList()
        return true
      } catch (error) {
        return false
      }
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除该砍价活动？')
        await BargainActivityApi.deleteBargainActivity(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
        return true
      } catch (error) {
        return false
      }
    },
    formatDateOnly(value) {
      return parseTime(value, '{y}-{m}-{d}') || ''
    },
    fenToYuan(value) {
      const amount = Number(value)
      return Number.isFinite(amount) ? (amount / 100).toFixed(2) : '0.00'
    },
    parseTime
  }
}
</script>

<style lang="scss" scoped>
.bargain-activity__image {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 3px;
}

.bargain-activity__danger {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .bargain-activity__filter {
    ::v-deep .el-form-item {
      display: block;
      margin-right: 0;
    }

    ::v-deep .el-input,
    ::v-deep .el-select {
      width: 100%;
    }
  }
}
</style>
