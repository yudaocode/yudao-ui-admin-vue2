<template>
  <el-dialog
    :visible.sync="dialogVisible"
    append-to-body
    title="选择规格"
    width="700px"
  >
    <el-table
      v-loading="loading"
      :data="list"
      show-overflow-tooltip
    >
      <el-table-column
        label="#"
        width="55"
      >
        <template slot-scope="scope">
          <el-radio
            v-model="selectedSkuId"
            :label="scope.row.id"
            @change="handleSelected(scope.row)"
          >
            &nbsp;
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column
        label="图片"
        min-width="80"
      >
        <template slot-scope="scope">
          <el-image
            :preview-src-list="[scope.row.picUrl]"
            :src="scope.row.picUrl"
            class="sku-image"
          />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="规格"
        min-width="80"
      >
        <template slot-scope="scope">
          {{ propertiesText(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="销售价(元)"
        min-width="80"
      >
        <template slot-scope="scope">
          {{ fenToYuan(scope.row.price) }}
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
import { getSpu } from '@/api/mall/product/spu'
import { fenToYuan } from '@/utils'

export default {
  name: 'SkuTableSelect',
  props: {
    spuId: {
      type: Number,
      default: undefined
    }
  },
  data() {
    return {
      list: [],
      loading: false,
      dialogVisible: false,
      selectedSkuId: undefined
    }
  },
  watch: {
    spuId: {
      immediate: true,
      handler(value) {
        if (value) this.getSpuDetail()
      }
    }
  },
  methods: {
    fenToYuan,
    propertiesText(row) {
      return (row.properties || []).map(property => property.valueName).join(' ')
    },
    handleSelected(row) {
      this.$emit('change', row)
      this.dialogVisible = false
      this.selectedSkuId = undefined
    },
    open() {
      this.dialogVisible = true
    },
    async getSpuDetail() {
      this.loading = true
      try {
        const response = await getSpu(this.spuId)
        this.list = response.data.skus
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.sku-image {
  width: 30px;
  height: 30px;
}
</style>
