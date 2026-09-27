<template>
  <div class="app-container">
    <doc-alert
      title="【营销】积分商城活动"
      url="https://doc.iocoder.cn/mall/promotion-point/"
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
        label="活动状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          clearable
          placeholder="请选择活动状态"
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
          v-hasPermi="['promotion:point-activity:create']"
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
      stripe
    >
      <el-table-column
        label="活动编号"
        prop="id"
        min-width="80"
      />
      <el-table-column
        label="商品图片"
        prop="spuName"
        min-width="80"
      >
        <template v-slot="scope">
          <el-image
            :src="scope.row.picUrl"
            :preview-src-list="[scope.row.picUrl]"
            class="product-image"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="商品标题"
        prop="spuName"
        min-width="300"
        show-overflow-tooltip
      />
      <el-table-column
        label="原价"
        prop="marketPrice"
        min-width="100"
      >
        <template v-slot="scope">￥{{ fenToYuan(scope.row.marketPrice) }}</template>
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
        label="库存"
        prop="stock"
        align="center"
        min-width="80"
      />
      <el-table-column
        label="总库存"
        prop="totalStock"
        align="center"
        min-width="80"
      />
      <el-table-column
        label="已兑换数量"
        prop="redeemedQuantity"
        align="center"
        min-width="100"
      >
        <template v-slot="scope">{{ getRedeemedQuantity(scope.row) }}</template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="180"
      >
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['promotion:point-activity:update']"
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-if="scope.row.status === 0"
            v-hasPermi="['promotion:point-activity:close']"
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
            v-hasPermi="['promotion:point-activity:delete']"
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

    <PointActivityForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { PointActivityApi } from '@/api/mall/promotion/point'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import PointActivityForm from './PointActivityForm.vue'

export default {
  name: 'PointActivity',
  components: { PointActivityForm },
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
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
  methods: {
    getList() {
      this.loading = true
      return PointActivityApi.getPointActivityPage(this.queryParams)
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
    openForm(type, id) {
      return this.$refs.form.open(type, id)
    },
    handleClose(id) {
      return this.$modal.confirm('确认关闭该积分商城活动吗？')
        .then(() => PointActivityApi.closePointActivity(id))
        .then(() => {
          this.$modal.msgSuccess('关闭成功')
          return this.getList()
        })
        .catch(() => false)
    },
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除该积分商城活动？')
        .then(() => PointActivityApi.deletePointActivity(id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          return this.getList()
        })
        .catch(() => false)
    },
    getRedeemedQuantity(row) {
      return Number(row.totalStock || 0) - Number(row.stock || 0)
    },
    fenToYuan(value) {
      const price = Number(value)
      return Number.isFinite(price) ? (price / 100).toFixed(2) : '0.00'
    },
    parseTime
  }
}
</script>

<style lang="scss" scoped>
.product-image {
  width: 40px;
  height: 40px;
}

.danger-button {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .product-image {
    width: 32px;
    height: 32px;
  }
}
</style>
