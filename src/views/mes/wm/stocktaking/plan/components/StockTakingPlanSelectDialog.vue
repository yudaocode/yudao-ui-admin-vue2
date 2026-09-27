<template>
  <div class="wm-migrated">
    <el-dialog
      title="盘点方案选择"
      :visible.sync="dialogVisible"
      width="70%"
      append-to-body
    >
      <el-card
        shadow="never"
        class="wm-content-wrap"
      >
        <el-form
          :inline="true"
          :model="queryParams"
          label-width="85px"
        >
          <el-form-item label="方案编码">
            <el-input
              v-model="queryParams.code"
              placeholder="请输入方案编码"
              clearable
              class="wm-w-220"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="方案名称">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入方案名称"
              clearable
              class="wm-w-220"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="盘点类型">
            <el-select
              v-model="queryParams.type"
              placeholder="请选择盘点类型"
              clearable
              class="wm-w-220"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.MES_WM_STOCK_TAKING_TYPE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
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
          </el-form-item>
        </el-form>
      </el-card>
      <!-- 数据表格：单选 radio / 多选 checkbox 统一在一个 table 内 -->
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
            label="方案编码"
            align="center"
            prop="code"
            width="200"
          />
          <el-table-column
            label="方案名称"
            align="left"
            prop="name"
            min-width="150"
          />
          <el-table-column
            label="盘点类型"
            align="center"
            prop="type"
            width="120"
          >
            <template slot-scope="scope">
              <dict-tag
                :type="DICT_TYPE.MES_WM_STOCK_TAKING_TYPE"
                :value="scope.row.type"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="开始时间"
            align="center"
            prop="startTime"
            width="180"
          >
            <template slot-scope="scope">
              <span>{{ formatDate(scope.row.startTime, 'YYYY-MM-DD HH:mm:ss') }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="结束时间"
            align="center"
            prop="endTime"
            width="180"
          >
            <template slot-scope="scope">
              <span>{{ formatDate(scope.row.endTime, 'YYYY-MM-DD HH:mm:ss') }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="是否盲盘"
            align="center"
            prop="blindFlag"
            width="100"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.blindFlag ? 'success' : 'info'"
                size="small"
              >
                {{ scope.row.blindFlag ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="是否库存冻结"
            align="center"
            prop="frozen"
            width="120"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.frozen ? 'success' : 'info'"
                size="small"
              >
                {{ scope.row.frozen ? '是' : '否' }}
              </el-tag>
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
import { ref, reactive, nextTick, toRefs, getCurrentInstance } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { formatDate } from '@/utils/formatTime'
import { StockTakingPlanApi } from '@/api/mes/wm/stocktaking/plan/index'
export default {
  name: 'StockTakingPlanSelectDialog',
  props: { 'multiple': { type: Boolean, default: true }},
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
    const list = ref([]) // 盘点方案列表
    const total = ref(0) // 总条数
    // ==================== 选中状态 ====================
    const tableRef = ref() // 表格 Ref
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
    // ==================== 盘点方案查询 ====================
    const queryParams = reactive({
      pageNo: 1, // 页码
      pageSize: 10, // 每页条数
      code: undefined, // 方案编码
      name: undefined, // 方案名称
      type: undefined, // 盘点类型
      status: CommonStatusEnum.ENABLE // 状态：默认只查启用
    })
    /** 查询盘点方案列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await StockTakingPlanApi.getStockTakingPlanPage(queryParams)).data
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
    /** 重置查询条件 */
    const resetQuery = () => {
      queryParams.code = undefined
      queryParams.name = undefined
      queryParams.type = undefined
      queryParams.status = CommonStatusEnum.ENABLE
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
      var _a
      dialogVisible.value = true
      // 重置查询条件 + 页码，避免二次打开继承上次过滤上下文
      queryParams.code = undefined
      queryParams.name = undefined
      queryParams.type = undefined
      queryParams.status = CommonStatusEnum.ENABLE
      queryParams.pageNo = 1
      // 清空上一次的选中状态
      selectedRows.value = []
      selectedRadioId.value = undefined
      currentRadioRow.value = undefined
      preSelectedIds.value = selectedIds !== null && selectedIds !== void 0 ? selectedIds : []
      // 多选模式清空跨页缓存的勾选
      await nextTick();
      (_a = tableRef.value) === null || _a === void 0 ? void 0 : _a.clearSelection()
      await getList()
    }
    return { ...toRefs(props), DICT_TYPE, applyPreSelection, confirmSelect, currentRadioRow, dialogVisible, formatDate, getIntDictOptions, getList, handleQuery, handleRadioChange, handleRowClick, handleRowDblClick, handleSelectionChange, list, loading, message, open, preSelectedIds, queryParams, resetQuery, selectedRadioId, selectedRows, tableRef, total }
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
