<template>
  <el-dialog
    title="商品选择"
    :visible.sync="dialogVisible"
    width="70%"
    append-to-body
    class="bargain-spu-select"
    @closed="resetSelection"
  >
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      class="bargain-spu-select__filter"
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
          class="bargain-spu-select__date"
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
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.picUrl"
            :src="scope.row.picUrl"
            :preview-src-list="[scope.row.picUrl]"
            fit="cover"
            class="bargain-spu-select__image"
          />
          <span v-else>--</span>
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
        <template slot-scope="scope">￥{{ fenToYuan(scope.row.price) }}</template>
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
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="100"
        fixed="right"
      >
        <template slot-scope="scope">
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
      class="bargain-spu-select__sku-section"
    >
      <div class="bargain-spu-select__sku-title">
        已选商品：{{ selectedSpu.name }}，请选择一个参与砍价的规格
      </div>
      <el-table
        v-loading="skuLoading"
        :data="skuList"
        row-key="id"
        highlight-current-row
        @row-click="handleSkuRowClick"
      >
        <el-table-column
          label="选择"
          align="center"
          width="70"
        >
          <template slot-scope="scope">
            <el-radio
              v-model="selectedSkuId"
              :label="scope.row.id"
            >&nbsp;</el-radio>
          </template>
        </el-table-column>
        <el-table-column
          label="SKU 编号"
          prop="id"
          align="center"
          width="100"
        />
        <el-table-column
          label="规格名称"
          min-width="180"
        >
          <template slot-scope="scope">{{ formatSkuName(scope.row) }}</template>
        </el-table-column>
        <el-table-column
          label="售价"
          prop="price"
          align="center"
          width="110"
        >
          <template slot-scope="scope">￥{{ fenToYuan(scope.row.price) }}</template>
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
  name: 'BargainSpuSelect',
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
      selectedSkuId: null,
      listRequestSequence: 0,
      detailRequestSequence: 0,
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
  beforeDestroy() {
    this.listRequestSequence += 1
    this.detailRequestSequence += 1
  },
  methods: {
    open() {
      this.dialogVisible = true
      this.resetSelection()
      return this.getList()
    },
    async getList() {
      const requestId = ++this.listRequestSequence
      this.loading = true
      try {
        const response = await getSpuPage({ ...this.queryParams })
        if (requestId !== this.listRequestSequence) return false
        const page = response.data
        this.list = page.list
        this.total = page.total
        return true
      } finally {
        if (requestId === this.listRequestSequence) this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    async selectSpu(row) {
      const requestId = ++this.detailRequestSequence
      this.skuLoading = true
      this.selectedSpu = row
      this.skuList = []
      this.selectedSkuId = null
      try {
        const response = await getSpu(row.id)
        if (requestId !== this.detailRequestSequence) return false
        const detail = response.data
        this.selectedSpu = detail
        this.skuList = detail.skus
        return true
      } finally {
        if (requestId === this.detailRequestSequence) this.skuLoading = false
      }
    },
    handleSkuRowClick(row) {
      this.selectedSkuId = row.id
    },
    confirm() {
      if (!this.selectedSpu) {
        this.$modal.msgWarning('没有选择任何商品')
        return false
      }
      if (this.selectedSkuId === null || this.selectedSkuId === undefined) {
        this.$modal.msgWarning('没有选择任何商品属性')
        return false
      }
      this.$emit('confirm', this.selectedSpu.id, [this.selectedSkuId])
      this.dialogVisible = false
      return true
    },
    resetSelection() {
      this.detailRequestSequence += 1
      this.selectedSpu = null
      this.skuList = []
      this.selectedSkuId = null
      this.skuLoading = false
    },
    formatSkuName(sku) {
      if (sku && sku.name) return sku.name
      const properties = sku && Array.isArray(sku.properties) ? sku.properties : []
      const labels = properties.map((item) => item.valueName || item.name || item.propertyName)
        .filter(Boolean)
      return labels.length > 0 ? labels.join(' / ') : '默认规格'
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
.bargain-spu-select__date {
  width: 240px;
}

.bargain-spu-select__image {
  display: block;
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border-radius: 3px;
}

.bargain-spu-select__sku-section {
  margin-top: 20px;
  overflow-x: auto;
}

.bargain-spu-select__sku-title {
  margin-bottom: 10px;
  font-weight: 600;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .bargain-spu-select {
    ::v-deep .el-dialog {
      width: calc(100% - 24px) !important;
    }
  }

  .bargain-spu-select__filter {
    ::v-deep .el-form-item {
      display: block;
      margin-right: 0;
    }

    ::v-deep .el-input,
    ::v-deep .el-date-editor {
      width: 100%;
    }
  }

  .bargain-spu-select__date {
    width: 100%;
  }
}
</style>
