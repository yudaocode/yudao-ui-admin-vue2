<template>
  <el-table
    :data="businesses"
    stripe
    border
    height="160"
    :show-overflow-tooltip="true"
  >
    <el-table-column
      label="商机名称"
      fixed="left"
      align="center"
      prop="name"
      min-width="140"
    >
      <template slot-scope="scope">
        <el-link
          type="primary"
          :underline="false"
          @click="openDetail(scope.row.id)"
        >
          {{ scope.row.name }}
        </el-link>
      </template>
    </el-table-column>
    <el-table-column
      label="商机金额"
      align="center"
      prop="totalPrice"
      min-width="110"
    >
      <template slot-scope="scope">{{ erpPriceInputFormatter(scope.row.totalPrice) }}</template>
    </el-table-column>
    <el-table-column
      label="客户名称"
      align="center"
      prop="customerName"
      min-width="120"
    />
    <el-table-column
      label="商机组"
      align="center"
      prop="statusTypeName"
      min-width="120"
    />
    <el-table-column
      label="商机阶段"
      align="center"
      prop="statusName"
      min-width="110"
    />
    <el-table-column
      align="center"
      fixed="right"
      label="操作"
      width="80"
    >
      <template slot-scope="scope">
        <el-button
          type="text"
          size="mini"
          class="danger-text"
          @click="$emit('remove', scope.$index)"
        >
          移除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { erpPriceInputFormatter } from '@/utils'

export default {
  name: 'FollowUpRecordBusinessForm',
  props: {
    businesses: { type: Array, default: () => [] }
  },
  data() {
    return { erpPriceInputFormatter }
  },
  methods: {
    openDetail(id) {
      this.$router.push({ name: 'CrmBusinessDetail', params: { id }}).catch(() => {})
    }
  }
}
</script>

<style scoped>
.danger-text { color: #f56c6c; }
</style>
