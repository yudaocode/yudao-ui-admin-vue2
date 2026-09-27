<template>
  <div>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="商品编号" align="center" prop="id" width="120" />
      <el-table-column label="商品图" align="center" width="80"><template slot-scope="scope"><el-image v-if="scope.row.picUrl" :src="scope.row.picUrl" :preview-src-list="scope.row.picUrl ? [scope.row.picUrl] : []" style="width: 30px; height: 30px" /></template></el-table-column>
      <el-table-column label="商品名称" align="center" prop="name" min-width="180" />
      <el-table-column label="商品售价" align="center" prop="price" width="110"><template slot-scope="scope">{{ floatToFixed2(scope.row.price) }} 元</template></el-table-column>
      <el-table-column label="销量" align="center" prop="salesCount" width="90" />
      <el-table-column label="收藏时间" align="center" prop="createTime" width="180" :formatter="dateFormatter" />
      <el-table-column label="状态" align="center" prop="status" width="100"><template slot-scope="scope"><dict-tag :type="DICT_TYPE.PRODUCT_SPU_STATUS" :value="scope.row.status" /></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { getFavoritePage } from '@/api/mall/product/favorite'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter, floatToFixed2 } from '@/utils'

export default {
  name: 'UserFavoriteList',
  props: { userId: { type: [Number, String], required: true }},
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        createTime: [],
        userId: undefined
      }
    }
  },
  mounted() { this.getList() },
  methods: {
    dateFormatter,
    floatToFixed2,
    async getList() {
      this.loading = true
      this.queryParams.userId = this.userId
      try {
        const response = await getFavoritePage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
