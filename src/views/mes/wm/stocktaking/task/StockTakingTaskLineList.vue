<template>
  <div class="wm-migrated">
    <div class="overflow-hidden">
      <!-- 添加物料按钮 -->
      <el-button
        v-if="!isReadOnly"
        v-hasPermi="['mes:wm-stock-taking-task:update']"
        type="primary"
        plain
        class="mb-10px"
        @click="handleAdd"
      >
        <i class="el-icon-plus mr-5px" /> 添加物料
      </el-button>
      <el-table
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        border
      >
        <el-table-column
          label="物料编码"
          align="center"
          prop="itemCode"
          min-width="140"
        />
        <el-table-column
          label="物料名称"
          align="center"
          prop="itemName"
          min-width="160"
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
          width="90"
        />
        <el-table-column
          label="批次号"
          align="center"
          prop="batchCode"
          min-width="120"
        />
        <el-table-column
          label="在库数量"
          align="center"
          prop="quantity"
          width="120"
        />
        <el-table-column
          label="仓库"
          align="center"
          prop="warehouseName"
          min-width="120"
        />
        <el-table-column
          label="库区"
          align="center"
          prop="locationName"
          min-width="120"
        />
        <el-table-column
          label="库位"
          align="center"
          prop="areaName"
          min-width="120"
        />
        <el-table-column
          label="状态"
          align="center"
          min-width="100"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_WM_STOCK_TAKING_LINE_STATUS"
              :value="scope.row.status"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isReadOnly"
          label="操作"
          align="center"
          width="80"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>

    <!-- 库存选择弹窗（多选模式） -->
    <WmMaterialStockSelectDialog
      ref="stockSelectDialogRef"
      :multiple="true"
      @selected="onStockSelected"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, watch, toRefs, getCurrentInstance } from 'vue'
import { DICT_TYPE } from '@/utils/dict'
import { StockTakingTaskLineApi } from '@/api/mes/wm/stocktaking/task/line'
import WmMaterialStockSelectDialog from '@/views/mes/wm/materialstock/components/WmMaterialStockSelectDialog.vue'
export default {
  name: 'StockTakingTaskLineList',
  components: { WmMaterialStockSelectDialog },
  props: { 'taskId': { type: Number, required: true }, 'formType': { type: String }},
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const t = (...args) => vm.$t(...args) // 国际化
    const message = {
      success: (content) => vm.$modal.msgSuccess(content),
      error: (content) => vm.$modal.msgError(content),
      warning: (content) => vm.$modal.msgWarning(content),
      confirm: (content) => vm.$modal.confirm(content),
      delConfirm: (content) => vm.$modal.confirm(content || '是否确认删除选中的数据项？'),
      exportConfirm: (content) => vm.$modal.confirm(content || '是否确认导出所有数据项？')
    } // 消息弹窗
    const isReadOnly = computed(() => props.formType !== 'update') // 是否只读
    // ==================== 列表 ====================
    const loading = ref(false) // 列表的加载中
    const list = ref([]) // 列表的数据
    const total = ref(0) // 列表的总页数
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      taskId: undefined
    }) // 查询参数
    /** 查询行列表 */
    const getList = async() => {
      if (!props.taskId) { return }
      loading.value = true
      try {
        queryParams.taskId = props.taskId
        const data = (await StockTakingTaskLineApi.getStockTakingTaskLinePage(queryParams)).data
        list.value = data.list
        total.value = data.total
      } finally {
        loading.value = false
      }
    }
    /** 删除按钮操作 */
    const handleDelete = async(id) => {
      try {
        await message.delConfirm();
        (await StockTakingTaskLineApi.deleteStockTakingTaskLine(id)).data
        message.success(t('common.delSuccess'))
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    // ==================== 库存批量选择 ====================
    const stockSelectDialogRef = ref() // 库存选择弹窗 Ref
    /** 点击"添加物料"按钮，打开库存选择弹窗 */
    const handleAdd = () => {
      stockSelectDialogRef.value.open()
    }
    /** 库存选择确认回调：将选中的库存记录批量创建为盘点行 */
    const onStockSelected = async(rows) => {
      if (!rows || rows.length === 0) {
        return
      }
      loading.value = true
      try {
        // 逐条创建盘点行（映射库存记录 → 盘点行）
        for (const stock of rows) {
          const lineData = {
            taskId: props.taskId,
            materialStockId: stock.id,
            itemId: stock.itemId,
            batchId: stock.batchId,
            quantity: stock.quantity,
            warehouseId: stock.warehouseId,
            locationId: stock.locationId,
            areaId: stock.areaId
          };
          (await StockTakingTaskLineApi.createStockTakingTaskLine(lineData)).data
        }
        message.success(`成功添加 ${rows.length} 条盘点行`)
        await getList()
      } finally {
        loading.value = false
      }
    }
    /** 监听 taskId 变化 */
    watch(() => props.taskId, () => {
      queryParams.pageNo = 1
      getList()
    }, { immediate: true })
    return { ...toRefs(props), DICT_TYPE, WmMaterialStockSelectDialog, getList, handleAdd, handleDelete, isReadOnly, list, loading, message, onStockSelected, queryParams, stockSelectDialogRef, t, total }
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
