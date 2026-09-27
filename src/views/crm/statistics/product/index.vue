<!-- 数据统计 - 产品分析 -->
<template>
  <div class="app-container crm-statistics-product">
    <el-card
      shadow="never"
      class="query-card"
    >
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="76px"
      >
        <el-form-item
          label="时间范围"
          prop="times"
        >
          <el-date-picker
            v-model="queryParams.times"
            type="daterange"
            value-format="yyyy-MM-dd HH:mm:ss"
            :clearable="false"
            :default-time="['00:00:00', '23:59:59']"
            :picker-options="datePickerOptions"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="query-control date-control"
            @change="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="归属部门"
          prop="deptId"
        >
          <treeselect
            v-model="queryParams.deptId"
            :options="deptList"
            :normalizer="normalizer"
            :clearable="false"
            :show-count="true"
            placeholder="请选择归属部门"
            class="query-control"
            @input="handleDeptChange"
          />
        </el-form-item>
        <el-form-item
          label="员工"
          prop="userId"
        >
          <el-select
            v-model="queryParams.userId"
            clearable
            filterable
            placeholder="请选择员工"
            class="query-control"
            @change="handleQuery"
          >
            <el-option
              v-for="user in userListByDeptId"
              :key="user.id"
              :label="user.nickname"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="产品分类"
          prop="categoryId"
        >
          <treeselect
            v-model="queryParams.categoryId"
            :options="productCategoryList"
            :normalizer="normalizer"
            :clearable="true"
            :show-count="true"
            placeholder="请选择产品分类"
            class="query-control"
            @input="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="产品"
          prop="productId"
        >
          <el-select
            v-model="queryParams.productId"
            clearable
            filterable
            placeholder="请选择产品"
            class="query-control"
            @change="handleQuery"
          >
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="handleQuery"
          >查询</el-button>
          <el-button
            icon="el-icon-refresh"
            @click="resetQuery"
          >重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-tabs
      v-model="activeTab"
      class="analysis-tabs"
    >
      <el-tab-pane
        label="产品销售情况统计"
        name="productSalesList"
        lazy
      >
        <product-sales-list
          ref="productSalesListRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="产品分类销售分析"
        name="productCategorySummary"
        lazy
      >
        <product-category-summary
          ref="productCategorySummaryRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { getSimpleDeptList } from '@/api/system/dept'
import { getSimpleUserList } from '@/api/system/user'
import { getProductSimpleList } from '@/api/crm/product'
import { getProductCategoryList } from '@/api/crm/product/category'
import { formatDate } from '@/utils'
import { beginOfDay, endOfDay } from '@/utils/dateUtils'
import { handleTree } from '@/utils/ruoyi'
import ProductSalesList from './components/ProductSalesList.vue'
import ProductCategorySummary from './components/ProductCategorySummary.vue'

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000

function getDefaultTimes() {
  const now = Date.now()
  return [
    formatDate(beginOfDay(new Date(now - DAY_MILLISECONDS * 30))),
    formatDate(endOfDay(new Date(now - DAY_MILLISECONDS)))
  ]
}

function createQueryParams(deptId) {
  return {
    deptId,
    userId: undefined,
    categoryId: undefined,
    productId: undefined,
    times: getDefaultTimes()
  }
}

function createShortcut(text, rangeFactory) {
  return {
    text,
    onClick(picker) {
      picker.$emit('pick', rangeFactory())
    }
  }
}

function createDatePickerOptions() {
  return {
    shortcuts: [
      createShortcut('今天', () => {
        const now = new Date()
        return [beginOfDay(now), endOfDay(now)]
      }),
      createShortcut('昨天', () => {
        const yesterday = new Date(Date.now() - DAY_MILLISECONDS)
        return [beginOfDay(yesterday), endOfDay(yesterday)]
      }),
      createShortcut('最近七天', () => {
        const now = new Date()
        return [beginOfDay(new Date(Date.now() - DAY_MILLISECONDS * 6)), endOfDay(now)]
      }),
      createShortcut('最近 30 天', () => {
        const now = new Date()
        return [beginOfDay(new Date(Date.now() - DAY_MILLISECONDS * 29)), endOfDay(now)]
      }),
      createShortcut('本月', () => {
        const now = new Date()
        return [new Date(now.getFullYear(), now.getMonth(), 1), endOfDay(now)]
      }),
      createShortcut('今年', () => {
        const now = new Date()
        return [new Date(now.getFullYear(), 0, 1), endOfDay(now)]
      })
    ]
  }
}

export default {
  name: 'CrmStatisticsProduct',
  components: {
    Treeselect,
    ProductSalesList,
    ProductCategorySummary
  },
  data() {
    return {
      queryParams: createQueryParams(this.$store.getters.deptId),
      datePickerOptions: createDatePickerOptions(),
      deptList: [],
      userList: [],
      productCategoryList: [],
      productList: [],
      activeTab: 'productSalesList'
    }
  },
  computed: {
    userListByDeptId() {
      if (this.queryParams.deptId === undefined || this.queryParams.deptId === null) return []
      return this.userList.filter(user => String(user.deptId) === String(this.queryParams.deptId))
    }
  },
  watch: {
    activeTab: 'handleQuery'
  },
  created() {
    this.initialize()
  },
  methods: {
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
        children: node.children && node.children.length ? node.children : undefined
      }
    },
    async initialize() {
      const responses = await Promise.all([
        getSimpleDeptList(),
        getSimpleUserList(),
        getProductCategoryList({}),
        getProductSimpleList()
      ])
      const depts = (responses[0]).data
      const users = (responses[1]).data
      const categories = (responses[2]).data
      const products = (responses[3]).data
      this.deptList = handleTree(depts, 'id', 'parentId')
      this.userList = users
      this.productCategoryList = handleTree(categories, 'id', 'parentId')
      this.productList = products
      this.loadActiveTab()
    },
    loadActiveTab() {
      this.$nextTick(() => {
        const referenceName = this.activeTab === 'productSalesList'
          ? 'productSalesListRef'
          : 'productCategorySummaryRef'
        const component = this.$refs[referenceName]
        if (component && typeof component.loadData === 'function') component.loadData()
      })
    },
    handleQuery() {
      this.loadActiveTab()
    },
    handleDeptChange() {
      this.queryParams.userId = undefined
      this.handleQuery()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.handleQuery()
    }
  }
}
</script>

<style scoped>
.query-card {
  margin-bottom: 16px;
}

.query-card .el-form-item {
  margin-bottom: 12px;
}

.query-control {
  width: 240px;
}

.date-control {
  width: 360px;
}

.analysis-tabs {
  min-width: 0;
}
</style>
