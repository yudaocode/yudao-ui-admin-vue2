<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="65%"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item
        label="秒杀活动名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入秒杀活动名称"
        />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="活动开始时间"
            prop="startTime"
          >
            <el-date-picker
              v-model="formData.startTime"
              type="date"
              value-format="timestamp"
              placeholder="请选择活动开始时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="活动结束时间"
            prop="endTime"
          >
            <el-date-picker
              v-model="formData.endTime"
              type="date"
              value-format="timestamp"
              placeholder="请选择活动结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="秒杀时段"
            prop="configIds"
          >
            <el-select
              v-model="formData.configIds"
              multiple
              filterable
              placeholder="请选择秒杀时段"
              style="width: 100%"
            >
              <el-option
                v-for="item in configList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="总限购数量"
            prop="totalLimitCount"
          >
            <el-input-number
              v-model="formData.totalLimitCount"
              :min="0"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="单次限够数量"
            prop="singleLimitCount"
          >
            <el-input-number
              v-model="formData.singleLimitCount"
              :min="0"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="排序"
            prop="sort"
          >
            <el-input-number
              v-model="formData.sort"
              :min="0"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="秒杀活动商品"
        prop="spuId"
      >
        <el-button @click="openSpuSelect">选择商品</el-button>
        <SpuAndSkuList
          ref="spuAndSkuList"
          :rule-config="ruleConfig"
          :spu-list="spuList"
          :spu-property-list-p="spuPropertyList"
        >
          <el-table-column
            align="center"
            label="秒杀库存"
            min-width="168"
          >
            <template v-slot="scope">
              <el-input-number
                v-model="scope.row.productConfig.stock"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="秒杀价格(元)"
            min-width="168"
          >
            <template v-slot="scope">
              <el-input-number
                v-model="scope.row.productConfig.seckillPrice"
                :min="0"
                :precision="2"
                :step="0.1"
                controls-position="right"
                style="width: 100%"
              />
            </template>
          </el-table-column>
        </SpuAndSkuList>
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="4"
        />
      </el-form-item>
    </el-form>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :disabled="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>

    <SpuSelect
      ref="spuSelect"
      :is-select-sku="true"
      @confirm="selectSpu"
    />
  </el-dialog>
</template>

<script>
import { SpuAndSkuList, SpuSelect } from '../../components'
import { rules } from './seckillActivity.data'
import * as SeckillActivityApi from '@/api/mall/promotion/seckill/seckillActivity'
import { SeckillConfigApi } from '@/api/mall/promotion/seckill/seckillConfig'
import * as ProductSpuApi from '@/api/mall/product/spu'

export default {
  name: 'PromotionSeckillActivityForm',
  components: { SpuAndSkuList, SpuSelect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.defaultFormData(),
      rules,
      configList: [],
      spuList: [],
      spuPropertyList: [],
      ruleConfig: [
        {
          name: 'productConfig.stock',
          rule: value => value >= 1,
          message: '商品秒杀库存必须大于等于 1 ！！！'
        },
        {
          name: 'productConfig.seckillPrice',
          rule: value => value >= 0.01,
          message: '商品秒杀价格必须大于等于 0.01 ！！！'
        }
      ]
    }
  },
  created() {
    SeckillConfigApi.getSimpleSeckillConfigList().then(response => {
      this.configList = response.data
    })
  },
  methods: {
    defaultFormData() {
      return {
        id: undefined,
        spuId: undefined,
        name: undefined,
        startTime: undefined,
        endTime: undefined,
        configIds: [],
        totalLimitCount: 0,
        singleLimitCount: 0,
        sort: 0,
        remark: undefined
      }
    },
    selectSpu(spuId, skuIds) {
      this.formData.spuId = spuId
      return this.getSpuDetails(spuId, skuIds)
    },
    getSpuDetails(spuId, skuIds, products) {
      return ProductSpuApi.getSpuDetailList([spuId]).then(response => {
        const result = response.data
        if (result.length === 0) return
        this.spuList = []
        const spu = result[0]
        const selectedSkus = (skuIds === undefined
          ? spu.skus
          : (spu.skus || []).filter(sku => skuIds.includes(sku.id))) || []
        selectedSkus.forEach(sku => {
          let config = {
            spuId: spu.id,
            skuId: sku.id,
            stock: 0,
            seckillPrice: 0
          }
          if (products !== undefined) {
            const product = products.find(item => item.skuId === sku.id)
            if (product) product.seckillPrice = this.formatToFraction(product.seckillPrice)
            config = product || config
          }
          this.$set(sku, 'productConfig', config)
        })
        spu.skus = selectedSkus
        this.spuList.push(spu)
        this.spuPropertyList = [{
          spuId: spu.id,
          spuDetail: spu,
          propertyList: this.getPropertyList(spu)
        }]
      })
    },
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '编辑'
      this.formType = type
      this.resetForm()
      if (!id) return Promise.resolve()
      this.formLoading = true
      return SeckillActivityApi.getSeckillActivity(id).then(response => {
        const data = response.data
        return this.getSpuDetails(
          data.spuId,
          (data.products || []).map(sku => sku.skuId),
          data.products
        ).then(() => {
          this.formData = Object.assign(this.defaultFormData(), data)
        })
      }).finally(() => {
        this.formLoading = false
      })
    },
    submitForm() {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate(valid => {
          if (!valid) {
            resolve(false)
            return
          }
          let products
          try {
            products = JSON.parse(JSON.stringify(
              this.$refs.spuAndSkuList.getSkuConfigs('productConfig')
            ))
          } catch (error) {
            reject(error)
            return
          }
          products.forEach(item => {
            item.seckillPrice = this.convertToInteger(item.seckillPrice)
          })
          const data = Object.assign({}, this.formData, { products })
          this.formLoading = true
          const request = this.formType === 'create'
            ? SeckillActivityApi.createSeckillActivity(data)
            : SeckillActivityApi.updateSeckillActivity(data)
          request.then(() => {
            this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
            this.dialogVisible = false
            this.$emit('success')
            resolve(true)
          }).catch(reject).finally(() => {
            this.formLoading = false
          })
        })
      })
    },
    resetForm() {
      this.spuList = []
      this.spuPropertyList = []
      this.formData = this.defaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    },
    openSpuSelect() {
      this.$refs.spuSelect.open()
    },
    getPropertyList(spu) {
      const properties = []
      if (!spu.specType) return properties
      const skus = spu.skus || []
      skus.forEach(sku => {
        const skuProperties = sku.properties || []
        skuProperties.forEach(property => {
          let item = properties.find(value => value.id === property.propertyId)
          if (!item) {
            item = { id: property.propertyId, name: property.propertyName, values: [] }
            properties.push(item)
          }
          if (!item.values.some(value => value.id === property.valueId)) {
            item.values.push({ id: property.valueId, name: property.valueName })
          }
        })
      })
      return properties
    },
    formatToFraction(value) {
      if (value === undefined) return '0.00'
      return (Number(value) / 100).toFixed(2)
    },
    convertToInteger(value) {
      return Math.round(Number(value) * 100)
    }
  }
}
</script>
