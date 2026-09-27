<template>
  <div>
    <el-button
      type="primary"
      plain
      class="mb10"
      icon="el-icon-plus"
      @click="openForm('create')"
    >新增分段</el-button>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="分段排序"
        align="center"
        prop="sort"
        width="80"
      />
      <el-table-column
        label="分段类型"
        align="center"
        prop="type"
        width="120"
      ><template v-slot="scope"><dict-tag
        :type="DICT_TYPE.MES_MD_AUTO_CODE_PART_TYPE"
        :value="scope.row.type"
      /></template></el-table-column>
      <el-table-column
        label="分段长度"
        align="center"
        prop="length"
        width="80"
      />
      <el-table-column
        label="日期格式"
        align="center"
        prop="dateFormat"
        width="150"
      />
      <el-table-column
        label="固定字符"
        align="center"
        prop="fixCharacter"
        width="120"
      />
      <el-table-column
        label="流水号起始"
        align="center"
        prop="serialStartNo"
        width="100"
      />
      <el-table-column
        label="流水号步长"
        align="center"
        prop="serialStep"
        width="100"
      />
      <el-table-column
        label="是否循环"
        align="center"
        prop="cycleFlag"
        width="100"
      ><template v-slot="scope"><dict-tag
        :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
        :value="scope.row.cycleFlag"
      /></template></el-table-column>
      <el-table-column
        label="循环方式"
        align="center"
        prop="cycleMethod"
        width="120"
      ><template v-slot="scope"><dict-tag
        v-if="scope.row.cycleFlag"
        :type="DICT_TYPE.MES_MD_AUTO_CODE_CYCLE_METHOD"
        :value="scope.row.cycleMethod"
      /></template></el-table-column>
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
        show-overflow-tooltip
      />
      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
      ><template v-slot="scope"><el-button
        type="text"
        @click="openForm('update', scope.row.id)"
      >编辑</el-button><el-button
        type="text"
        @click="handleDelete(scope.row.id)"
      >删除</el-button></template></el-table-column>
    </el-table>
    <auto-code-part-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { AutoCodePartApi } from '@/api/mes/md/autocode/part'
import AutoCodePartForm from './AutoCodePartForm.vue'
export default {
  name: 'AutoCodePartList', components: { AutoCodePartForm }, props: { ruleId: { type: Number, required: true }},
  data() { return { DICT_TYPE, loading: true, list: [] } },
  created() { this.getList() },
  methods: {
    async getList() { this.loading = true; try { this.list = (await AutoCodePartApi.getAutoCodePartListByRuleId(this.ruleId)).data } finally { this.loading = false } },
    openForm(type, id) { const maxSort = this.list.length ? Math.max(...this.list.map(item => item.sort || 0)) : 0; this.$refs.form.open(type, id, this.ruleId, maxSort) },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除编码规则分段？'); await AutoCodePartApi.deleteAutoCodePart(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 取消删除 */ } }
  }
}
</script>

<style scoped>.mb10 { margin-bottom: 10px; }</style>
