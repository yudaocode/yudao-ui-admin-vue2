<template>
  <div class="app-container trade-after-sale">
    <doc-alert
      title="【交易】售后退款"
      url="https://doc.iocoder.cn/mall/trade-aftersale/"
    />

    <!-- 搜索 -->
    <el-card
      shadow="never"
      class="search-card"
    >
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="68px"
      >
        <el-form-item
          label="商品名称"
          prop="spuName"
        >
          <el-input
            v-model="queryParams.spuName"
            clearable
            class="query-control"
            placeholder="请输入商品 SPU 名称"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="退款编号"
          prop="no"
        >
          <el-input
            v-model="queryParams.no"
            clearable
            class="query-control"
            placeholder="请输入退款编号"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="订单编号"
          prop="orderNo"
        >
          <el-input
            v-model="queryParams.orderNo"
            clearable
            class="query-control"
            placeholder="请输入订单编号"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="售后状态"
          prop="status"
        >
          <el-select
            v-model="queryParams.status"
            clearable
            class="query-control"
            placeholder="请选择售后状态"
          >
            <el-option
              label="全部"
              value="0"
            />
            <el-option
              v-for="dict in afterSaleStatusDictDatas"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="售后方式"
          prop="way"
        >
          <el-select
            v-model="queryParams.way"
            clearable
            class="query-control"
            placeholder="请选择售后方式"
          >
            <el-option
              v-for="dict in afterSaleWayDictDatas"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="售后类型"
          prop="type"
        >
          <el-select
            v-model="queryParams.type"
            clearable
            class="query-control"
            placeholder="请选择售后类型"
          >
            <el-option
              v-for="dict in afterSaleTypeDictDatas"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="创建时间"
          prop="createTime"
        >
          <el-date-picker
            v-model="queryParams.createTime"
            :default-time="['00:00:00', '23:59:59']"
            class="query-control"
            end-placeholder="自定义时间"
            start-placeholder="自定义时间"
            type="daterange"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            icon="el-icon-search"
            @click="handleQuery"
          >搜索</el-button>
          <el-button
            icon="el-icon-refresh"
            @click="resetQuery"
          >重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card
      shadow="never"
      class="list-card"
    >
      <el-tabs
        v-model="queryParams.status"
        @tab-click="tabClick"
      >
        <el-tab-pane
          v-for="item in statusTabs"
          :key="item.label"
          :label="item.label"
          :name="item.value"
        />
      </el-tabs>

      <!-- 列表 -->
      <el-table
        v-loading="loading"
        :data="list"
      >
        <el-table-column
          align="center"
          label="退款编号"
          min-width="200"
          prop="no"
        />
        <el-table-column
          align="center"
          label="订单编号"
          min-width="200"
          prop="orderNo"
        >
          <template v-slot="{ row }">
            <el-button
              type="text"
              @click="openOrderDetail(row.orderId)"
            >
              {{ row.orderNo }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="商品信息"
          min-width="600"
          prop="spuName"
        >
          <template v-slot="{ row }">
            <div class="product-info">
              <el-image
                :src="row.picUrl"
                :preview-src-list="row.picUrl ? [row.picUrl] : []"
                class="product-image"
              />
              <span class="product-name">{{ row.spuName }}</span>
              <el-tag
                v-for="property in row.properties"
                :key="property.propertyId"
                class="property-tag"
              >
                {{ property.propertyName }}: {{ property.valueName }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="订单金额"
          min-width="120"
          prop="refundPrice"
        >
          <template v-slot="scope">
            <span>{{ fenToYuan(scope.row.refundPrice) }} 元</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="买家"
          prop="user.nickname"
        />
        <el-table-column
          align="center"
          label="申请时间"
          prop="createTime"
          width="180"
        >
          <template v-slot="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="售后状态"
          width="100"
        >
          <template v-slot="scope">
            <dict-tag
              :type="DICT_TYPE.TRADE_AFTER_SALE_STATUS"
              :value="scope.row.status"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="售后方式"
        >
          <template v-slot="scope">
            <dict-tag
              :type="DICT_TYPE.TRADE_AFTER_SALE_WAY"
              :value="scope.row.way"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          width="160"
        >
          <template v-slot="{ row }">
            <el-button
              type="text"
              @click="openAfterSaleDetail(row.id)"
            >处理退款</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :limit.sync="queryParams.pageSize"
        :page.sync="queryParams.pageNo"
        :total="total"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script>
import * as AfterSaleApi from '@/api/mall/trade/afterSale'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { fenToYuan } from '@/utils'
import { parseTime } from '@/utils/ruoyi'

export default {
  name: 'TradeAfterSale',
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      statusTabs: [{
        label: '全部',
        value: '0'
      }],
      afterSaleStatusDictDatas: getDictDatas(DICT_TYPE.TRADE_AFTER_SALE_STATUS),
      afterSaleWayDictDatas: getDictDatas(DICT_TYPE.TRADE_AFTER_SALE_WAY),
      afterSaleTypeDictDatas: getDictDatas(DICT_TYPE.TRADE_AFTER_SALE_TYPE),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: null,
        status: '0',
        orderNo: null,
        spuName: null,
        createTime: [],
        way: null,
        type: null
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      await this.getList()
      for (const dict of this.afterSaleStatusDictDatas) {
        this.statusTabs.push({
          label: dict.label,
          value: dict.value
        })
      }
    },
    /** 查询列表 */
    getList() {
      this.loading = true
      const queryData = Object.assign({}, this.queryParams)
      if (queryData.status === '0') delete queryData.status
      return AfterSaleApi.getAfterSalePage(queryData)
        .then((response) => {
          this.list = response.data.list
          this.total = response.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    /** tab 切换 */
    tabClick(tab) {
      if (tab.name === undefined) return Promise.resolve()
      this.queryParams.status = String(tab.name)
      return this.getList()
    },
    /** 处理退款 */
    openAfterSaleDetail(id) {
      return this.$router.push({ name: 'TradeAfterSaleDetail', params: { id }})
    },
    /** 查看订单详情 */
    openOrderDetail(id) {
      return this.$router.push({ name: 'TradeOrderDetail', params: { id }})
    },
    fenToYuan,
    parseTime
  }
}
</script>

<style lang="scss" scoped>
.search-card {
  margin-bottom: 20px;
}

.query-control {
  width: 280px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  flex: none;
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

.product-name,
.property-tag {
  margin-right: 10px;
}

@media (max-width: 768px) {
  .query-control {
    width: 100%;
  }
}
</style>
