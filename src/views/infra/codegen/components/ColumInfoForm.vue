<template>
  <el-table :data="columns" row-key="columnId" :max-height="tableHeight">
    <el-table-column label="字段列名" prop="columnName" min-width="120" show-overflow-tooltip />
    <el-table-column label="字段描述" min-width="140"><template v-slot="scope"><el-input v-model="scope.row.columnComment" /></template></el-table-column>
    <el-table-column label="物理类型" prop="dataType" min-width="100" show-overflow-tooltip />
    <el-table-column label="Java类型" min-width="120"><template v-slot="scope"><el-select v-model="scope.row.javaType"><el-option v-for="type in javaTypes" :key="type" :label="type" :value="type" /></el-select></template></el-table-column>
    <el-table-column label="java属性" min-width="120"><template v-slot="scope"><el-input v-model="scope.row.javaField" /></template></el-table-column>
    <el-table-column label="插入" width="55"><template v-slot="scope"><el-checkbox v-model="scope.row.createOperation" true-label="true" false-label="false" /></template></el-table-column>
    <el-table-column label="编辑" width="55"><template v-slot="scope"><el-checkbox v-model="scope.row.updateOperation" true-label="true" false-label="false" /></template></el-table-column>
    <el-table-column label="列表" width="55"><template v-slot="scope"><el-checkbox v-model="scope.row.listOperationResult" true-label="true" false-label="false" /></template></el-table-column>
    <el-table-column label="查询" width="55"><template v-slot="scope"><el-checkbox v-model="scope.row.listOperation" true-label="true" false-label="false" /></template></el-table-column>
    <el-table-column label="查询方式" min-width="100"><template v-slot="scope"><el-select v-model="scope.row.listOperationCondition"><el-option v-for="item in conditions" :key="item" :label="item" :value="item" /></el-select></template></el-table-column>
    <el-table-column label="允许空" width="65"><template v-slot="scope"><el-checkbox v-model="scope.row.nullable" true-label="true" false-label="false" /></template></el-table-column>
    <el-table-column label="显示类型" min-width="120"><template v-slot="scope"><el-select v-model="scope.row.htmlType"><el-option v-for="item in htmlTypes" :key="item.value" :label="item.label" :value="item.value" /></el-select></template></el-table-column>
    <el-table-column label="字典类型" min-width="140"><template v-slot="scope"><el-select v-model="scope.row.dictType" clearable filterable><el-option v-for="dict in effectiveDictOptions" :key="dict.id" :label="dict.name" :value="dict.type" /></el-select></template></el-table-column>
    <el-table-column label="示例" min-width="120"><template v-slot="scope"><el-input v-model="scope.row.example" /></template></el-table-column>
  </el-table>
</template>

<script>
import { getSimpleDictTypeList } from '@/api/system/dict/type'

export default {
  name: 'InfraCodegenColumInfoForm',
  props: {
    columns: { type: Array, default: () => [] },
    dictOptions: { type: Array, default: null }
  },
  computed: {
    effectiveDictOptions() {
      return this.dictOptions || this.loadedDictOptions
    }
  },
  data() {
    return {
      tableHeight: (document.documentElement.scrollHeight - 350) + 'px',
      javaTypes: ['Long', 'String', 'Integer', 'Double', 'BigDecimal', 'LocalDateTime', 'Boolean'],
      conditions: ['=', '!=', '>', '>=', '<>', '<=', 'LIKE', 'BETWEEN'],
      htmlTypes: [
        { label: '文本框', value: 'input' }, { label: '文本域', value: 'textarea' },
        { label: '下拉框', value: 'select' }, { label: '单选框', value: 'radio' },
        { label: '复选框', value: 'checkbox' }, { label: '日期控件', value: 'datetime' },
        { label: '图片上传', value: 'imageUpload' }, { label: '文件上传', value: 'fileUpload' },
        { label: '富文本控件', value: 'editor' }
      ],
      loadedDictOptions: []
    }
  },
  created() {
    if (this.dictOptions) return
    return getSimpleDictTypeList().then(response => { this.loadedDictOptions = response.data })
  }
}
</script>
