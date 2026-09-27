<template>
  <div
    v-loading="loading"
    class="app-container crm-product-detail"
  >
    <product-details-header
      :loading="loading"
      :product="product"
      @refresh="getProductData(productId)"
    />
    <el-card
      shadow="never"
      class="detail-tabs"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="详细资料"
          name="info"
        >
          <product-details-info :product="product" />
        </el-tab-pane>
        <el-tab-pane
          label="操作日志"
          name="log"
        >
          <el-empty
            v-if="!logLoading && logList.length === 0"
            description="暂无操作日志"
          />
          <el-timeline
            v-else
            v-loading="logLoading"
            class="operate-log-list"
          >
            <el-timeline-item
              v-for="log in logList"
              :key="log.id || (log.createTime + '-' + log.action)"
              :timestamp="parseTime(log.createTime)"
              placement="top"
            >
              <el-tag
                size="small"
                type="success"
              >{{ log.userName || '-' }}</el-tag>
              <span class="log-action">{{ log.action || '-' }}</span>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { getProduct } from '@/api/crm/product'
import { getOperateLogPage } from '@/api/crm/operateLog'
import { BizTypeEnum } from '@/api/crm/permission'
import ProductDetailsHeader from './ProductDetailsHeader.vue'
import ProductDetailsInfo from './ProductDetailsInfo.vue'

export default {
  name: 'CrmProductDetail',
  components: { ProductDetailsHeader, ProductDetailsInfo },
  data() {
    return {
      productId: undefined,
      loading: false,
      logLoading: false,
      product: {},
      logList: [],
      activeTab: 'info',
      requestSequence: 0
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(value) {
        const id = Number(value)
        if (!Number.isFinite(id) || id <= 0) {
          this.$modal.msgWarning('参数错误，产品不能为空！')
          this.close()
          return
        }
        this.productId = id
        this.getProductData(id)
      }
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    async getProductData(id) {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const [productResponse] = await Promise.all([
          getProduct(id),
          this.getOperateLog(id, requestId)
        ])
        if (requestId === this.requestSequence) {
          this.product = (productResponse).data
        }
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    async getOperateLog(productId, parentRequestId) {
      this.logLoading = true
      try {
        const data = (await getOperateLogPage({
          pageNo: 1,
          pageSize: 100,
          bizType: BizTypeEnum.CRM_PRODUCT,
          bizId: productId
        })).data
        if (parentRequestId !== this.requestSequence) return
        this.logList = data.list
      } finally {
        if (parentRequestId === this.requestSequence) this.logLoading = false
      }
    },
    close() {
      this.$store.dispatch('tagsView/delView', this.$route).catch(() => {})
      this.$router.push({ name: 'CrmProduct' }).catch(() => this.$router.back())
    }
  }
}
</script>

<style scoped>
.detail-tabs { margin-top: 10px; }
.operate-log-list { padding: 18px 20px 0; }
.log-action { margin-left: 8px; }
</style>
