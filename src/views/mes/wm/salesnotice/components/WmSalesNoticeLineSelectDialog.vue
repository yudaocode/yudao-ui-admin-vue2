<template>
  <div class="wm-migrated">
    <el-dialog
      title="发货通知单行选择"
      :visible.sync="dialogVisible"
      width="70%"
      append-to-body
    >
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
            label="物料编码"
            align="center"
            prop="itemCode"
            width="150"
          />
          <el-table-column
            label="物料名称"
            align="left"
            prop="itemName"
            min-width="200"
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
            width="80"
          />
          <el-table-column
            label="批次号"
            align="center"
            prop="batchCode"
            width="130"
          />
          <el-table-column
            label="发货数量"
            align="center"
            prop="quantity"
            width="100"
          />
          <el-table-column
            label="是否检验"
            align="center"
            prop="oqcCheckFlag"
            width="90"
          >
            <template slot-scope="scope">
              <dict-tag
                :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
                :value="scope.row.oqcCheckFlag"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="备注"
            align="center"
            prop="remark"
            min-width="120"
          />
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
import { DICT_TYPE } from '@/utils/dict'
import { WmSalesNoticeLineApi } from '@/api/mes/wm/salesnotice/line'
export default {
  name: 'WmSalesNoticeLineSelectDialog',
  props: { 'multiple': { type: Boolean, default: true }, 'noticeId': { type: Number }},
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
    const list = ref([]) // 列表
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
    // ==================== 查询 ====================
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      noticeId: undefined
    })
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await WmSalesNoticeLineApi.getSalesNoticeLinePage(queryParams)).data
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
      // 设置 noticeId 过滤（必须）
      queryParams.noticeId = props.noticeId
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
    return { ...toRefs(props), DICT_TYPE, applyPreSelection, confirmSelect, currentRadioRow, dialogVisible, getList, handleRadioChange, handleRowClick, handleRowDblClick, handleSelectionChange, list, loading, message, open, preSelectedIds, queryParams, selectedRadioId, selectedRows, tableRef, total }
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
