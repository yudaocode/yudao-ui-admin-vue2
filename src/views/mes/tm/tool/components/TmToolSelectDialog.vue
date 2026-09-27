<template>
  <div class="wm-migrated">
    <el-dialog
      title="工具选择"
      :visible.sync="dialogVisible"
      width="75%"
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
          <el-form-item label="工具编码">
            <el-input
              v-model="queryParams.code"
              placeholder="请输入工具编码"
              clearable
              class="wm-w-220"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="工具名称">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入工具名称"
              clearable
              class="wm-w-220"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="工具类型">
            <TmToolTypeSelect
              v-model="queryParams.toolTypeId"
              placeholder="请选择工具类型"
              class="wm-w-220"
            />
          </el-form-item>
          <el-form-item label="品牌">
            <el-input
              v-model="queryParams.brand"
              placeholder="请输入品牌"
              clearable
              class="wm-w-220"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择状态"
              clearable
              class="wm-w-220"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.MES_TM_TOOL_STATUS)"
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
            label="工具编码"
            align="center"
            prop="code"
            width="120"
          />
          <el-table-column
            label="工具名称"
            align="left"
            prop="name"
            min-width="120"
          />
          <el-table-column
            label="品牌"
            align="left"
            prop="brand"
            min-width="100"
          />
          <el-table-column
            label="型号规格"
            align="left"
            prop="specification"
            min-width="100"
          />
          <el-table-column
            label="工具类型"
            align="center"
            prop="toolTypeName"
            width="120"
          />
          <el-table-column
            label="库存数量"
            align="center"
            prop="quantity"
            width="100"
          />
          <el-table-column
            label="可用数量"
            align="center"
            prop="availableQuantity"
            width="100"
          />
          <el-table-column
            label="状态"
            align="center"
            prop="status"
            width="100"
          >
            <template slot-scope="scope">
              <dict-tag
                :type="DICT_TYPE.MES_TM_TOOL_STATUS"
                :value="scope.row.status"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            align="center"
            prop="createTime"
            :formatter="dateFormatter"
            width="180"
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
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { TmToolApi } from '@/api/mes/tm/tool'
import TmToolTypeSelect from '../type/components/TmToolTypeSelect.vue'
export default {
  name: 'TmToolSelectDialog',
  components: { TmToolTypeSelect },
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
    const list = ref([]) // 工具列表
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
      pageNo: 1, // 页码
      pageSize: 10, // 每页条数
      code: undefined, // 工具编码
      name: undefined, // 工具名称
      toolTypeId: undefined, // 工具类型
      brand: undefined, // 品牌
      status: undefined // 状态
    })
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await TmToolApi.getToolPage(queryParams)).data
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
      queryParams.toolTypeId = undefined
      queryParams.brand = undefined
      queryParams.status = undefined
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
      // 重置查询条件 + 页码
      queryParams.code = undefined
      queryParams.name = undefined
      queryParams.toolTypeId = undefined
      queryParams.brand = undefined
      queryParams.status = undefined
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
    return { ...toRefs(props), DICT_TYPE, TmToolTypeSelect, applyPreSelection, confirmSelect, currentRadioRow, dateFormatter, dialogVisible, getIntDictOptions, getList, handleQuery, handleRadioChange, handleRowClick, handleRowDblClick, handleSelectionChange, list, loading, message, open, preSelectedIds, queryParams, resetQuery, selectedRadioId, selectedRows, tableRef, total }
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
