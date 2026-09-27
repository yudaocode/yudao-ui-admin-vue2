<template>
  <div class="app-container wm-migrated">
    <doc-alert
      title="【仓库】批次管理、库存现有量、库存事务"
      url="https://doc.iocoder.cn/mes/wm/stock/"
    />

    <el-row :gutter="20">
      <!-- 左侧分类树 -->
      <el-col
        :span="4"
        :xs="24"
      >
        <el-card
          shadow="never"
          class="wm-content-wrap h-1/1"
        >
          <MdItemTypeTree @node-click="handleTypeNodeClick" />
        </el-card>
      </el-col>
      <el-col
        :span="20"
        :xs="24"
      >
        <el-card
          shadow="never"
          class="wm-content-wrap"
        >
          <!-- 搜索工作栏 -->
          <el-form
            ref="queryFormRef"
            class="-mb-15px"
            :model="queryParams"
            :inline="true"
            label-width="68px"
          >
            <el-form-item
              label="物料"
              prop="itemId"
            >
              <MdItemSelect
                v-model="queryParams.itemId"
                placeholder="请选择物料"
                class="wm-w-240"
              />
            </el-form-item>
            <el-form-item
              label="批次号"
              prop="batchCode"
            >
              <el-input
                v-model="queryParams.batchCode"
                placeholder="请输入批次号"
                clearable
                class="wm-w-200"
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>
            <el-form-item
              label="仓库"
              prop="warehouseId"
            >
              <WmWarehouseSelect
                v-model="queryParams.warehouseId"
                class="wm-w-200"
                @change="handleWarehouseChange"
              />
            </el-form-item>
            <el-form-item
              label="库区"
              prop="locationId"
            >
              <WmWarehouseLocationSelect
                v-model="queryParams.locationId"
                :warehouse-id="queryParams.warehouseId"
                class="wm-w-200"
              />
            </el-form-item>
            <el-form-item
              label="是否冻结"
              prop="frozen"
            >
              <el-select
                v-model="queryParams.frozen"
                placeholder="请选择"
                clearable
                class="wm-w-200"
              >
                <el-option
                  :value="true"
                  label="是"
                />
                <el-option
                  :value="false"
                  label="否"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button @click="handleQuery">
                <i class="el-icon-search mr-5px" /> 搜索
              </el-button>
              <el-button @click="resetQuery">
                <i class="el-icon-refresh mr-5px" /> 重置
              </el-button>
              <el-button
                v-hasPermi="['mes:wm-material-stock:export']"
                type="success"
                plain
                :loading="exportLoading"
                @click="handleExport"
              >
                <i class="el-icon-download mr-5px" /> 导出
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 列表 -->
        <el-card
          shadow="never"
          class="wm-content-wrap"
        >
          <el-table
            v-loading="loading"
            :data="list"
            :stripe="true"
            :show-overflow-tooltip="true"
          >
            <el-table-column
              label="产品物料编码"
              align="center"
              prop="itemCode"
              min-width="120"
            />
            <el-table-column
              label="产品物料名称"
              align="center"
              prop="itemName"
              min-width="140"
            />
            <el-table-column
              label="规格型号"
              align="center"
              prop="specification"
              min-width="120"
            />
            <el-table-column
              label="在库数量"
              align="center"
              prop="quantity"
              min-width="100"
            />
            <el-table-column
              label="单位"
              align="center"
              prop="unitMeasureName"
              min-width="80"
            />
            <el-table-column
              label="批次号"
              align="center"
              prop="batchCode"
              min-width="140"
            >
              <template slot-scope="scope">
                <el-button
                  v-if="scope.row.batchId"

                  type="text"
                  @click="openBatchDetail(scope.row.batchId)"
                >
                  {{ scope.row.batchCode }}
                </el-button>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column
              label="仓库"
              align="center"
              prop="warehouseName"
              min-width="100"
            />
            <el-table-column
              label="库区"
              align="center"
              prop="locationName"
              min-width="100"
            />
            <el-table-column
              label="库位"
              align="center"
              prop="areaName"
              min-width="100"
            >
              <template slot-scope="scope">
                <el-button
                  v-if="scope.row.areaId"

                  type="text"
                  @click="openAreaDetail(scope.row.areaId)"
                >
                  {{ scope.row.areaName }}
                </el-button>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column
              label="入库日期"
              align="center"
              prop="receiptTime"
              :formatter="dateFormatter2"
              width="180px"
            />
            <el-table-column
              label="冻结"
              align="center"
              prop="frozen"
              min-width="80"
            >
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.frozen"
                  v-hasPermi="['mes:wm-material-stock:update']"
                  :active-value="true"
                  :inactive-value="false"
                  @change="handleFrozenChange(scope.row)"
                />
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <Pagination
            :total="total"
            :page.sync="queryParams.pageNo"
            :limit.sync="queryParams.pageSize"
            @pagination="getList"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 库位详情弹窗 -->
    <AreaForm ref="areaFormRef" />

    <!-- 批次详情弹窗 -->
    <BatchForm ref="batchFormRef" />
  </div>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { dateFormatter2 } from '@/utils/formatTime'
