<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="70%"
    append-to-body
  >
    <el-form
      ref="queryForm"
      :inline="true"
      :model="queryParams"
      label-width="68px"
    >
      <el-form-item
        label="商品名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入商品名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="商品分类"
        prop="categoryId"
      >
        <el-cascader
          v-model="queryParams.categoryId"
          :options="categoryList"
          :props="categoryProps"
          clearable
          placeholder="请选择商品分类"
        />
      </el-form-item>
      <el-form-item
        label="创建时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          :default-time="['00:00:00', '23:59:59']"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
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

    <el-table
      ref="spuList"
      v-loading="loading"
      :data="list"
      :expand-row-keys="expandRowKeys"
      row-key="id"
      @expand-change="expandChange"
      @selection-change="selectSpu"
    >
      <el-table-column
        v-if="isSelectSku"
        type="expand"
        width="30"
      >
        <template v-slot>
          <el-table
            v-if="isExpand"
            ref="skuList"
            :data="spuData.skus || []"
            border
            row-key="id"
            @selection-change="selectSku"
          >
            <el-table-column
              type="selection"
              width="45"
            />
            <el-table-column
              align="center"
              label="图片"
              min-width="80"
            >
              <template v-slot="scope">
                <el-image
                  v-if="scope.row.picUrl"
                  :src="scope.row.picUrl"
                  :preview-src-list="[scope.row.picUrl]"
                  class="sku-image"
                />
              </template>
            </el-table-column>
            <el-table-column
              v-for="(property, index) in propertyList"
              :key="property.id || index"
              :label="property.name"
              align="center"
              min-width="80"
            >
              <template v-slot="scope">
                <span class="property-value">{{ propertyValue(scope.row, index) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              label="商品条码"
              min-width="100"
              prop="barCode"
            />
            <el-table-column
              align="center"
              label="销售价(元)"
              min-width="80"
              prop="price"
            />
            <el-table-column
              align="center"
              label="市场价(元)"
              min-width="80"
              prop="marketPrice"
            />
            <el-table-column
              align="center"
              label="成本价(元)"
              min-width="80"
              prop="costPrice"
            />
            <el-table-column
              align="center"
              label="库存"
              min-width="80"
              prop="stock"
            />
            <el-table-column
              align="center"
              label="重量(kg)"
              min-width="80"
              prop="weight"
            />
            <el-table-column
              align="center"
              label="体积(m^3)"
              min-width="80"
              prop="volume"
            />
            <template v-if="spuData.subCommissionType">
              <el-table-column
                align="center"
                label="一级返佣(元)"
                min-width="80"
                prop="firstBrokeragePrice"
              />
              <el-table-column
                align="center"
                label="二级返佣(元)"
                min-width="80"
                prop="secondBrokeragePrice"
              />
            </template>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column
        key="id"
        align="center"
        label="商品编号"
        prop="id"
      />
      <el-table-column
        label="商品图"
        min-width="80"
      >
        <template v-slot="scope">
          <el-image
            :src="scope.row.picUrl"
            :preview-src-list="scope.row.picUrl ? [scope.row.picUrl] : []"
            class="spu-image"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="商品名称"
        min-width="300"
        prop="name"
        show-overflow-tooltip
      />
      <el-table-column
        align="center"
        label="商品售价"
        min-width="90"
        prop="price"
      >
        <template v-slot="scope">{{ formatToFraction(scope.row.price) }}</template>
      </el-table-column>
      <el-table-column
        align="center"
        label="销量"
        min-width="90"
        prop="salesCount"
      />
      <el-table-column
        align="center"
        label="库存"
        min-width="90"
        prop="stock"
      />
      <el-table-column
        align="center"
        label="排序"
        min-width="70"
        prop="sort"
      />
      <el-table-column
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      >
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :limit.sync="queryParams.pageSize"
      :page.sync="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        @click="confirm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as ProductCategoryApi from '@/api/mall/product/category'
import * as ProductSpuApi from '@/api/mall/product/spu'
import { handleTree, parseTime } from '@/utils/ruoyi'

export default {
  name: 'PromotionSpuSelect',
  props: {
    isSelectSku: {
      type: Boolean,
      default: false
    },
    radio: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      total: 0,
      list: [],
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      queryParams: this.defaultQueryParams(),
      propertyList: [],
      spuData: {},
      isExpand: false,
      expandRowKeys: [],
      selectedSpuId: 0,
      selectedSkuIds: [],
      categoryList: [],
      categoryProps: {
        value: 'id',
        label: 'name',
        children: 'children',
        emitPath: false,
        checkStrictly: true
      }
    }
  },
  mounted() {
    this.getList()
    ProductCategoryApi.getCategoryList({}).then(response => {
      this.categoryList = handleTree(response.data, 'id', 'parentId')
    })
  },
  methods: {
    defaultQueryParams() {
      return {
        pageNo: 1,
        pageSize: 10,
        tabType: 0,
        name: '',
        categoryId: null,
        createTime: []
      }
    },
    selectSku(rows) {
      const skuTable = this.$refs.skuList
      if (this.selectedSpuId === 0) {
        this.$modal.msgWarning('请先选择商品再选择相应的规格！！！')
        skuTable.clearSelection()
        return
      }
      if (rows.length === 0) {
        this.selectedSkuIds = []
        return
      }
      if (this.radio) {
        this.selectedSkuIds = [rows[0].id]
        if (rows.length > 1) {
          skuTable.clearSelection()
          skuTable.toggleRowSelection(rows[rows.length - 1], true)
          return
        }
      } else {
        this.selectedSkuIds = rows.map(sku => sku.id)
      }
    },
    selectSpu(rows) {
      if (rows.length === 0) {
        this.selectedSpuId = 0
        return
      }
      this.selectedSpuId = rows[0].id
      if (this.selectedSkuIds.length > 0) this.selectedSkuIds = []
      if (rows.length > 1) {
        this.$refs.spuList.clearSelection()
        this.$refs.spuList.toggleRowSelection(rows[rows.length - 1], true)
        return
      }
      this.expandChange(rows[0], rows)
    },
    expandChange(row, expandedRows) {
      if (this.selectedSpuId !== 0) {
        if (row.id !== this.selectedSpuId) {
          this.$modal.msgWarning('你已选择商品请先取消')
          this.expandRowKeys = [String(this.selectedSpuId)]
          return Promise.resolve()
        }
        if (this.isExpand && this.spuData.id === row.id) return Promise.resolve()
      }
      this.spuData = {}
      this.propertyList = []
      this.isExpand = false
      if (expandedRows && expandedRows.length === 0) {
        this.expandRowKeys = []
        return Promise.resolve()
      }
      return ProductSpuApi.getSpu(row.id).then(response => {
        const data = response.data
        ;(data.skus || []).forEach(sku => {
          sku.price = this.floatToFixed2(sku.price)
          sku.marketPrice = this.floatToFixed2(sku.marketPrice)
          sku.costPrice = this.floatToFixed2(sku.costPrice)
          sku.firstBrokeragePrice = this.floatToFixed2(sku.firstBrokeragePrice)
          sku.secondBrokeragePrice = this.floatToFixed2(sku.secondBrokeragePrice)
        })
        this.propertyList = this.getPropertyList(data)
        this.spuData = data
        this.isExpand = true
        this.expandRowKeys = [String(row.id)]
      })
    },
    confirm() {
      if (this.selectedSpuId === 0) {
        this.$modal.msgWarning('没有选择任何商品')
        return false
      }
      if (this.isSelectSku && this.selectedSkuIds.length === 0) {
        this.$modal.msgWarning('没有选择任何商品属性')
        return false
      }
      if (this.isSelectSku) this.$emit('confirm', this.selectedSpuId, this.selectedSkuIds)
      else this.$emit('confirm', this.selectedSpuId)
      this.dialogVisible = false
      this.selectedSpuId = 0
      this.selectedSkuIds = []
      return true
    },
    open() {
      this.dialogTitle = '商品选择'
      this.dialogVisible = true
    },
    getList() {
      this.loading = true
      return ProductSpuApi.getSpuPage(this.queryParams).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      return this.getList()
    },
    resetQuery() {
      this.queryParams = this.defaultQueryParams()
      return this.getList()
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
    propertyValue(sku, index) {
      const property = Array.isArray(sku.properties) ? sku.properties[index] : undefined
      return property ? property.valueName : ''
    },
    formatToFraction(value) {
      if (value === undefined) return '0.00'
      return (Number(value) / 100).toFixed(2)
    },
    floatToFixed2(value) {
      return this.formatToFraction(value)
    },
    parseTime
  }
}
</script>

<style scoped>
.sku-image { width: 50px; height: 50px; }
.spu-image { width: 30px; height: 30px; }
.property-value { color: #40aaff; font-weight: 700; }
</style>
