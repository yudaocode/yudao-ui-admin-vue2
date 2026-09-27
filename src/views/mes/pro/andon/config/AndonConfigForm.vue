<!-- 安灯呼叫配置弹窗（内联编辑表格） -->
<template>
  <el-dialog
    title="安灯呼叫设置"
    :visible.sync="dialogVisible"
    width="1050px"
    append-to-body
  >
    <div class="toolbar"><el-button
      v-hasPermi="['mes:pro-andon-config:create']"
      type="primary"
      plain
      icon="el-icon-plus"
      @click="handleAdd"
    >新增配置</el-button></div>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      show-overflow-tooltip
    >
      <el-table-column
        label="呼叫原因"
        align="center"
        min-width="200"
      ><template #default="scope"><el-input
        v-if="scope.row.editing"
        v-model="scope.row.reason"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 3 }"
        placeholder="请输入呼叫原因"
      /><span v-else>{{ scope.row.reason }}</span></template></el-table-column>
      <el-table-column
        label="级别"
        align="center"
        width="120"
      ><template #default="scope"><el-select
        v-if="scope.row.editing"
        v-model="scope.row.level"
        placeholder="请选择级别"
      ><el-option
        v-for="dict in getIntDictOptions(DICT_TYPE.MES_PRO_ANDON_LEVEL)"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      /></el-select><dict-tag
        v-else
        :type="DICT_TYPE.MES_PRO_ANDON_LEVEL"
        :value="scope.row.level"
      /></template></el-table-column>
      <el-table-column
        label="处置角色"
        align="center"
        width="160"
      ><template #default="scope"><role-select
        v-if="scope.row.editing"
        v-model="scope.row.handlerRoleId"
        placeholder="请选择角色"
      /><span v-else>{{ scope.row.handlerRoleName || '-' }}</span></template></el-table-column>
      <el-table-column
        label="处置人"
        align="center"
        width="180"
      ><template #default="scope"><user-select-v2
        v-if="scope.row.editing"
        v-model="scope.row.handlerUserId"
        placeholder="请选择处置人"
        clearable
      /><span v-else>{{ scope.row.handlerUserNickname || scope.row.handlerUserId || '-' }}</span></template></el-table-column>
      <el-table-column
        label="备注"
        align="center"
        width="150"
      ><template #default="scope"><el-input
        v-if="scope.row.editing"
        v-model="scope.row.remark"
        placeholder="请输入备注"
      /><span v-else>{{ scope.row.remark || '-' }}</span></template></el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="200"
        fixed="right"
      ><template #default="scope"><template v-if="scope.row.editing"><el-button
        type="text"
        class="success-text"
        @click="handleSave(scope.row)"
      >保存</el-button><el-button
        type="text"
        class="info-text"
        @click="handleCancel(scope.row, scope.$index)"
      >取消</el-button></template><template v-else><el-button
        v-hasPermi="['mes:pro-andon-config:update']"
        type="text"
        @click="handleEdit(scope.row)"
      >编辑</el-button><el-button
        v-hasPermi="['mes:pro-andon-config:delete']"
        type="text"
        class="danger-text"
        @click="handleDelete(scope.row.id)"
      >删除</el-button></template></template></el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
import { ProAndonConfigApi } from '@/api/mes/pro/andon/config'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { MesProAndonLevelEnum } from '@/views/mes/utils/constants'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import RoleSelect from '@/views/system/role/components/RoleSelect.vue'

export default {
  name: 'AndonConfigDialog',
  components: { UserSelectV2, RoleSelect },
  data() { return { DICT_TYPE, dialogVisible: false, loading: false, list: [] } },
  methods: {
    getIntDictOptions,
    async open() { this.dialogVisible = true; await this.getList() },
    async getList() { this.loading = true; try { const response = await ProAndonConfigApi.getAndonConfigList(); this.list = response.data.map(item => ({ ...item, editing: false })) } finally { this.loading = false } },
    handleAdd() { this.list.unshift({ id: undefined, reason: '', level: MesProAndonLevelEnum.LEVEL3, handlerRoleId: undefined, handlerUserId: undefined, remark: '', editing: true, isNew: true }) },
    handleEdit(row) { this.$set(row, '_backup', { ...row }); row.editing = true },
    async handleSave(row) {
      if (!row.reason) { this.$modal.msgWarning('呼叫原因不能为空'); return }
      if (!row.level) { this.$modal.msgWarning('级别不能为空'); return }
      if (!row.handlerUserId && !row.handlerRoleId) { this.$modal.msgWarning('处置角色和处置人至少填一个'); return }
      try { if (row.isNew) { await ProAndonConfigApi.createAndonConfig(row); this.$modal.msgSuccess('新增成功') } else { await ProAndonConfigApi.updateAndonConfig(row); this.$modal.msgSuccess('修改成功') } await this.getList() } catch (error) { /* 接口错误由请求层统一提示 */ }
    },
    handleCancel(row, index) { if (row.isNew) this.list.splice(index, 1); else { Object.assign(row, row._backup); row.editing = false } },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该安灯配置？'); await ProAndonConfigApi.deleteAndonConfig(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 用户取消或接口失败时保留当前列表 */ } }
  }
}
</script>

<style scoped>.toolbar { margin-bottom: 10px; }.success-text { color: #67c23a; }.info-text { color: #909399; }.danger-text { color: #f56c6c; }</style>
