<template>
  <div class="wm-migrated">
    <el-dialog
      title="库存物资选择"
      :visible.sync="dialogVisible"
      width="80%"
      append-to-body
    >
      <el-row :gutter="20">
        <!-- 左侧：分类树 -->
        <el-col
          :span="4"
          :xs="24"
        >
          <el-card
            shadow="never"
            class="wm-content-wrap h-1/1"
          >
            <MdItemTypeTree
              ref="typeTreeRef"
              @node-click="handleNodeClick"
            />
          </el-card>
        </el-col>
        <!-- 右侧：搜索 + 表格 -->
        <el-col
          :span="20"
          :xs="24"
        >
          <!-- 预过滤提示 -->
          <el-card
            shadow="never"
            class="wm-content-wrap"
          >
            <el-alert
              v-if="showAlert"
              :title="alertTitle"
              type="info"
              :closable="false"
              show-icon
              class="!mb-10px"
            />
            <el-form
              :inline="true"
              :model="queryParams"
              label-width="68px"
            >
              <el-form-item label="物料">
                <MdItemSelect
                  v-model="queryParams.itemId"
                  class="wm-w-220"
                />
              </el-form-item>
              <el-form-item label="供应商">
                <MdVendorSelect
                  v-model="queryParams.vendorId"
                  class="wm-w-220"
                />
              </el-form-item>
              <el-form-item label="批次号">
                <el-input
                  v-model="queryParams.batchCode"
                  placeholder="请输入批次号"
                  clearable
                  class="wm-w-220"
                  @keyup.enter.native="handleQuery"
                />
              </el-form-item>
              <el-form-item label="仓库">
                <WmWarehouseSelect
                  v-model="queryParams.warehouseId"
                  class="wm-w-220"
                  @change="handleWarehouseChange"
                />
              </el-form-item>
              <!-- DONE @AI：areaId 增加一个 -->
              <el-form-item label="库区">
                <WmWarehouseLocationSelect
                  v-model="queryParams.locationId"
                  :warehouse-id="queryParams.warehouseId"
                  class="wm-w-220"
                  @change="handleLocationChange"
                />
              </el-form-item>
              <el-form-item label="库位">
                <WmWarehouseAreaSelect
                  v-model="queryParams.areaId"
                  :location-id="queryParams.locationId"
                  class="wm-w-220"
                />
              </el-form-item>
              <el-form-item>
                <el-button @click="handleQuery">
                  <i class="el-icon-search mr-5px" /> 搜索
                </el-button>
                <el-button @click="resetQuery">
                  <i class="el-icon-refresh mr-5px" /> 重置
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
              ref="tableRef"
              v-loading="loading"
              :data="list"
              :stripe="true"
              :show-overflow-tooltip="true"
              row-key="id"
              :highlight-current-row="!multiple"
              @selection-change="handleSelectionChange"
              @row-click="handleRowClick"
              @row-dblclick="handleRowDblClick"
            >
              <!-- 多选：checkbox（reserve-selection 保证跨页勾选不丢失） -->
              <el-table-column
                v-if="multiple"
                type="selection"
                :reserve-selection="true"
                width="50"
                align="center"
              />
              <!-- 单选：radio -->
              <el-table-column
                v-else
                width="50"
                align="center"
              >
                <template slot-scope="{ row }">
                  <el-radio
                    v-model="selectedRadioId"
                    :label="row.id"
                    class="radio-no-label"
                    @change="handleRadioChange(row)"
                  />
                </template>
              </el-table-column>
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
                label="单位"
                align="center"
                prop="unitMeasureName"
                min-width="80"
              />
              <el-table-column
                label="入库批次号"
                align="center"
                prop="batchCode"
                min-width="120"
              />
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
              />
              <el-table-column
                label="在库数量"
                align="center"
                prop="quantity"
                min-width="100"
              />
              <el-table-column
                label="入库日期"
                align="center"
                prop="receiptTime"
                :formatter="dateFormatter2"
                width="180px"
              />
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
      <span slot="footer">
        <el-button
          type="primary"
          @click="confirmSelect"
        >确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, nextTick, toRefs, getCurrentInstance } from 'vue'
