<template>
  <div
    v-loading="formLoading"
    class="spu-form-page"
  >
    <el-card shadow="never">
      <el-tabs v-model="activeName">
        <el-tab-pane
          label="基础设置"
          name="info"
        >
          <InfoForm
            ref="infoRef"
            :is-detail="isDetail"
            :prop-form-data="formData"
            @update:activeName="activeName = $event"
          />
        </el-tab-pane>
        <el-tab-pane
          label="价格库存"
          name="sku"
        >
          <SkuForm
            ref="skuRef"
            :is-detail="isDetail"
            :prop-form-data="formData"
            @update:activeName="activeName = $event"
          />
        </el-tab-pane>
        <el-tab-pane
          label="物流设置"
          name="delivery"
        >
          <DeliveryForm
            ref="deliveryRef"
            :is-detail="isDetail"
            :prop-form-data="formData"
            @update:activeName="activeName = $event"
          />
        </el-tab-pane>
        <el-tab-pane
          label="商品详情"
          name="description"
        >
          <DescriptionForm
            ref="descriptionRef"
            :is-detail="isDetail"
            :prop-form-data="formData"
            @update:activeName="activeName = $event"
          />
        </el-tab-pane>
        <el-tab-pane
          label="其它设置"
          name="other"
        >
          <OtherForm
            ref="otherRef"
            :is-detail="isDetail"
            :prop-form-data="formData"
            @update:activeName="activeName = $event"
          />
        </el-tab-pane>
      </el-tabs>
      <el-form>
        <el-form-item class="form-actions">
          <el-button
            v-if="!isDetail"
            :loading="formLoading"
            type="primary"
            @click="submitForm"
          >保存</el-button>
          <el-button @click="close">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import * as ProductSpuApi from '@/api/mall/product/spu'
import InfoForm from './InfoForm.vue'
import DescriptionForm from './DescriptionForm.vue'
import OtherForm from './OtherForm.vue'
import SkuForm from './SkuForm.vue'
import DeliveryForm from './DeliveryForm.vue'
import { convertToInteger, floatToFixed2, formatToFraction } from '@/utils'
import { isEmpty } from '@/utils/is'

const defaultForm = () => ({
  name: '',
  categoryId: undefined,
  keyword: '',
  picUrl: '',
  sliderPicUrls: [],
  introduction: '',
  deliveryTypes: [],
  deliveryTemplateId: undefined,
  brandId: undefined,
  specType: false,
  subCommissionType: false,
  skus: [{
    name: '',
    price: 0,
    marketPrice: 0,
    costPrice: 0,
    barCode: '',
    picUrl: '',
    stock: 0,
    weight: 0,
    volume: 0,
    firstBrokeragePrice: 0,
    secondBrokeragePrice: 0
  }],
  description: '',
  sort: 0,
  giveIntegral: 0,
  virtualSalesCount: 0
})

export default {
  name: 'ProductSpuAdd',
  components: { InfoForm, DescriptionForm, OtherForm, SkuForm, DeliveryForm },
  data() {
    return {
      formLoading: false,
      activeName: 'info',
      isDetail: false,
      formData: defaultForm()
    }
  },
  mounted() {
    this.getDetail()
  },
  methods: {
    async getDetail() {
      if (this.$route.name === 'ProductSpuDetail') this.isDetail = true
      const id = this.$route.params.id
      if (!id) return
      this.formLoading = true
      try {
        const response = await ProductSpuApi.getSpu(id)
        const data = response.data
        data.skus.forEach(item => {
          if (this.isDetail) {
            item.price = floatToFixed2(item.price)
            item.marketPrice = floatToFixed2(item.marketPrice)
            item.costPrice = floatToFixed2(item.costPrice)
            item.firstBrokeragePrice = floatToFixed2(item.firstBrokeragePrice)
            item.secondBrokeragePrice = floatToFixed2(item.secondBrokeragePrice)
          } else {
            item.price = formatToFraction(item.price)
            item.marketPrice = formatToFraction(item.marketPrice)
            item.costPrice = formatToFraction(item.costPrice)
            item.firstBrokeragePrice = formatToFraction(item.firstBrokeragePrice)
            item.secondBrokeragePrice = formatToFraction(item.secondBrokeragePrice)
          }
        })
        this.formData = data
      } finally {
        this.formLoading = false
      }
    },
    async submitForm() {
      this.formLoading = true
      try {
        await this.$refs.infoRef.validate()
        await this.$refs.skuRef.validate()
        await this.$refs.deliveryRef.validate()
        await this.$refs.descriptionRef.validate()
        await this.$refs.otherRef.validate()
        const data = cloneDeep(this.formData)
        if (isEmpty(data.name)) {
          this.$modal.msgError('商品名称不能为空')
          return
        }
        data.skus.forEach(item => {
          item.name = data.name
          item.price = convertToInteger(item.price)
          item.marketPrice = convertToInteger(item.marketPrice)
          item.costPrice = convertToInteger(item.costPrice)
          item.firstBrokeragePrice = convertToInteger(item.firstBrokeragePrice)
          item.secondBrokeragePrice = convertToInteger(item.secondBrokeragePrice)
        })
        data.sliderPicUrls = data.sliderPicUrls.map(item => typeof item === 'object' ? item.url : item)
        if (!this.$route.params.id) {
          await ProductSpuApi.createSpu(data)
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        } else {
          await ProductSpuApi.updateSpu(data)
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        }
        this.close()
      } finally {
        this.formLoading = false
      }
    },
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ name: 'ProductSpu' })
    }
  }
}
</script>

<style scoped>
.spu-form-page {
  padding: 20px;
}

.form-actions {
  float: right;
}
</style>
