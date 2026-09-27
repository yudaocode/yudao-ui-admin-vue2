<template>
  <div class="app-container oa-supply-item">
    <doc-alert
      title="【行政】办公用品、用印管理"
      url="https://doc.iocoder.cn/oa/administration/supply-seal/"
    />
    <!-- 搜索工作栏 -->
    <content-wrap>
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="80px"
        @submit.native.prevent
      >
        <el-form-item label="物品名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入物品名称"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="物品编码" prop="no">
          <el-input
            v-model="queryParams.no"
            placeholder="请输入物品编码"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-select
            v-model="queryParams.category"
            placeholder="请选择类别"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in categoryOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="管理类型" prop="manageType">
          <el-select
            v-model="queryParams.manageType"
            placeholder="请选择管理类型"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in manageTypeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
            <el-option label="正常" :value="0" />
            <el-option label="停用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button
            v-hasPermi="['oa:supply-item:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
        </el-form-item>
      </el-form>
    </content-wrap>
    <!-- 列表 -->
    <content-wrap>
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column label="物品名称" prop="name" min-width="140" />
        <el-table-column label="物品编码" prop="no" min-width="120" />
        <el-table-column label="类别" min-width="100" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_SUPPLY_CATEGORY" :value="scope.row.category" />
          </template>
        </el-table-column>
        <el-table-column label="管理类型" min-width="100" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_SUPPLY_MANAGE_TYPE" :value="scope.row.manageType" />
          </template>
        </el-table-column>
        <el-table-column label="规格型号" prop="model" min-width="100" />
        <el-table-column label="计量单位" prop="unit" width="80" align="center" />
        <el-table-column
          label="参考单价"
          prop="referencePrice"
          width="100"
          header-align="center"
          align="right"
          :formatter="erpPriceTableColumnFormatter"
        />
        <el-table-column label="库存数量" width="100" align="center">
          <template slot-scope="scope">
            <span
              :class="scope.row.minStockQuantity > 0 && scope.row.stockQuantity < scope.row.minStockQuantity ? 'stock-warning' : ''"
            >
              {{ scope.row.stockQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="最低库存" prop="minStockQuantity" width="80" align="center" />
        <el-table-column label="图片" width="80" align="center">
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.picUrl"
              :src="scope.row.picUrl"
              :preview-src-list="[scope.row.picUrl]"
              fit="cover"
              class="item-pic"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{ scope.row.status === 0 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属部门" prop="deptName" min-width="120" />
        <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" width="180" />
        <el-table-column label="操作" fixed="right" width="165" align="center">
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['oa:supply-item:update']"
              type="text"
              size="mini"
              @click="openForm('update', scope.row.id)"
            >修改</el-button>
            <el-button
              v-hasPermi="['oa:supply-item:stock-in']"
              type="text"
              size="mini"
              @click="$refs.stockForm.open(scope.row)"
            >入库</el-button>
            <el-button
              v-hasPermi="['oa:supply-item:delete']"
              type="text"
              size="mini"
              class="danger-text"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </content-wrap>
    <!-- 表单弹窗 -->
    <oa-supply-item-form ref="form" @success="getList" />
    <oa-supply-stock-form ref="stockForm" @success="getList" />
  </div>
</template>

<script>
import { dateFormatter } from '@/utils/formatTime'
import { erpPriceTableColumnFormatter } from '@/utils'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as SupplyItemApi from '@/api/oa/supply/item'
import OaSupplyItemForm from './OaSupplyItemForm.vue'
import OaSupplyStockForm from './OaSupplyStockForm.vue'

export default {
  name: 'OaSupplyItem',
  components: { OaSupplyItemForm, OaSupplyStockForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        no: undefined,
        category: undefined,
        manageType: undefined,
        status: undefined
      }
    }
  },
  computed: {
    categoryOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SUPPLY_CATEGORY)
    },
    manageTypeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SUPPLY_MANAGE_TYPE)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    erpPriceTableColumnFormatter,
    getList() {
      this.loading = true
      return SupplyItemApi.getSupplyItemPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id, this.queryParams.category)
    },
    handleDelete(id) {
      return this.$modal.delConfirm().then(() => {
        return SupplyItemApi.deleteSupplyItem(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.item-pic {
  width: 40px;
  height: 40px;
}

.stock-warning {
  color: #f56c6c;
}

.danger-text {
  color: #f56c6c;
}
</style>