import { dateFormatter2 } from '@/utils/formatTime'
import { WmMaterialStockApi } from '@/api/mes/wm/materialstock'
import MdItemTypeTree from '@/views/mes/md/item/type/components/MdItemTypeTree.vue'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import MdVendorSelect from '@/views/mes/md/vendor/components/MdVendorSelect.vue'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WmWarehouseLocationSelect from '@/views/mes/wm/warehouse/components/WmWarehouseLocationSelect.vue'
import WmWarehouseAreaSelect from '@/views/mes/wm/warehouse/components/WmWarehouseAreaSelect.vue'
export default {
  name: 'WmMaterialStockSelectDialog',
  components: { MdItemTypeTree, MdItemSelect, MdVendorSelect, WmWarehouseSelect, WmWarehouseLocationSelect, WmWarehouseAreaSelect },
  props: { 'multiple': { type: Boolean, default: true }, 'itemId': { type: Number }, 'batchId': { type: Number }, 'warehouseId': { type: Number }, 'virtualFilter': { type: String, default: 'exclude' }},
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const message = {
      success: (content) => vm.$modal.msgSuccess(content),
      error: (content) => vm.$modal.msgError(content),
      warning: (content) => vm.$modal.msgWarning(content),
      confirm: (content) => vm.$modal.confirm(content),
      delConfirm: (content) => vm.$modal.confirm(content || '是否确认删除选中的数据项？'),
      exportConfirm: (content) => vm.$modal.confirm(content || '是否确认导出所有数据项？')
    }
    const dialogVisible = ref(false) // 弹窗是否展示
    const loading = ref(false) // 列表加载中
    const list = ref([]) // 库存列表
    const total = ref(0) // 总条数
    // ==================== 选中状态 ====================
    const tableRef = ref() // 表格 Ref
    const typeTreeRef = ref() // 分类树 Ref
    const selectedRows = ref([]) // 多选模式：选中行
    const selectedRadioId = ref() // 单选模式：选中 ID
    const currentRadioRow = ref() // 单选模式：选中行对象
    const preSelectedIds = ref([]) // 打开弹窗时传入的已选 ID
    /** 多选：checkbox 变化 */
    const handleSelectionChange = (rows) => {
      if (props.multiple) {
        selectedRows.value = rows
      }
    }
    /** 单选：radio 变化 */
    const handleRadioChange = (row) => {
      currentRadioRow.value = row
    }
    /** 单击行：单选模式下点击整行即选中（降低操作成本），多选不处理（避免和 dblclick 冲突） */
    const handleRowClick = (row) => {
      if (props.multiple) {
        return
      }
      selectedRadioId.value = row.id
      currentRadioRow.value = row
    }
    /** 双击行：多选模式切换勾选，单选模式直接确认 */
    const handleRowDblClick = (row) => {
      var _a
      if (props.multiple) {
        (_a = tableRef.value) === null || _a === void 0 ? void 0 : _a.toggleRowSelection(row)
        return
      }
      selectedRadioId.value = row.id
      currentRadioRow.value = row
      confirmSelect()
    }
    // ==================== 分类树 ====================
    /** 点击分类树节点，按分类筛选（支持取消选中） */
    const handleNodeClick = (data) => {
      queryParams.itemTypeId = data === null || data === void 0 ? void 0 : data.id
      handleQuery()
    }
    // ==================== 库存查询 ====================
    const queryParams = reactive({
      pageNo: 1, // 页码
      pageSize: 10, // 每页条数
      itemTypeId: undefined, // 物料分类编号
      itemId: undefined, // 物料编号
      vendorId: undefined, // 供应商编号
      batchCode: undefined, // 批次号
      batchId: undefined, // 批次 ID
      warehouseId: undefined, // 仓库编号
      locationId: undefined, // 库区编号
      areaId: undefined, // 库位编号
      frozen: false, // 默认只查未冻结
      virtualFilter: undefined // 虚拟仓过滤：exclude / only，由后端处理
    })
    /** 仓库切换时清空库区、库位 */
    const handleWarehouseChange = () => {
      queryParams.locationId = undefined
      queryParams.areaId = undefined
    }
    /** 库区切换时清空库位 */
    const handleLocationChange = () => {
      queryParams.areaId = undefined
    }
    /** 查询库存列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await WmMaterialStockApi.getMaterialStockPage(queryParams)).data
        list.value = data.list
        total.value = data.total
        await nextTick()
        applyPreSelection()
      } finally {
        loading.value = false
      }
    }
    /** 恢复预选状态（当前页可见范围内） */
    const applyPreSelection = () => {
      if (preSelectedIds.value.length === 0) {
        return
      }
      if (props.multiple) {
        const table = tableRef.value
        if (!table) {
          return
        }
        list.value.forEach((row) => {
          if (preSelectedIds.value.includes(row.id)) {
            table.toggleRowSelection(row, true)
          }
        })
      } else {
        const match = list.value.find((row) => preSelectedIds.value.includes(row.id))
        if (match) {
          selectedRadioId.value = match.id
          currentRadioRow.value = match
        }
      }
    }
    /** 搜索按钮操作 */
    const handleQuery = () => {
      queryParams.pageNo = 1
      getList()
    }
    /** 重置查询条件（同步清除左侧树高亮和搜索词） */
    const resetQuery = () => {
      var _a
      queryParams.itemTypeId = undefined
      queryParams.itemId = props.itemId // 保持 props 传入的物料过滤
      queryParams.vendorId = undefined
      queryParams.batchCode = undefined
      queryParams.batchId = props.batchId // 保持 props 传入的批次过滤
      queryParams.warehouseId = props.warehouseId // 保持 props 传入的仓库过滤
      queryParams.virtualFilter = props.virtualFilter === 'all' ? undefined : props.virtualFilter
      queryParams.locationId = undefined
      queryParams.areaId = undefined;
      (_a = typeTreeRef.value) === null || _a === void 0 ? void 0 : _a.reset()
      handleQuery()
    }
    /** 确认选择 */
    const confirmSelect = () => {
      if (props.multiple) {
        if (selectedRows.value.length === 0) {
          message.warning('请至少选择一条数据')
          return
        }
        emit('selected', selectedRows.value)
      } else {
        if (!currentRadioRow.value) {
          message.warning('请选择一条数据')
          return
        }
        emit('selected', [currentRadioRow.value])
      }
      dialogVisible.value = false
    }
    // ==================== 打开弹窗 ====================
    /** 打开弹窗，可传入已选 ID 用于预选高亮 */
    const open = async(selectedIds) => {
      var _a, _b
      dialogVisible.value = true
      // 重置查询条件 + 页码，避免二次打开继承上次过滤上下文
      queryParams.itemTypeId = undefined
      queryParams.vendorId = undefined
      queryParams.batchCode = undefined
      queryParams.locationId = undefined
      queryParams.areaId = undefined
      queryParams.pageNo = 1
      // 固定过滤条件（从 props 传入）
      queryParams.itemId = props.itemId
      queryParams.batchId = props.batchId
      queryParams.warehouseId = props.warehouseId
      queryParams.virtualFilter = props.virtualFilter === 'all' ? undefined : props.virtualFilter
      // 默认只查未冻结
      queryParams.frozen = false;
      // 重置分类树（清高亮 + 清搜索词）
      (_a = typeTreeRef.value) === null || _a === void 0 ? void 0 : _a.reset()
      // 清空上一次的选中状态
      selectedRows.value = []
      selectedRadioId.value = undefined
      currentRadioRow.value = undefined
      preSelectedIds.value = selectedIds !== null && selectedIds !== void 0 ? selectedIds : []
      // 多选模式清空跨页缓存的勾选
      await nextTick();
      (_b = tableRef.value) === null || _b === void 0 ? void 0 : _b.clearSelection()
      await getList()
    }
    // ==================== 预过滤提示 ====================
    /** 拼装 el-alert 提示文字 */
    const alertTitle = computed(() => {
      const parts = []
      if (props.batchId != null) {
        parts.push('批次')
      }
      if (props.warehouseId != null) {
        parts.push('仓库')
      }
      if (props.virtualFilter === 'only') {
        parts.push('只看虚拟仓')
      }
      return `已按${parts.join('/')}预过滤`
    })
    /** 是否显示 alert 提示 */
    const showAlert = computed(() => {
      return props.batchId != null || props.warehouseId != null || props.virtualFilter === 'only'
    })
    return { ...toRefs(props), MdItemSelect, MdItemTypeTree, MdVendorSelect, WmWarehouseAreaSelect, WmWarehouseLocationSelect, WmWarehouseSelect, alertTitle, applyPreSelection, confirmSelect, currentRadioRow, dateFormatter2, dialogVisible, getList, handleLocationChange, handleNodeClick, handleQuery, handleRadioChange, handleRowClick, handleRowDblClick, handleSelectionChange, handleWarehouseChange, list, loading, message, open, preSelectedIds, queryParams, resetQuery, selectedRadioId, selectedRows, showAlert, tableRef, total, typeTreeRef }
  }
}
</script>

<style lang="scss" scoped>
/* 隐藏 radio 的 label 文字，只保留圆圈 */
.radio-no-label {
  ::v-deep .el-radio__label {
    display: none;
  }
}
</style>

<style scoped>
.wm-content-wrap { margin-bottom: 20px; }
.wm-w-full { width: 100%; }
.wm-w-240 { width: 240px; }
.wm-w-220 { width: 220px; }
.wm-w-200 { width: 200px; }
.mr-5px { margin-right: 5px; }
</style>
