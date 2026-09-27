<template>
  <div class="overflow-hidden">
    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="检测项名称"
        align="center"
        prop="indicatorName"
        min-width="150"
      />
      <el-table-column
        label="检测项类型"
        align="center"
        prop="indicatorType"
        width="120"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.MES_INDICATOR_TYPE"
            :value="scope.row.indicatorType"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="检测工具"
        align="center"
        prop="tool"
        width="120"
      />
      <el-table-column
        label="检测方法"
        align="center"
        prop="checkMethod"
        min-width="180"
      />
      <el-table-column
        label="标准值"
        align="center"
        prop="standardValue"
        width="100"
      />
      <el-table-column
        label="单位"
        align="center"
        prop="unitMeasureName"
        width="80"
      />
      <el-table-column
        label="误差上限"
        align="center"
        prop="maxThreshold"
        width="100"
      />
      <el-table-column
        label="误差下限"
        align="center"
        prop="minThreshold"
        width="100"
      />
      <el-table-column
        label="致命缺陷数"
        align="center"
        prop="criticalQuantity"
        width="100"
      />
      <el-table-column
        label="严重缺陷数"
        align="center"
        prop="majorQuantity"
        width="100"
      />
      <el-table-column
        label="轻微缺陷数"
        align="center"
        prop="minorQuantity"
        width="100"
      />
      <el-table-column
        label="操作"
        align="center"
        width="100"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="openDefectDialog(scope.row)"
          > 缺陷列表 </el-button>
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

    <!-- 缺陷记录弹窗（内联编辑） -->
    <DefectRecordInlineList
      ref="defectListRef"
      :form-type="formType"
      @refresh="getList"
    />
  </div>
</template>

<script>
import { ref, reactive, watch, toRefs } from 'vue'
import { DICT_TYPE } from '@/utils/dict'
import { QcOqcLineApi } from '@/api/mes/qc/oqc/line'
import DefectRecordInlineList from '@/views/mes/qc/defectrecord/components/DefectRecordInlineList.vue'
import { MesQcTypeEnum } from '@/views/mes/utils/constants'
export default {
  name: 'OqcLineList',
  components: { DefectRecordInlineList },
  props: { 'oqcId': { type: Number, required: true }, 'formType': { type: String }},
  setup(props, { emit }) {
    const loading = ref(false) // 列表的加载中
    const list = ref([]) // 列表的数据
    const total = ref(0) // 列表的总页数
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      oqcId: undefined
    })
    const defectListRef = ref() // 缺陷记录弹窗 Ref
    /** 打开缺陷记录弹窗 */
    const openDefectDialog = (row) => {
      defectListRef.value.open(MesQcTypeEnum.OQC, props.oqcId, row.id)
    }
    /** 查询列表 */
    const getList = async() => {
      if (!props.oqcId) {
        return
      }
      queryParams.oqcId = props.oqcId
      loading.value = true
      try {
        const data = (await QcOqcLineApi.getOqcLinePage(queryParams)).data
        list.value = data.list
        total.value = data.total
      } finally {
        loading.value = false
      }
    }
    /** 监听 oqcId 变化，重新加载列表 */
    watch(() => props.oqcId, () => {
      queryParams.pageNo = 1
      getList()
    }, { immediate: true })
    return { ...toRefs(props), DICT_TYPE, DefectRecordInlineList, defectListRef, getList, list, loading, openDefectDialog, queryParams, total }
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

