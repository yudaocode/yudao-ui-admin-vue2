<template>
  <el-table
    v-loading="loading"
    :data="list"
    stripe
    border
    :show-overflow-tooltip="true"
  >
    <el-table-column
      label="合同编号"
      prop="no"
      fixed="left"
      width="180"
    />
    <el-table-column
      label="合同名称"
      prop="name"
      fixed="left"
      width="160"
    >
      <template slot-scope="scope">
        <el-link
          type="primary"
          :underline="false"
          @click="$emit('open-detail', scope.row.id)"
        >
          {{ scope.row.name || '-' }}
        </el-link>
      </template>
    </el-table-column>
    <el-table-column
      label="客户名称"
      prop="customerName"
      width="140"
    >
      <template slot-scope="scope">
        <el-link
          v-if="scope.row.customerId"
          type="primary"
          :underline="false"
          @click="$emit('open-customer', scope.row.customerId)"
        >{{ scope.row.customerName || '-' }}</el-link>
        <span v-else>{{ scope.row.customerName || '-' }}</span>
      </template>
    </el-table-column>
    <el-table-column
      label="商机名称"
      prop="businessName"
      width="140"
    >
      <template slot-scope="scope">
        <el-link
          v-if="scope.row.businessId"
          type="primary"
          :underline="false"
          @click="$emit('open-business', scope.row.businessId)"
        >{{ scope.row.businessName || '-' }}</el-link>
        <span v-else>{{ scope.row.businessName || '-' }}</span>
      </template>
    </el-table-column>
    <el-table-column
      label="合同金额（元）"
      prop="totalPrice"
      width="140"
      :formatter="erpPriceTableColumnFormatter"
    />
    <el-table-column
      label="下单时间"
      prop="orderDate"
      width="120"
      :formatter="dateFormatter2"
    />
    <el-table-column
      label="合同开始时间"
      prop="startTime"
      width="130"
      :formatter="dateFormatter2"
    />
    <el-table-column
      label="合同结束时间"
      prop="endTime"
      width="130"
      :formatter="dateFormatter2"
    />
    <el-table-column
      label="客户签约人"
      prop="signContactName"
      width="130"
    >
      <template slot-scope="scope">
        <el-link
          v-if="scope.row.signContactId"
          type="primary"
          :underline="false"
          @click="$emit('open-contact', scope.row.signContactId)"
        >{{ scope.row.signContactName || '-' }}</el-link>
        <span v-else>{{ scope.row.signContactName || '-' }}</span>
      </template>
    </el-table-column>
    <el-table-column
      label="公司签约人"
      prop="signUserName"
      width="130"
    />
    <el-table-column
      label="备注"
      prop="remark"
      width="200"
    />
    <el-table-column
      label="已回款金额（元）"
      prop="totalReceivablePrice"
      width="150"
      :formatter="erpPriceTableColumnFormatter"
    />
    <el-table-column
      label="未回款金额（元）"
      width="150"
    >
      <template slot-scope="scope">{{ formatUnpaidPrice(scope.row) }}</template>
    </el-table-column>
    <el-table-column
      label="最后跟进时间"
      prop="contactLastTime"
      width="180"
      :formatter="dateFormatter"
    />
    <el-table-column
      label="负责人"
      prop="ownerUserName"
      width="120"
    />
    <el-table-column
      label="所属部门"
      prop="ownerUserDeptName"
      width="120"
    />
    <el-table-column
      label="更新时间"
      prop="updateTime"
      width="180"
      :formatter="dateFormatter"
    />
    <el-table-column
      label="创建时间"
      prop="createTime"
      width="180"
      :formatter="dateFormatter"
    />
    <el-table-column
      label="创建人"
      prop="creatorName"
      width="120"
    />
    <el-table-column
      label="合同状态"
      prop="auditStatus"
      fixed="right"
      width="120"
    >
      <template slot-scope="scope">
        <dict-tag
          :type="DICT_TYPE.CRM_AUDIT_STATUS"
          :value="scope.row.auditStatus"
        />
      </template>
    </el-table-column>
    <el-table-column
      label="操作"
      fixed="right"
      width="100"
    >
      <template slot-scope="scope">
        <el-button
          v-hasPermi="['crm:contract:update']"
          type="text"
          size="mini"
          :disabled="!scope.row.processInstanceId"
          @click="$emit('open-process', scope.row)"
        >查看审批</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import {
  dateFormatter,
  dateFormatter2,
  erpPriceInputFormatter,
  erpPriceTableColumnFormatter
} from '@/utils'

export default {
  name: 'CrmContractBacklogTable',
  props: {
    loading: { type: Boolean, default: false },
    list: { type: Array, default: () => [] }
  },
  data() {
    return { DICT_TYPE }
  },
  methods: {
    dateFormatter,
    dateFormatter2,
    erpPriceTableColumnFormatter,
    formatUnpaidPrice(row) {
      const totalPrice = Number(row && row.totalPrice || 0)
      const receivedPrice = Number(row && row.totalReceivablePrice || 0)
      return erpPriceInputFormatter(totalPrice - receivedPrice)
    }
  }
}
</script>
