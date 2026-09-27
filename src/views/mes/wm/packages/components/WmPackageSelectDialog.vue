<template>
  <div class="wm-migrated">
    <el-dialog
      title="装箱单选择"
      :visible.sync="dialogVisible"
      width="80%"
      append-to-body
    >
      <el-card
        shadow="never"
        class="wm-content-wrap"
      >
        <el-alert
          v-if="childableOnly"
          title="仅展示可作为子箱的装箱单（无父箱 + 已完成）"
          type="info"
          :closable="false"
          show-icon
          class="!mb-10px"
        />
        <el-form
          :inline="true"
          :model="queryParams"
          label-width="100px"
        >
          <el-form-item label="装箱单编号">
            <el-input
              v-model="queryParams.code"
              placeholder="请输入装箱单编号"
              clearable
              class="wm-w-220"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="销售订单编号">
            <el-input
              v-model="queryParams.salesOrderCode"
              placeholder="请输入销售订单编号"
              clearable
              class="wm-w-220"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="客户">
            <MdClientSelect
              v-model="queryParams.clientId"
              class="wm-w-220"
            />
          </el-form-item>
          <el-form-item label="检查员">
            <UserSelectV2
              v-model="queryParams.inspectorUserId"
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
            label="装箱单编号"
            align="center"
            prop="code"
            min-width="160"
          />
          <el-table-column
            label="装箱日期"
            align="center"
            prop="packageDate"
            :formatter="dateFormatter2"
            width="120"
          />
          <el-table-column
            label="销售订单编号"
            align="center"
            prop="salesOrderCode"
            min-width="140"
          />
          <el-table-column
            label="发票编号"
            align="center"
            prop="invoiceCode"
            min-width="120"
          />
          <el-table-column
            label="客户编码"
            align="center"
            prop="clientCode"
            min-width="100"
          />
          <el-table-column
            label="客户名称"
            align="center"
            prop="clientName"
            min-width="120"
          />
          <el-table-column
            label="箱长度"
            align="center"
            prop="length"
            width="80"
          />
          <el-table-column
            label="箱宽度"
            align="center"
            prop="width"
            width="80"
          />
          <el-table-column
            label="箱高度"
            align="center"
            prop="height"
            width="80"
          />
          <el-table-column
            label="尺寸单位"
            align="center"
            prop="sizeUnitName"
            width="90"
          />
          <el-table-column
            label="净重"
            align="center"
            prop="netWeight"
            width="80"
          />
          <el-table-column
            label="毛重"
            align="center"
            prop="grossWeight"
            width="80"
          />
          <el-table-column
            label="重量单位"
            align="center"
            prop="weightUnitName"
            width="90"
          />
          <el-table-column
            label="检查员"
            align="center"
            prop="inspectorName"
            min-width="100"
          />
          <el-table-column
            label="单据状态"
            align="center"
            prop="status"
            min-width="100"
          >
            <template slot-scope="scope">
              <dict-tag
                :type="DICT_TYPE.MES_WM_PACKAGE_STATUS"
                :value="scope.row.status"
              />
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
import { dateFormatter2 } from '@/utils/formatTime'
import { DICT_TYPE } from '@/utils/dict'
import { WmPackageApi } from '@/api/mes/wm/packages'
import MdClientSelect from '@/views/mes/md/client/components/MdClientSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import { MesWmPackageStatusEnum } from '@/views/mes/utils/constants'
export default {
  name: 'WmPackageSelectDialog',
  components: { MdClientSelect, UserSelectV2 },
  props: { 'multiple': { type: Boolean, default: true }, 'excludeId': { type: Number }, 'childableOnly': { type: Boolean, default: false }},
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
    const list = ref([]) // 装箱单列表
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
    // ==================== 装箱单查询 ====================
    const queryParams = reactive({
      pageNo: 1, // 页码
      pageSize: 10, // 每页条数
      code: undefined, // 装箱单编号
      salesOrderCode: undefined, // 销售订单编号
      clientId: undefined, // 客户 ID
      inspectorUserId: undefined, // 检查员用户 ID
      parentId: undefined, // 父箱 ID
      status: undefined // 单据状态
    })
    /** 查询装箱单列表 */
    const getList = async() => {
      loading.value = true
      try {
        // childableOnly 模式：注入固定过滤条件（无父箱 + 已完成状态）
        if (props.childableOnly) {
          queryParams.parentId = 0
          queryParams.status = MesWmPackageStatusEnum.FINISHED
        }
        const data = (await WmPackageApi.getPackagePage(queryParams)).data
        // 过滤掉被排除的 ID（避免选择自己作为父箱）
        list.value = props.excludeId
          ? data.list.filter((item) => item.id !== props.excludeId)
          : data.list
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
    /** 重置查询条件（parentId / status 由 childableOnly prop 控制，不在此重置） */
    const resetQuery = () => {
      queryParams.code = undefined
      queryParams.salesOrderCode = undefined
      queryParams.clientId = undefined
      queryParams.inspectorUserId = undefined
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
      queryParams.salesOrderCode = undefined
      queryParams.clientId = undefined
      queryParams.inspectorUserId = undefined
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
    return { ...toRefs(props), DICT_TYPE, MdClientSelect, UserSelectV2, applyPreSelection, confirmSelect, currentRadioRow, dateFormatter2, dialogVisible, getList, handleQuery, handleRadioChange, handleRowClick, handleRowDblClick, handleSelectionChange, list, loading, message, open, preSelectedIds, queryParams, resetQuery, selectedRadioId, selectedRows, tableRef, total }
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
