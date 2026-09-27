<template>
  <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
    <el-table-column label="地址编号" align="center" prop="id" width="120" />
    <el-table-column label="收件人名称" align="center" prop="name" width="120" />
    <el-table-column label="手机号" align="center" prop="mobile" width="130" />
    <el-table-column label="所在地区" align="center" prop="areaName" width="160" />
    <el-table-column label="收件详细地址" align="center" prop="detailAddress" min-width="220" />
    <el-table-column label="是否默认" align="center" width="90">
      <template slot-scope="scope"><dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="Number(scope.row.defaultStatus)" /></template>
    </el-table-column>
    <el-table-column label="创建时间" align="center" prop="createTime" width="180" :formatter="dateFormatter" />
  </el-table>
</template>

<script>
import * as AddressApi from '@/api/member/address'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils'

export default {
  name: 'UserAddressList',
  props: { userId: { type: [Number, String], required: true }},
  data() { return { DICT_TYPE, loading: true, list: [] } },
  mounted() { this.getList() },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return AddressApi.getAddressList({ userId: this.userId })
        .then(response => {
          this.list = response.data
        })
        .finally(() => { this.loading = false })
    }
  }
}
</script>
