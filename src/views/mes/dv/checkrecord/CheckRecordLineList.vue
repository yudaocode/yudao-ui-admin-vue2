<!-- MES 设备点检记录明细列表 -->
<template>
  <div>
    <el-row v-if="!disabled" class="operation-row"><el-button type="primary" plain icon="el-icon-plus" @click="openForm('create')">添加明细</el-button></el-row>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="项目编码" align="center" prop="subjectCode" /><el-table-column label="项目名称" align="center" prop="subjectName" />
      <el-table-column label="检查内容" align="center" prop="subjectContent" /><el-table-column label="检查标准" align="center" prop="subjectStandard" />
      <el-table-column label="点检结果" align="center" prop="checkStatus"><template v-slot="scope"><dict-tag :type="MES_DV_CHECK_RESULT" :value="scope.row.checkStatus" /></template></el-table-column>
      <el-table-column label="异常描述" align="center" prop="checkResult" />
      <el-table-column v-if="!disabled" label="操作" align="center" width="130"><template v-slot="scope"><el-button type="text" size="mini" @click="openForm('update', scope.row)">编辑</el-button><el-button type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <el-dialog :title="formTitle" :visible.sync="formVisible" width="500px" append-to-body>
      <el-form ref="form" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="点检项目" prop="subjectId"><dv-subject-select v-model="formData.subjectId" /></el-form-item>
        <el-form-item label="点检结果" prop="checkStatus"><el-radio-group v-model="formData.checkStatus"><el-radio v-for="dict in resultOptions" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio></el-radio-group></el-form-item>
        <el-form-item v-if="formData.checkStatus === MesDvCheckResultEnum.ABNORMAL" label="异常描述" prop="checkResult"><el-input v-model="formData.checkResult" type="textarea" placeholder="请输入异常描述" /></el-form-item>
        <el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="formVisible = false">取 消</el-button><el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { DvCheckRecordLineApi } from '@/api/mes/dv/checkrecord/line'
import { MesDvCheckResultEnum } from '@/views/mes/utils/constants'
import DvSubjectSelect from '@/views/mes/dv/subject/components/DvSubjectSelect.vue'
const MES_DV_CHECK_RESULT = 'mes_dv_check_result'
export default {
  name: 'CheckRecordLineList',
  components: { DvSubjectSelect },
  props: { recordId: { type: Number, required: true }, disabled: { type: Boolean, default: false }},
  data() {
    return {
      MES_DV_CHECK_RESULT,
      MesDvCheckResultEnum,
      loading: false,
      list: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10, recordId: this.recordId },
      formVisible: false,
      formTitle: '',
      formLoading: false,
      formType: '',
      formData: {},
      resultOptions: getIntDictOptions(MES_DV_CHECK_RESULT),
      formRules: {
        subjectId: [{ required: true, message: '点检项目不能为空', trigger: 'blur' }],
        checkStatus: [{ required: true, message: '点检结果不能为空', trigger: 'blur' }]
      }
    }
  },
  watch: {
    recordId: {
      immediate: true,
      handler(value) {
        if (value) {
          this.queryParams.recordId = value
          this.getList()
        }
      }
    }
  },
  methods: {
    async getList() { this.loading = true; try { const response = await DvCheckRecordLineApi.getCheckRecordLinePage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } },
    openForm(type, row) { this.formVisible = true; this.formTitle = type === 'create' ? '添加明细' : '编辑明细'; this.formType = type; this.formData = type === 'create' ? { recordId: this.recordId, subjectId: undefined, checkStatus: MesDvCheckResultEnum.NORMAL, checkResult: '', remark: '' } : { ...row }; this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.formType === 'create') { await DvCheckRecordLineApi.createCheckRecordLine(this.formData); this.$modal.msgSuccess('新增成功') } else { await DvCheckRecordLineApi.updateCheckRecordLine(this.formData); this.$modal.msgSuccess('修改成功') } this.formVisible = false; await this.getList() } finally { this.formLoading = false } }) },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该点检明细？'); await DvCheckRecordLineApi.deleteCheckRecordLine(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 取消删除时保持列表 */ } }
  }
}
</script>

<style scoped>.operation-row { margin-bottom: 10px; }</style>
