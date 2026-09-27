<!-- MES 工艺路线工序列表 -->
<template>
  <div>
    <el-row
      v-if="isEditable"
      class="toolbar"
    ><el-button
      type="primary"
      plain
      icon="el-icon-plus"
      @click="openForm('create')"
    >添加工序</el-button></el-row>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      show-overflow-tooltip
    ><el-table-column
       label="序号"
       align="center"
       prop="sort"
       width="70"
       fixed="left"
     /><el-table-column
       label="工序编码"
       align="center"
       prop="processCode"
       width="120"
       fixed="left"
     /><el-table-column
       label="工序名称"
       align="center"
       prop="processName"
       width="120"
       fixed="left"
     /><el-table-column
       label="下一道工序"
       align="center"
       prop="nextProcessName"
       width="120"
     /><el-table-column
       label="与下一道工序关系"
       align="center"
       prop="linkType"
       width="150"
     ><template #default="scope"><dict-tag
       :type="DICT_TYPE.MES_PRO_LINK_TYPE"
       :value="scope.row.linkType"
     /></template></el-table-column>
      <el-table-column
        label="关键工序"
        align="center"
        prop="keyFlag"
        width="80"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
        :value="scope.row.keyFlag"
      /></template></el-table-column><el-table-column
        label="质检确认"
        align="center"
        prop="checkFlag"
        width="120"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
        :value="scope.row.checkFlag"
      /></template></el-table-column>
      <el-table-column
        label="准备时间"
        align="center"
        prop="prepareTime"
        width="90"
      ><template #default="scope">{{ scope.row.prepareTime ? scope.row.prepareTime + '分钟' : '' }}</template></el-table-column><el-table-column
        label="等待时间"
        align="center"
        prop="waitTime"
        width="90"
      ><template #default="scope">{{ scope.row.waitTime ? scope.row.waitTime + '分钟' : '' }}</template></el-table-column><el-table-column
        label="甘特图颜色"
        align="center"
        prop="colorCode"
        width="120"
      ><template #default="scope"><span v-if="scope.row.colorCode"><i
        class="color-box"
        :style="{ backgroundColor: scope.row.colorCode }"
      />{{ scope.row.colorCode }}</span></template></el-table-column>
      <el-table-column
        v-if="isEditable"
        label="操作"
        align="center"
        width="130"
        fixed="right"
      ><template #default="scope"><el-button
        type="text"
        @click="openForm('update', scope.row)"
      >编辑</el-button><el-button
        type="text"
        class="danger-text"
        @click="handleDelete(scope.row.id)"
      >删除</el-button></template></el-table-column>
    </el-table>
    <el-dialog
      :title="formTitle"
      :visible.sync="formVisible"
      width="960px"
      append-to-body
    ><el-form
       ref="form"
       :model="formData"
       :rules="formRules"
       label-width="140px"
     ><el-row :gutter="20"><el-col :span="12"><el-form-item
        label="序号"
        prop="sort"
      ><el-input-number
        v-model="formData.sort"
        :min="1"
        controls-position="right"
      /></el-form-item></el-col><el-col :span="12"><el-form-item
        label="工序"
        prop="processId"
      ><el-select
        v-model="formData.processId"
        placeholder="请选择工序"
        filterable
      ><el-option
        v-for="item in processList"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      /></el-select></el-form-item></el-col></el-row>
       <el-row :gutter="20"><el-col :span="12"><el-form-item
         label="与下道工序关系"
         prop="linkType"
       ><el-select
         v-model="formData.linkType"
         placeholder="请选择"
       ><el-option
         v-for="dict in getIntDictOptions(DICT_TYPE.MES_PRO_LINK_TYPE)"
         :key="dict.value"
         :label="dict.label"
         :value="dict.value"
       /></el-select></el-form-item></el-col><el-col :span="12"><el-form-item
         label="甘特图颜色"
         prop="colorCode"
       ><el-color-picker v-model="formData.colorCode" /><span
         v-if="formData.colorCode"
         class="color-value"
       >{{ formData.colorCode }}</span></el-form-item></el-col></el-row>
       <el-row :gutter="20"><el-col :span="12"><el-form-item
         label="是否关键工序"
         prop="keyFlag"
       ><el-switch v-model="formData.keyFlag" /></el-form-item></el-col><el-col :span="12"><el-form-item
         label="是否需要质检确认"
         prop="checkFlag"
       ><el-switch v-model="formData.checkFlag" /></el-form-item></el-col></el-row>
       <el-row :gutter="20"><el-col :span="12"><el-form-item
         label="准备时间"
         prop="prepareTime"
       ><el-input-number
         v-model="formData.prepareTime"
         :min="0"
         controls-position="right"
       /> 分钟</el-form-item></el-col><el-col :span="12"><el-form-item
         label="等待时间"
         prop="waitTime"
       ><el-input-number
         v-model="formData.waitTime"
         :min="0"
         controls-position="right"
       /> 分钟</el-form-item></el-col></el-row><el-form-item
         label="备注"
         prop="remark"
       ><el-input
         v-model="formData.remark"
         type="textarea"
         placeholder="请输入备注"
       /></el-form-item></el-form>
      <span slot="footer"><el-button
        type="primary"
        :disabled="formLoading"
        @click="submitForm"
      >确 定</el-button><el-button @click="formVisible = false">取 消</el-button></span></el-dialog>
  </div>
