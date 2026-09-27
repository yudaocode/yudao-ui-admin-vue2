<template>
  <el-dialog
    title="商品选择"
    :visible.sync="dialogVisible"
    width="70%"
    append-to-body
  >
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      class="filter-form"
    >
      <el-form-item
        label="商品名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入商品名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="商品分类"
        prop="categoryId"
      >
        <ProductCategorySelect v-model="queryParams.categoryId" />
      </el-form-item>
      <el-form-item
        label="创建时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
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
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      highlight-current-row
    >
      <el-table-column
        label="商品编号"
        prop="id"
        align="center"
        width="100"
      />
      <el-table-column
        label="商品图"
        align="center"
        width="80"
      >
        <template v-slot="scope">
          <el-image
            :src="scope.row.picUrl"
            :preview-src-list="[scope.row.picUrl]"
            class="spu-image"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="商品名称"
        prop="name"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column
        label="商品售价"
        prop="price"
        align="center"
        width="110"
      >
        <template v-slot="scope">￥{{ fenToYuan(scope.row.price) }}</template>
      </el-table-column>
      <el-table-column
        label="销量"
        prop="salesCount"
        align="center"
        width="90"
      />
      <el-table-column
        label="库存"
        prop="stock"
        align="center"
        width="90"
      />
      <el-table-column
        label="排序"
        prop="sort"
        align="center"
        width="80"
      />
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="160"
      >
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="100"
        fixed="right"
      >
        <template v-slot="scope">
          <el-button
            type="text"
            size="mini"
            @click="selectSpu(scope.row)"
          >选择规格</el-button>
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

    <div
      v-if="selectedSpu"
      class="sku-section"
    >
      <div class="sku-title">已选商品：{{ selectedSpu.name }}，请选择参与活动的规格</div>
      <el-table
        ref="skuTable"
        v-loading="skuLoading"
        :data="skuList"
        row-key="id"
        @selection-change="handleSkuSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          label="SKU 编号"
          prop="id"
          align="center"
          width="100"
        />
        <el-table-column
          label="规格名称"
          prop="name"
          min-width="180"
        />
        <el-table-column
          label="售价"
          prop="price"
          align="center"
          width="110"
        >
          <template v-slot="scope">￥{{ fenToYuan(scope.row.price) }}</template>
        </el-table-column>
        <el-table-column
          label="库存"
          prop="stock"
          align="center"
          width="100"
        />
      </el-table>
    </div>

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
import { getSpu, getSpuPage } from '@/api/mall/product/spu'
import ProductCategorySelect from '@/views/mall/product/category/components/ProductCategorySelect.vue'
import { parseTime } from '@/utils/ruoyi'

export default {
  name: 'CombinationSpuSelect',
  components: { ProductCategorySelect },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      skuLoading: false,
      total: 0,
      list: [],
      selectedSpu: null,
      skuList: [],
      selectedSkuIds: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        tabType: 0,
        name: '',
        categoryId: null,
        createTime: []
      }
    }
  },
  methods: {
    open() {
      this.dialogVisible = true
      this.selectedSpu = null
      this.skuList = []
      this.selectedSkuIds = []
      return this.getList()
    },
    getList() {
      this.loading = true
      return getSpuPage(this.queryParams)
        .then((response) => {
          const page = response.data
          this.list = page.list
          this.total = page.total
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
    selectSpu(row) {
      this.skuLoading = true
      this.selectedSpu = row
      this.skuList = []
      this.selectedSkuIds = []
      return getSpu(row.id)
        .then((response) => {
          const detail = response.data
          this.selectedSpu = detail
          this.skuList = detail.skus
          this.$nextTick(() => {
            if (this.$refs.skuTable) this.$refs.skuTable.clearSelection()
          })
        })
        .finally(() => {
          this.skuLoading = false
        })
    },
    handleSkuSelectionChange(rows) {
      this.selectedSkuIds = rows.map((sku) => sku.id)
    },
    confirm() {
      if (!this.selectedSpu) {
        this.$modal.msgWarning('没有选择任何商品')
        return false
      }
      if (this.selectedSkuIds.length === 0) {
        this.$modal.msgWarning('没有选择任何商品属性')
        return false
      }
      this.$emit('confirm', this.selectedSpu.id, this.selectedSkuIds.slice())
      this.dialogVisible = false
      return true
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
.spu-image {
  width: 40px;
  height: 40px;
}

.sku-section {
  margin-top: 20px;
}

.sku-title {
  margin-bottom: 10px;
  font-weight: 600;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .filter-form {
    ::v-deep .el-form-item {
      display: block;
      margin-right: 0;
    }
  }

  .sku-section {
    overflow-x: auto;
  }
}
</style>
