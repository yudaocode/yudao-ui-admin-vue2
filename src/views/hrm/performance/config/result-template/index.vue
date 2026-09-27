<template>
  <div class="hrm-performance-page">
    <doc-alert
      title="【绩效】绩效模板、绩效计划"
      url="https://doc.iocoder.cn/hrm/performance/template-plan/"
    />

    <el-card shadow="never">
      <el-form
        ref="queryFormRef"
        class="-mb-15px"
        :model="queryParams"
        :inline="true"
        label-width="76px"
      >
        <el-form-item
          label="模板名称"
          prop="name"
        >
          <el-input
            v-model="queryParams.name"
            clearable
            class="!w-220px"
            placeholder="请输入模板名称"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><i class="el-icon-search mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh mr-5px" /> 重置</el-button>
          <el-button
            v-hasPermi="['hrm:performance:result-template:create']"
            type="primary"
            plain
            @click="formRef.open('create')"
          >
            <i class="el-icon-plus mr-5px" /> 新增
          </el-button>
          <el-button
            v-hasPermi="['hrm:performance:result-template:delete']"
            :disabled="!checkedIds.length"
            plain
            type="danger"
            @click="handleDeleteBatch"
          >
            <i class="el-icon-delete mr-5px" />批量删除
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        @selection-change="handleRowCheckboxChange"
      >
        <el-table-column
          type="selection"
          width="50"
        />
        <el-table-column
          label="结果模板名称"
          prop="name"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          label="等级设置"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="scope">
            {{
            scope.row.levels
              ?.map((level) => level.name)
              .filter(Boolean)
              .join('、') || '-'
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="创建人"
          align="center"
          prop="creatorName"
          width="120"
        />
        <el-table-column
          label="最近更新时间"
          align="center"
          prop="updateTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="操作"
          align="center"
          width="140"
          fixed="right"
        >
          <template #default="scope">
            <el-button

              v-hasPermi="['hrm:performance:result-template:update']"
              type="text"
              @click="formRef.open('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button

              v-hasPermi="['hrm:performance:result-template:delete']"
              type="text"
              @click="handleDelete(scope.row.id)"
            >
              删除
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

    <PerformanceResultTemplateForm
      ref="formRef"
      @success="getList"
    />
  </div>
</template>

<script>
import { Message, MessageBox } from 'element-ui'
import { ref, reactive, onMounted } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import { dateFormatter } from '@/utils/formatTime'
import * as PerformanceResultTemplateApi from '@/api/hrm/performance/config/result-template'
import PerformanceResultTemplateForm from './PerformanceResultTemplateForm.vue'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformanceResultTemplate' },
  __name: 'index',
  components: { PerformanceResultTemplateForm },
  setup(__props, { expose: __expose }) {
    __expose()
    const message = {
      success: (text) => Message.success(text),
      warning: (text) => Message.warning(text),
      error: (text) => Message.error(text),
      confirm: (text) => MessageBox.confirm(text, '提示', { type: 'warning' }),
      delConfirm: (text = '是否确认删除所选数据项？') =>
        MessageBox.confirm(text, '提示', { type: 'warning' })
    } // 消息弹窗
    const loading = ref(false) // 加载中
    const total = ref(0) // 列表总数
    const list = ref([]) // 列表数据
    const checkedIds = ref([]) // 选中的编号
    const queryFormRef = ref() // 搜索表单 Ref
    const formRef = ref() // 表单 Ref
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      name: ''
    })
    /** 查询结果模板列表 */
    async function getList() {
      loading.value = true
      try {
        const { data } = await PerformanceResultTemplateApi.getPerformanceResultTemplatePage(queryParams)
        list.value = data.list
        total.value = data.total
      } finally {
        loading.value = false
      }
    }
    /** 搜索按钮操作 */
    function handleQuery() {
      queryParams.pageNo = 1
      getList()
    }
    /** 重置按钮操作 */
    function resetQuery() {
      queryFormRef.value.resetFields()
      handleQuery()
    }
    /** 删除结果模板 */
    async function handleDelete(id) {
      if (!id) {
        return
      }
      try {
        await message.delConfirm()
      } catch (error) {
        return
      }
      await PerformanceResultTemplateApi.deletePerformanceResultTemplate(id)
      message.success('删除成功')
      await getList()
    }
    /** 处理表格多选 */
    function handleRowCheckboxChange(rows) {
      checkedIds.value = rows.map((row) => row.id).filter((id) => !!id)
    }
    /** 批量删除结果模板 */
    async function handleDeleteBatch() {
      try {
        await message.delConfirm()
      } catch (error) {
        return
      }
      await PerformanceResultTemplateApi.deletePerformanceResultTemplateList(checkedIds.value)
      checkedIds.value = []
      message.success('删除成功')
      await getList()
    }
    /** 初始化 */
    onMounted(() => {
      getList()
    })
    const __returned__ = { message, loading, total, list, checkedIds, queryFormRef, formRef, queryParams, getList, handleQuery, resetQuery, handleDelete, handleRowCheckboxChange, handleDeleteBatch, get dateFormatter() { return dateFormatter }, PerformanceResultTemplateForm }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
