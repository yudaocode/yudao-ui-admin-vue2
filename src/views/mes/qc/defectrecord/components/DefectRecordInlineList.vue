<template>
  <el-dialog
    title="缺陷记录"
    :visible.sync="dialogVisible"
    width="900px"
    append-to-body
  >
    <div class="overflow-hidden">
      <!-- 新增按钮 -->
      <el-row
        v-if="!isDetail"
        class="mb-10px"
      >
        <el-button
          v-hasPermi="['mes:qc-defect:create']"
          type="primary"
          plain
          @click="handleAdd"
        >
          <i class="el-icon-plus mr-5px" /> 新增缺陷
        </el-button>
      </el-row>

      <!-- 内联编辑表格 -->
      <el-table
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
      >
        <el-table-column
          label="缺陷描述"
          align="center"
          min-width="200"
        >
          <template slot-scope="scope">
            <el-input
              v-if="scope.row.editing"
              v-model="scope.row.name"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 4 }"
              placeholder="请输入缺陷描述"
            />
            <span v-else>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="缺陷等级"
          align="center"
          width="140"
        >
          <template slot-scope="scope">
            <el-select
              v-if="scope.row.editing"
              v-model="scope.row.level"
              placeholder="请选择"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.MES_DEFECT_LEVEL)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
            <dict-tag
              v-else
              :type="DICT_TYPE.MES_DEFECT_LEVEL"
              :value="scope.row.level"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="缺陷数量"
          align="center"
          width="120"
        >
          <template slot-scope="scope">
            <el-input-number
              v-if="scope.row.editing"
              v-model="scope.row.quantity"
              :min="1"
              controls-position="right"
              class="qc-w-full"
            />
            <span v-else>{{ scope.row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          align="center"
          min-width="150"
        >
          <template slot-scope="scope">
            <el-input
              v-if="scope.row.editing"
              v-model="scope.row.remark"
              placeholder="请输入备注"
            />
            <span v-else>{{ scope.row.remark || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isDetail"
          label="操作"
          align="center"
          width="130"
          fixed="right"
        >
          <template slot-scope="scope">
            <template v-if="scope.row.editing">
              <el-button
                type="text"
                @click="handleSave(scope.row)"
              >保存</el-button>
              <el-button
                type="text"
                @click="handleCancel(scope.row, scope.$index)"
              >
                取消
              </el-button>
            </template>
            <template v-else>
              <el-button

                v-hasPermi="['mes:qc-defect:update']"
                type="text"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button

                v-hasPermi="['mes:qc-defect:delete']"
                type="text"
                @click="handleDelete(scope.row.id)"
              >
                删除
              </el-button>
            </template>
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
    </div>
  </el-dialog>
</template>

<script>
import { ref, reactive, computed, toRefs, getCurrentInstance } from 'vue'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { QcDefectRecordApi } from '@/api/mes/qc/defectrecord'
export default {
  name: 'DefectRecordInlineList',
  props: { 'formType': { type: String }},
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
    const t = (...args) => vm.$t(...args)
    const isDetail = computed(() => props.formType === 'detail') // 是否为详情模式（只读）
    const dialogVisible = ref(false)
    const loading = ref(false)
    const list = ref([])
    const total = ref(0)
    // 当前操作的参数（通过 open 方法传入）
    const qcType = ref(0) // 检验类型：MesQcTypeEnum
    const qcId = ref(0) // 检验单 ID
    const lineId = ref(0) // 检验行 ID
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      qcType: undefined,
      qcId: undefined,
      lineId: undefined
    })
    /** 打开弹窗 */
    const open = async(type, id, line) => {
      qcType.value = type
      qcId.value = id
      lineId.value = line
      queryParams.pageNo = 1
      dialogVisible.value = true
      await getList()
    }
    /** 查询列表 */
    const getList = async() => {
      if (!qcId.value || !lineId.value) {
        return
      }
      queryParams.qcType = qcType.value
      queryParams.qcId = qcId.value
      queryParams.lineId = lineId.value
      loading.value = true
      try {
        const data = (await QcDefectRecordApi.getDefectRecordPage(queryParams)).data
        list.value = data.list.map((item) => ({ ...item, editing: false }))
        total.value = data.total
      } finally {
        loading.value = false
      }
    }
    /** 新增行 */
    const handleAdd = () => {
      list.value.unshift({
        id: undefined,
        qcType: qcType.value,
        qcId: qcId.value,
        lineId: lineId.value,
        name: '',
        level: undefined,
        quantity: 1,
        remark: '',
        editing: true,
        isNew: true
      })
    }
    /** 编辑行 */
    const handleEdit = (row) => {
      row._backup = { ...row }
      row.editing = true
    }
    /** 保存行 */
    const handleSave = async(row) => {
      // 校验必填
      if (!row.name) {
        message.warning('缺陷描述不能为空')
        return
      }
      if (!row.level) {
        message.warning('缺陷等级不能为空')
        return
      }
      try {
        if (row.isNew) {
          (await QcDefectRecordApi.createDefectRecord(row)).data
          message.success(t('common.createSuccess'))
        } else {
          (await QcDefectRecordApi.updateDefectRecord(row)).data
          message.success(t('common.updateSuccess'))
        }
        await getList()
        emit('refresh')
      } catch {
        // 取消确认或请求层已提示时，无需额外提示
      }
    }
    /** 取消编辑 */
    const handleCancel = (row, index) => {
      if (row.isNew) {
        list.value.splice(index, 1)
      } else {
        Object.assign(row, row._backup)
        row.editing = false
      }
    }
    /** 删除行 */
    const handleDelete = async(id) => {
      try {
        await message.delConfirm();
        (await QcDefectRecordApi.deleteDefectRecord(id)).data
        message.success(t('common.delSuccess'))
        await getList()
        emit('refresh')
      } catch {
        // 取消确认或请求层已提示时，无需额外提示
      }
    }
    return { ...toRefs(props), DICT_TYPE, dialogVisible, getIntDictOptions, getList, handleAdd, handleCancel, handleDelete, handleEdit, handleSave, isDetail, lineId, list, loading, message, open, qcId, qcType, queryParams, t, total }
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
