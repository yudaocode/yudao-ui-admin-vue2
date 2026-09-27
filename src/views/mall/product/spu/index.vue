<!-- 商品中心 - 商品列表 -->
<template>
  <div class="app-container">
    <doc-alert
      title="【商品】商品 SPU 与 SKU"
      url="https://doc.iocoder.cn/mall/product-spu-sku/"
    />

    <el-card
      class="search-card"
      shadow="never"
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
            :props="defaultProps"
            clearable
            filterable
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
            range-separator="-"
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
          <el-button
            v-hasPermi="['product:spu:create']"
            icon="el-icon-plus"
            plain
            type="primary"
            @click="openForm()"
          >新增</el-button>
          <el-button
            v-hasPermi="['product:spu:export']"
            :loading="exportLoading"
            icon="el-icon-download"
            plain
            type="success"
            @click="handleExport"
          >导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-tabs
        :value="String(queryParams.tabType)"
        @tab-click="handleTabClick"
      >
        <el-tab-pane
          v-for="item in tabsData"
          :key="item.type"
          :label="item.name + '(' + item.count + ')'"
          :name="String(item.type)"
        />
      </el-tabs>
      <el-table
        v-loading="loading"
        :data="list"
      >
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-form
              class="spu-table-expand"
              label-position="left"
            >
              <el-row>
                <el-col :span="8">
                  <el-form-item label="商品分类:">
                    <span>{{ formatCategoryName(scope.row.categoryId) }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="市场价:">
                    <span>{{ fenToYuan(scope.row.marketPrice) }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="成本价:">
                    <span>{{ fenToYuan(scope.row.costPrice) }}</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item label="浏览量:">
                    <span>{{ scope.row.browseCount }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="虚拟销量:">
                    <span>{{ scope.row.virtualSalesCount }}</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column
          label="商品编号"
          min-width="140"
          prop="id"
        />
        <el-table-column
          label="商品信息"
          min-width="300"
        >
          <template slot-scope="scope">
            <div class="product-info">
              <el-image
                :preview-src-list="scope.row.picUrl ? [scope.row.picUrl] : []"
                :src="scope.row.picUrl"
                fit="cover"
                class="product-image"
              />
              <el-tooltip
                :content="scope.row.name"
                effect="dark"
                placement="top"
              >
                <div class="product-name">{{ scope.row.name }}</div>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="价格"
          min-width="160"
          prop="price"
        >
          <template slot-scope="scope">¥ {{ fenToYuan(scope.row.price) }}</template>
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
          label="销售状态"
          min-width="100"
        >
          <template slot-scope="scope">
            <el-switch
              v-if="scope.row.status >= 0"
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              active-text="上架"
              inactive-text="下架"
              @change="handleStatusChange(scope.row)"
            />
            <el-tag
              v-else
              type="info"
            >回收站</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :formatter="dateFormatter"
          align="center"
          label="创建时间"
          prop="createTime"
          width="180"
        />
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          min-width="200"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="openDetail(scope.row.id)"
            >详情</el-button>
            <el-button
              v-hasPermi="['product:spu:update']"
              type="text"
              @click="openForm(scope.row.id)"
            >修改</el-button>
            <template v-if="queryParams.tabType === 4">
              <el-button
                v-hasPermi="['product:spu:delete']"
                type="text"
                @click="handleDelete(scope.row.id)"
              >删除</el-button>
              <el-button
                v-hasPermi="['product:spu:update']"
                type="text"
                @click="handleStatus02Change(scope.row, ProductSpuStatusEnum.DISABLE.status)"
              >恢复</el-button>
            </template>
            <el-button
              v-else
              v-hasPermi="['product:spu:update']"
              type="text"
              @click="handleStatus02Change(scope.row, ProductSpuStatusEnum.RECYCLE.status)"
            >回收</el-button>
          </template>
        </el-table-column>
      </el-table>
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
import * as ProductSpuApi from '@/api/mall/product/spu'
import * as ProductCategoryApi from '@/api/mall/product/category'
import { ProductSpuStatusEnum } from '@/utils/constants'
import { dateFormatter, fenToYuan } from '@/utils'
import { defaultProps, handleTree, treeToString } from '@/utils/tree'

export default {
  name: 'ProductSpu',
  data() {
    return {
      ProductSpuStatusEnum,
      defaultProps,
      loading: false,
      exportLoading: false,
      total: 0,
      list: [],
      tabsData: [
        { name: '出售中', type: 0, count: 0 },
        { name: '仓库中', type: 1, count: 0 },
        { name: '已售罄', type: 2, count: 0 },
        { name: '警戒库存', type: 3, count: 0 },
        { name: '回收站', type: 4, count: 0 }
      ],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        tabType: 0,
        name: '',
        categoryId: undefined,
        createTime: undefined
      },
      categoryList: []
    }
  },
  created() {
    this.init()
  },
  activated() {
    this.getList()
  },
  methods: {
    fenToYuan,
    dateFormatter,
    async init() {
      if (this.$route.query.categoryId) {
        this.queryParams.categoryId = Number(this.$route.query.categoryId)
      }
      await this.getTabsCount()
      await this.getList()
      const response = await ProductCategoryApi.getCategoryList({})
      this.categoryList = handleTree(response.data, 'id', 'parentId')
    },
    async getList() {
      this.loading = true
      try {
        const response = await ProductSpuApi.getSpuPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleTabClick(tab) {
      this.queryParams.tabType = Number(tab.name)
      return this.getList()
    },
    async getTabsCount() {
      const response = await ProductSpuApi.getTabsCount(this.queryParams)
      for (const key in response.data) {
        this.tabsData[Number(key)].count = response.data[key]
      }
    },
    async handleStatus02Change(row, newStatus) {
      try {
        const text = newStatus === ProductSpuStatusEnum.RECYCLE.status ? '加入到回收站' : '恢复到仓库'
        await this.$modal.confirm(`确认要"${row.name}"${text}吗？`)
        await ProductSpuApi.updateStatus({ id: row.id, status: newStatus })
        this.$modal.msgSuccess(text + '成功')
        await this.getTabsCount()
        await this.getList()
      } catch (error) {
        // 用户取消操作
      }
    },
    async handleStatusChange(row) {
      try {
        const text = row.status ? '上架' : '下架'
        await this.$modal.confirm(`确认要${text}"${row.name}"吗？`)
        await ProductSpuApi.updateStatus({ id: row.id, status: row.status })
        this.$modal.msgSuccess(text + '成功')
        await this.getTabsCount()
        await this.getList()
      } catch (error) {
        row.status = row.status === ProductSpuStatusEnum.DISABLE.status
          ? ProductSpuStatusEnum.ENABLE.status
          : ProductSpuStatusEnum.DISABLE.status
      }
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除所选商品？')
        await ProductSpuApi.deleteSpu(id)
        this.$modal.msgSuccess(this.$t('common.delSuccess'))
        await this.getTabsCount()
        await this.getList()
      } catch (error) {
        // 用户取消操作
      }
    },
    handleQuery() {
      this.getList()
      this.getTabsCount()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    openForm(id) {
      if (typeof id === 'number') {
        this.$router.push({ name: 'ProductSpuEdit', params: { id }})
        return
      }
      this.$router.push({ name: 'ProductSpuAdd' })
    },
    openDetail(id) {
      this.$router.push({ name: 'ProductSpuDetail', params: { id }})
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出所有商品数据项？')
        this.exportLoading = true
        const response = await ProductSpuApi.exportSpu(this.queryParams)
        this.$download.excel(response.data, '商品列表.xls')
      } catch (error) {
        // 用户取消导出
      } finally {
        this.exportLoading = false
      }
    },
    formatCategoryName(categoryId) {
      return treeToString(this.categoryList, categoryId)
    }
  }
}
</script>

<style scoped>
.search-card {
  margin-bottom: 16px;
}

.product-info {
  display: flex;
  align-items: center;
  min-width: 0;
}

.product-image {
  flex: none;
  width: 50px;
  height: 50px;
}

.product-name {
  margin-left: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spu-table-expand ::v-deep .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
}
</style>