</template>

<script>
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { ProRouteProcessApi } from '@/api/mes/pro/route/process'
import { ProProcessApi } from '@/api/mes/pro/process'

export default {
  name: 'RouteProcessList', props: { routeId: { type: Number, required: true }, formType: { type: String, required: true }},
  data() { return { DICT_TYPE, loading: false, list: [], processList: [], formVisible: false, formTitle: '', formLoading: false, formType2: '', formData: {}, formRules: { sort: [{ required: true, message: '序号不能为空', trigger: 'blur' }], processId: [{ required: true, message: '工序不能为空', trigger: 'change' }], linkType: [{ required: true, message: '工序关系不能为空', trigger: 'change' }], keyFlag: [{ required: true, message: '是否关键工序不能为空', trigger: 'change' }], checkFlag: [{ required: true, message: '是否需要质检确认不能为空', trigger: 'change' }] }} },
  computed: { isEditable() { return ['create', 'update'].includes(this.formType) } },
  watch: { routeId: { immediate: true, handler(value) { if (value) this.getList() } }},
  created() { this.loadProcessList() },
  methods: {
    getIntDictOptions,
    async getList() { this.loading = true; try { const response = await ProRouteProcessApi.getRouteProcessListByRoute(this.routeId); this.list = response.data } finally { this.loading = false } },
    async loadProcessList() { const response = await ProProcessApi.getProcessSimpleList(); this.processList = response.data },
    openForm(type, row) { this.formVisible = true; this.formTitle = type === 'create' ? '添加工序' : '编辑工序'; this.formType2 = type; if (type === 'create') { const maxSort = this.list.reduce((max, item) => Math.max(max, item.sort || 0), 0); this.formData = { routeId: this.routeId, sort: maxSort + 1, processId: undefined, linkType: 3, colorCode: '#00AEF3', keyFlag: false, checkFlag: false, prepareTime: 0, waitTime: 0, remark: undefined } } else this.formData = { ...row }; this.$nextTick(() => { if (this.$refs.form) this.$refs.form.resetFields() }) },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.formType2 === 'create') { await ProRouteProcessApi.createRouteProcess(this.formData); this.$modal.msgSuccess('新增成功') } else { await ProRouteProcessApi.updateRouteProcess(this.formData); this.$modal.msgSuccess('修改成功') } this.formVisible = false; await this.getList() } finally { this.formLoading = false } }) },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该路线工序？'); await ProRouteProcessApi.deleteRouteProcess(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* canceled */ } }
  }
}
</script>

<style scoped>.toolbar { margin-bottom: 10px; }.color-box { display: inline-block; width: 16px; height: 16px; margin-right: 4px; border-radius: 4px; vertical-align: middle; }.color-value { margin-left: 8px; }.danger-text { color: #f56c6c; }</style>