import download from '@/plugins/download'
import { WmMaterialStockApi } from '@/api/mes/wm/materialstock'
import MdItemTypeTree from '@/views/mes/md/item/type/components/MdItemTypeTree.vue'
import AreaForm from '@/views/mes/wm/warehouse/area/AreaForm.vue'
import BatchForm from '@/views/mes/wm/batch/BatchForm.vue'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WmWarehouseLocationSelect from '@/views/mes/wm/warehouse/components/WmWarehouseLocationSelect.vue'
export default {
  name: 'MesWmMaterialStock',
  components: { MdItemTypeTree, AreaForm, BatchForm, MdItemSelect, WmWarehouseSelect, WmWarehouseLocationSelect },
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const message = {
      success: (content) => vm.$modal.msgSuccess(content),
      error: (content) => vm.$modal.msgError(content),
      warning: (content) => vm.$modal.msgWarning(content),
      confirm: (content) => vm.$modal.confirm(content),
      delConfirm: (content) => vm.$modal.confirm(content || '是否确认删除选中的数据项？'),
      exportConfirm: (content) => vm.$modal.confirm(content || '是否确认导出所有数据项？')
    } // 消息弹窗
    const loading = ref(true) // 列表的加载中
    const list = ref([]) // 列表的数据
    const total = ref(0) // 列表的总页数
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      itemTypeId: undefined,
      itemId: undefined,
      batchCode: undefined,
      warehouseId: undefined,
      locationId: undefined,
      frozen: undefined
    })
    const queryFormRef = ref() // 搜索的表单
    const exportLoading = ref(false) // 导出的加载中
    /** 仓库切换时清空库区 */
    const handleWarehouseChange = () => {
      queryParams.locationId = undefined
    }
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await WmMaterialStockApi.getMaterialStockPage(queryParams)).data
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
      queryFormRef.value.resetFields()
      queryParams.itemTypeId = undefined
      handleQuery()
    }
    /** 处理分类树节点点击 */
    const handleTypeNodeClick = (row) => {
      queryParams.itemTypeId = row === null || row === void 0 ? void 0 : row.id
      handleQuery()
    }
    /** 处理冻结状态切换 */
    const handleFrozenChange = async(row) => {
      try {
        const text = row.frozen ? '冻结' : '解冻'
        await message.confirm('确认要"' + text + '"该库存记录吗?');
        (await WmMaterialStockApi.updateMaterialStockFrozen({ id: row.id, frozen: row.frozen })).data
        message.success(text + '成功')
      } catch {
        // 取消或失败时回滚
        row.frozen = !row.frozen
      }
    }
    /** 打开库位详情弹窗 */
    const areaFormRef = ref()
    const openAreaDetail = (areaId) => {
      areaFormRef.value.open('detail', areaId)
    }
    /** 打开批次详情弹窗 */
    const batchFormRef = ref()
    const openBatchDetail = (batchId) => {
      batchFormRef.value.open(batchId)
    }
    /** 导出按钮操作 */
    const handleExport = async() => {
      try {
        await message.exportConfirm()
        exportLoading.value = true
        const data = await WmMaterialStockApi.exportMaterialStock(queryParams)
        download.excel(data, '库存台账.xls')
      } catch {
        // Keep the current state when the user cancels or the request fails.
      } finally {
        exportLoading.value = false
      }
    }
    /** 初始化 */
    onMounted(async() => {
      await getList()
    })
    return { AreaForm, BatchForm, MdItemSelect, MdItemTypeTree, WmWarehouseLocationSelect, WmWarehouseSelect, areaFormRef, batchFormRef, dateFormatter2, download, exportLoading, getList, handleExport, handleFrozenChange, handleQuery, handleTypeNodeClick, handleWarehouseChange, list, loading, message, openAreaDetail, openBatchDetail, queryFormRef, queryParams, resetQuery, total }
  }
}
</script>

<style scoped>
.wm-content-wrap { margin-bottom: 20px; }
.wm-w-full { width: 100%; }
.wm-w-240 { width: 240px; }
.wm-w-220 { width: 220px; }
.wm-w-200 { width: 200px; }
.mr-5px { margin-right: 5px; }
</style>
