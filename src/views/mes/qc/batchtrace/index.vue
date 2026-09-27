<template>
  <div class="app-container qc-migrated">
    <doc-alert
      title="【仓库】批次管理、库存现有量、库存事务"
      url="https://doc.iocoder.cn/mes/wm/stock/"
    />

    <el-card
      shadow="never"
      class="qc-content-wrap"
    >
      <!-- 搜索工作栏 -->
      <el-form
        ref="queryFormRef"
        class="-mb-15px"
        :model="queryParams"
        :inline="true"
        label-width="100px"
      >
        <el-form-item
          label="批次号"
          prop="code"
        >
          <el-input
            v-model="queryParams.code"
            placeholder="请输入批次号"
            clearable
            class="qc-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="产品物料"
          prop="itemId"
        >
          <MdItemSelect
            v-model="queryParams.itemId"
            class="qc-w-240"
          />
        </el-form-item>
        <el-form-item
          label="供应商"
          prop="vendorId"
        >
          <MdVendorSelect
            v-model="queryParams.vendorId"
            class="qc-w-240"
          />
        </el-form-item>
        <el-form-item
          label="客户"
          prop="clientId"
        >
          <MdClientSelect
            v-model="queryParams.clientId"
            class="qc-w-240"
          />
        </el-form-item>
        <el-form-item
          label="销售订单编号"
          prop="salesOrderCode"
        >
          <el-input
            v-model="queryParams.salesOrderCode"
            placeholder="请输入销售订单编号"
            clearable
            class="qc-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="采购订单编号"
          prop="purchaseOrderCode"
        >
          <el-input
            v-model="queryParams.purchaseOrderCode"
            placeholder="请输入采购订单编号"
            clearable
            class="qc-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><i class="el-icon-search mr-5px" />搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh mr-5px" />重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card
      shadow="never"
      class="qc-content-wrap"
    >
      <el-table
        v-loading="loading"
        :data="list"
      >
        <el-table-column
          label="批次编号"
          align="center"
          prop="code"
        />
        <el-table-column
          label="产品物料编码"
          align="center"
          prop="itemCode"
        />
        <el-table-column
          label="产品物料名称"
          align="center"
          prop="itemName"
        />
        <el-table-column
          label="规格型号"
          align="center"
          prop="itemSpecification"
        />
        <el-table-column
          label="单位"
          align="center"
          prop="unitName"
        />
        <el-table-column
          label="供应商编码"
          align="center"
          prop="vendorCode"
        />
        <el-table-column
          label="供应商名称"
          align="center"
          prop="vendorName"
        />
        <el-table-column
          label="客户编码"
          align="center"
          prop="clientCode"
        />
        <el-table-column
          label="客户名称"
          align="center"
          prop="clientName"
        />
        <el-table-column
          label="销售订单编号"
          align="center"
          prop="salesOrderCode"
        />
        <el-table-column
          label="采购订单编号"
          align="center"
          prop="purchaseOrderCode"
        />
        <el-table-column
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button

              v-hasPermi="['mes:wm-batch:query']"
              type="text"
              @click="openDetail(scope.row)"
            >
              批次追溯
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <Pagination
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 批次追溯详情 -->
    <BatchTraceDetail ref="detailRef" />
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { BatchApi } from '@/api/mes/wm/batch'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import MdVendorSelect from '@/views/mes/md/vendor/components/MdVendorSelect.vue'
import MdClientSelect from '@/views/mes/md/client/components/MdClientSelect.vue'
import BatchTraceDetail from './BatchTraceDetail.vue'
export default {
  name: 'BatchTrace',
  components: { MdItemSelect, MdVendorSelect, MdClientSelect, BatchTraceDetail },
  setup(props, { emit }) {
    const loading = ref(true) // 列表的加载中
    const list = ref([]) // 列表的数据
    const total = ref(0) // 列表的总页数
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      code: undefined,
      itemId: undefined,
      vendorId: undefined,
      clientId: undefined,
      salesOrderCode: undefined,
      purchaseOrderCode: undefined
    })
    const queryFormRef = ref() // 搜索的表单
    const detailRef = ref() // 详情弹窗
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await BatchApi.getBatchPage(queryParams)).data
        list.value = data.list
        total.value = data.total
      } finally {
        loading.value = false
      }
    }
    /** 搜索按钮操作 */
    const handleQuery = () => {
      queryParams.pageNo = 1
      getList()
    }
    /** 重置按钮操作 */
    const resetQuery = () => {
      var _a;
      (_a = queryFormRef.value) === null || _a === void 0 ? void 0 : _a.resetFields()
      handleQuery()
    }
    /** 批次追溯按钮操作 */
    const openDetail = (row) => {
      detailRef.value.open(row)
    }
    /** 初始化 */
    onMounted(() => {
      getList()
    })
    return { BatchTraceDetail, MdClientSelect, MdItemSelect, MdVendorSelect, detailRef, getList, handleQuery, list, loading, openDetail, queryFormRef, queryParams, resetQuery, total }
  }
}
</script>

<style scoped>
.qc-content-wrap { margin-bottom: 20px; }
.qc-w-full { width: 100%; }
.qc-w-240 { width: 240px; }
.qc-w-220 { width: 220px; }
.qc-w-200 { width: 200px; }
.mr-5px { margin-right: 5px; }
.mb-10px { margin-bottom: 10px; }
.mt-10px { margin-top: 10px; }
.-mb-15px { margin-bottom: -15px; }
.overflow-hidden { overflow: hidden; }
</style>

