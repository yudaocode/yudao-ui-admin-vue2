<template>
  <div class="app-container">
    <doc-alert
      title="【交易】交易订单"
      url="https://doc.iocoder.cn/mall/trade-order/"
    />
    <doc-alert
      title="【交易】购物车"
      url="https://doc.iocoder.cn/mall/trade-cart/"
    />

    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :inline="true"
      :model="queryParams"
      size="small"
      label-width="68px"
    >
      <el-form-item
        label="创建时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          :default-time="['00:00:00', '23:59:59']"
          end-placeholder="自定义时间"
          start-placeholder="自定义时间"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 280px"
        />
      </el-form-item>
      <el-form-item
        label="自提门店"
        prop="pickUpStoreIds"
      >
        <el-select
          v-model="queryParams.pickUpStoreIds"
          placeholder="全部"
          style="width: 280px"
          @change="handleQuery"
        >
          <el-option
            v-for="item in pickUpStoreList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="聚合搜索">
        <el-input
          v-model="queryParams[queryType.queryParam]"
          clearable
          placeholder="请输入"
          :type="queryType.queryParam === 'userId' ? 'number' : 'text'"
          style="width: 280px"
          @keyup.enter.native="handleQuery"
        >
          <el-select
            slot="prepend"
            v-model="queryType.queryParam"
            placeholder="全部"
            style="width: 110px"
            @change="inputChangeSelect"
          >
            <el-option
              v-for="item in dynamicSearchList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-input>
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
          v-hasPermi="['trade:order:pick-up']"
          type="success"
          plain
          icon="el-icon-check"
          :disabled="isUse"
          @click="handlePickup"
        >核销</el-button>
        <el-button
          type="primary"
          :disabled="serialPort || isUse"
          @click="connectToSerialPort"
        >连接扫描枪</el-button>
        <el-button
          type="danger"
          :disabled="!serialPort || isUse"
          @click="cutPort"
        >断开扫描枪</el-button>
      </el-form-item>
    </el-form>

    <!-- 统计卡片 -->
    <el-row
      :gutter="16"
      class="summary"
    >
      <el-col
        :sm="6"
        :xs="12"
      >
        <el-card
          v-loading="loading"
          shadow="never"
          class="summary-card"
        >
          <div class="summary-card-content">
            <i class="el-icon-s-order summary-icon summary-icon-blue" />
            <div><div class="summary-title">订单数量</div><div class="summary-value">{{ summary.orderCount || 0 }}</div></div>
          </div>
        </el-card>
      </el-col>
      <el-col
        :sm="6"
        :xs="12"
      >
        <el-card
          v-loading="loading"
          shadow="never"
          class="summary-card"
        >
          <div class="summary-card-content">
            <i class="el-icon-money summary-icon summary-icon-purple" />
            <div><div class="summary-title">订单金额</div><div class="summary-value">￥{{ fenToYuan(summary.orderPayPrice) }}</div></div>
          </div>
        </el-card>
      </el-col>
      <el-col
        :sm="6"
        :xs="12"
      >
        <el-card
          v-loading="loading"
          shadow="never"
          class="summary-card"
        >
          <div class="summary-card-content">
            <i class="el-icon-tickets summary-icon summary-icon-yellow" />
            <div><div class="summary-title">退款单数</div><div class="summary-value">{{ summary.afterSaleCount || 0 }}</div></div>
          </div>
        </el-card>
      </el-col>
      <el-col
        :sm="6"
        :xs="12"
      >
        <el-card
          v-loading="loading"
          shadow="never"
          class="summary-card"
        >
          <div class="summary-card-content">
            <i class="el-icon-refresh-left summary-icon summary-icon-green" />
            <div><div class="summary-title">退款金额</div><div class="summary-value">￥{{ fenToYuan(summary.afterSalePrice) }}</div></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
    >
      <el-table-column
        label="订单号"
        align="center"
        prop="no"
        min-width="180"
      />
      <el-table-column
        label="用户信息"
        align="center"
        prop="user.nickname"
        min-width="100"
      />
      <el-table-column
        label="推荐人信息"
        align="center"
        prop="brokerageUser.nickname"
        min-width="110"
      />
      <el-table-column
        label="商品信息"
        align="center"
        prop="spuName"
        min-width="300"
      >
        <template v-slot="scope">
          <div
            v-for="item in scope.row.items"
            :key="item.id"
            class="product-line"
          >
            <el-image
              :src="item.picUrl"
              :preview-src-list="item.picUrl ? [item.picUrl] : []"
              class="product-image"
              fit="cover"
            />
            <div class="product-info">
              <span>{{ item.spuName }}</span>
              <div>
                <el-tag
                  v-for="property in item.properties"
                  :key="property.propertyId"
                  size="mini"
                  class="product-property"
                >
                  {{ property.propertyName }}: {{ property.valueName }}
                </el-tag>
              </div>
              <span>{{ fenToYuan(item.price) }} 元 x {{ item.count }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="实付金额(元)"
        align="center"
        prop="payPrice"
        min-width="110"
      >
        <template v-slot="scope">￥{{ fenToYuan(scope.row.payPrice) }}</template>
      </el-table-column>
      <el-table-column
        label="核销员"
        align="center"
        prop="storeStaffName"
        min-width="80"
      />
      <el-table-column
        label="核销门店"
        align="center"
        prop="pickUpStoreId"
        min-width="100"
      >
        <template v-slot="scope">{{ getPickUpStoreName(scope.row.pickUpStoreId) }}</template>
      </el-table-column>
      <el-table-column
        label="支付状态"
        align="center"
        prop="payStatus"
        min-width="90"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
            :value="scope.row.payStatus || false"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="订单状态"
        align="center"
        prop="status"
        width="120"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.TRADE_ORDER_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="下单时间"
        align="center"
        prop="createTime"
        min-width="170"
      >
        <template v-slot="scope"><span>{{ parseTime(scope.row.createTime) }}</span></template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 订单核销弹窗 -->
    <OrderPickUpForm
      ref="pickUpForm"
      @success="getList"
    />
  </div>
</template>

<script>
import * as TradeOrderApi from '@/api/mall/trade/order'
import * as PickUpStoreApi from '@/api/mall/trade/delivery/pickUpStore'
import { DICT_TYPE } from '@/utils/dict'
import OrderPickUpForm from '@/views/mall/trade/order/form/OrderPickUpForm.vue'

const PICK_UP_DELIVERY_TYPE = 2

export default {
  name: 'PickUpOrder',
  components: { OrderPickUpForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      queryParams: this.createInitialQueryParams(),
      queryType: { queryParam: 'no' },
      dynamicSearchList: [
        { value: 'no', label: '订单号' },
        { value: 'userId', label: '用户 UID' },
        { value: 'userNickname', label: '用户昵称' },
        { value: 'userMobile', label: '用户电话' }
      ],
      summary: {
        orderCount: 0,
        orderPayPrice: 0,
        afterSaleCount: 0,
        afterSalePrice: 0
      },
      port: undefined,
      ports: [],
      reader: undefined,
      serialPort: false,
      isUse: true,
      pickUpStoreList: []
    }
  },
  created() {
    this.initPage()
  },
  methods: {
    createInitialQueryParams() {
      return {
        pageNo: 1,
        pageSize: 10,
        createTime: undefined,
        deliveryType: PICK_UP_DELIVERY_TYPE,
        pickUpStoreIds: -1
      }
    },
    /** 初始化页面 */
    initPage() {
      return this.getPickUpStoreList().then(() => {
        if (this.pickUpStoreList.length === 0) {
          this.$modal.msgError('当前登录人没绑定任何自提点')
          this.loading = false
          this.isUse = true
          return
        }
        this.queryParams.pickUpStoreIds = this.pickUpStoreList[0].id
        this.isUse = false
        return this.getList()
      })
    },
    /** 查询列表与统计 */
    getList() {
      this.loading = true
      return TradeOrderApi.getOrderSummary(this.queryParams)
        .then((summaryResponse) => {
          this.summary = Object.assign({
            orderCount: 0,
            orderPayPrice: 0,
            afterSaleCount: 0,
            afterSalePrice: 0
          }, summaryResponse.data)
          return TradeOrderApi.getOrderPage(this.queryParams)
        })
        .then((pageResponse) => {
          const page = pageResponse.data
          this.list = page.list
          this.total = page.total
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
      this.queryParams = this.createInitialQueryParams()
      if (this.pickUpStoreList.length > 0) {
        this.queryParams.pickUpStoreIds = this.pickUpStoreList[0].id
      }
      return this.handleQuery()
    },
    /** 聚合搜索切换查询字段 */
    inputChangeSelect(value) {
      this.dynamicSearchList
        .filter((item) => item.value !== value)
        .forEach((item) => {
          if (Object.prototype.hasOwnProperty.call(this.queryParams, item.value)) {
            this.$delete(this.queryParams, item.value)
          }
        })
    },
    /** 当前登录人可核销的自提门店精简列表 */
    getPickUpStoreList() {
      return PickUpStoreApi.getSimpleDeliveryPickUpStoreList().then((response) => {
        const stores = response.data
        const userId = this.$store && this.$store.getters ? this.$store.getters.userId : undefined
        this.pickUpStoreList = stores.filter((item) => {
          if (!Array.isArray(item.verifyUserIds)) return false
          return item.verifyUserIds.some((id) => String(id) === String(userId))
        })
      })
    },
    /** 显示核销表单 */
    handlePickup() {
      this.$refs.pickUpForm.open()
    },
    /** 获取门店名称 */
    getPickUpStoreName(id) {
      const store = this.pickUpStoreList.find((item) => String(item.id) === String(id))
      return store ? store.name : ''
    },
    /** 分转元 */
    fenToYuan(value) {
      const amount = Number(value || 0)
      return Number.isFinite(amount) ? (amount / 100).toFixed(2) : '0.00'
    },
    /** 连接扫码枪 */
    async connectToSerialPort() {
      try {
        if (typeof navigator === 'undefined' || !('serial' in navigator)) {
          this.$modal.msgError('浏览器不支持扫码枪连接，请更换浏览器重试')
          return
        }
        this.port = await navigator.serial.requestPort()
        this.ports = await navigator.serial.getPorts()
        await this.port.open({ baudRate: 9600, dataBits: 8, stopBits: 2 })
        this.$modal.msgSuccess('成功连接扫码枪')
        this.serialPort = true
        this.readData()
      } catch (error) {
        console.log('Error connecting to serial port:', error)
      }
    },
    /** 监听扫码枪输入 */
    async readData() {
      if (!this.port || !this.port.readable) return
      const activeReader = this.port.readable.getReader()
      this.reader = activeReader
      let data = ''
      try {
        for (;;) {
          const result = await activeReader.read()
          if (result.done) break
          const serialData = new TextDecoder().decode(result.value)
          data += serialData
          if (serialData.includes('\r')) {
            const codeData = data.replace('\r', '')
            data = ''
            this.$refs.pickUpForm.open(codeData)
          }
        }
      } finally {
        activeReader.releaseLock()
        if (this.reader === activeReader) this.reader = undefined
      }
    },
    /** 断开扫码枪 */
    async cutPort() {
      if (!this.port) {
        this.$modal.msgWarning('请先连接或打开扫码枪')
        return
      }
      if (this.reader) await this.reader.cancel()
      await this.port.close()
      this.port = undefined
      this.reader = undefined
      this.serialPort = false
      this.$modal.msgSuccess('已成功断开扫码枪连接')
    }
  }
}
</script>

<style lang="scss" scoped>
.summary {
  margin-bottom: 16px;

  .el-col {
    margin-bottom: 16px;
  }
}

.summary-card-content {
  display: flex;
  align-items: center;
}

.summary-icon {
  display: flex;
  flex: 0 0 48px;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 12px;
  border-radius: 4px;
  font-size: 24px;
}

.summary-icon-blue { color: #409eff; background: #ecf5ff; }
.summary-icon-purple { color: #8b5cf6; background: #f3e8ff; }
.summary-icon-yellow { color: #e6a23c; background: #fdf6ec; }
.summary-icon-green { color: #67c23a; background: #f0f9eb; }
.summary-title { color: #909399; font-size: 14px; }
.summary-value { margin-top: 4px; color: #303133; font-size: 28px; line-height: 1.2; }

.product-line {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  text-align: left;
}

.product-line:last-child { margin-bottom: 0; }
.product-image { flex: 0 0 40px; width: 40px; height: 40px; margin-right: 10px; }
.product-info { display: flex; flex-direction: column; min-width: 0; }
.product-property { margin-right: 6px; }
</style>
