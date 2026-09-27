<template>
  <div class="overflow-hidden">
    <!-- 操作按钮 -->
    <el-row
      :gutter="10"
      class="mb8"
    >
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          @click="handleAdd"
        >
          <i class="el-icon-plus mr-5px" /> 新增
        </el-button>
      </el-col>
    </el-row>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="样品编号"
        align="center"
        prop="code"
        width="200"
      />
      <el-table-column
        label="物资SN"
        align="center"
        prop="sn"
        min-width="200"
      />
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
        min-width="200"
      />
      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            type="text"
            @click="handleDelete(scope.row)"
          >删除</el-button>
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

    <!-- 新增/修改弹窗 -->
    <QcIndicatorResultForm
      ref="formRef"
      :qc-id="qcId"
      :qc-type="qcType"
      @success="getList"
    />
  </div>
</template>

<script>
import { ref, reactive, watch, toRefs, getCurrentInstance } from 'vue'
import { QcIndicatorResultApi } from '@/api/mes/qc/indicatorresult'
import QcIndicatorResultForm from './QcIndicatorResultForm.vue'
export default {
  name: 'QcIndicatorResultList',
  components: { QcIndicatorResultForm },
  props: { 'qcId': { type: Number, required: true }, 'qcType': { type: Number, required: true }},
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const t = (...args) => vm.$t(...args)
    const message = {
      success: (content) => vm.$modal.msgSuccess(content),
      error: (content) => vm.$modal.msgError(content),
      warning: (content) => vm.$modal.msgWarning(content),
      confirm: (content) => vm.$modal.confirm(content),
      delConfirm: (content) => vm.$modal.confirm(content || '是否确认删除选中的数据项？'),
      exportConfirm: (content) => vm.$modal.confirm(content || '是否确认导出所有数据项？')
    }
    const loading = ref(false) // 列表的加载中
    const list = ref([]) // 列表的数据
    const total = ref(0) // 列表的总页数
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      qcId: undefined,
      qcType: undefined
    }) // 搜索的表单
    const formRef = ref() // 表单弹窗 Ref
    /** 查询列表 */
    const getList = async() => {
      if (!props.qcId) {
        return
      }
      queryParams.qcId = props.qcId
      queryParams.qcType = props.qcType
      loading.value = true
      try {
        const data = (await QcIndicatorResultApi.getResultPage(queryParams)).data
        list.value = data.list
        total.value = data.total
      } finally {
        loading.value = false
      }
    }
    /** 新增操作 */
    const handleAdd = () => {
      formRef.value.open('create')
    }
    /** 修改操作 */
    const handleUpdate = (row) => {
      formRef.value.open('update', row.id)
    }
    /** 删除操作 */
    const handleDelete = async(row) => {
      try {
        await message.delConfirm();
        (await QcIndicatorResultApi.deleteResult(row.id)).data
        message.success(t('common.delSuccess'))
        await getList()
      } catch {
        // 取消确认或请求层已提示时，无需额外提示
      }
    }
    /** 监听 qcId 变化，重新加载列表 */
    watch(() => props.qcId, () => {
      queryParams.pageNo = 1
      getList()
    }, { immediate: true })
    return { ...toRefs(props), QcIndicatorResultForm, formRef, getList, handleAdd, handleDelete, handleUpdate, list, loading, message, queryParams, t, total }
  }
}
</script>

<style scoped>
.mb8 { margin-bottom: 8px; }
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
