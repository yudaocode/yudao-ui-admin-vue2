<!-- 生产报工关联的产品产出记录（只读） -->
<template>
  <div>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
    >
      <el-table-column
        label="物资编码"
        align="center"
        prop="itemCode"
        min-width="120"
      />
      <el-table-column
        label="物资名称"
        align="center"
        prop="itemName"
        min-width="140"
      />
      <el-table-column
        label="规格型号"
        align="center"
        prop="specification"
        min-width="120"
      />
      <el-table-column
        label="产出数量"
        align="center"
        prop="quantity"
        min-width="100"
      />
      <el-table-column
        label="单位"
        align="center"
        prop="unitMeasureName"
        min-width="80"
      />
      <el-table-column
        label="批次号"
        align="center"
        prop="batchCode"
        min-width="120"
      />
      <el-table-column
        label="质量状态"
        align="center"
        prop="qualityStatus"
        min-width="100"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.MES_WM_QUALITY_STATUS"
        :value="scope.row.qualityStatus"
      /></template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { getProductProduceLinePage } from '@/api/mes/wm/productproduce/line'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'ProductProduceList',
  props: { feedbackId: { type: Number, required: true }},
  data() {
    return {
      DICT_TYPE,
      loading: false,
      list: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10, feedbackId: undefined }
    }
  },
  watch: {
    feedbackId: {
      immediate: true,
      handler(value) {
        if (value) {
          this.queryParams.pageNo = 1
          this.getList()
        } else {
          this.list = []
          this.total = 0
        }
      }
    }
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        this.queryParams.feedbackId = this.feedbackId
        const response = await getProductProduceLinePage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
