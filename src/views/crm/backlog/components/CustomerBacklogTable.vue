<template>
  <el-table
    v-loading="loading"
    :data="list"
    stripe
    border
    :show-overflow-tooltip="true"
  >
    <el-table-column
      label="客户名称"
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
      label="客户来源"
      prop="source"
      width="110"
    >
      <template slot-scope="scope">
        <dict-tag
          :type="DICT_TYPE.CRM_CUSTOMER_SOURCE"
          :value="scope.row.source"
        />
      </template>
    </el-table-column>
    <el-table-column
      label="手机"
      prop="mobile"
      width="130"
    />
    <el-table-column
      label="电话"
      prop="telephone"
      width="130"
    />
    <el-table-column
      label="邮箱"
      prop="email"
      width="180"
    />
    <el-table-column
      label="客户级别"
      prop="level"
      width="110"
    >
      <template slot-scope="scope">
        <dict-tag
          :type="DICT_TYPE.CRM_CUSTOMER_LEVEL"
          :value="scope.row.level"
        />
      </template>
    </el-table-column>
    <el-table-column
      label="客户行业"
      prop="industryId"
      width="110"
    >
      <template slot-scope="scope">
        <dict-tag
          :type="DICT_TYPE.CRM_CUSTOMER_INDUSTRY"
          :value="scope.row.industryId"
        />
      </template>
    </el-table-column>
    <el-table-column
      label="下次联系时间"
      prop="contactNextTime"
      width="180"
      :formatter="dateFormatter"
    />
    <el-table-column
      label="备注"
      prop="remark"
      width="200"
    />
    <el-table-column
      label="锁定状态"
      prop="lockStatus"
      width="100"
    >
      <template slot-scope="scope">
        <dict-tag
          :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
          :value="scope.row.lockStatus"
        />
      </template>
    </el-table-column>
    <el-table-column
      label="成交状态"
      prop="dealStatus"
      width="100"
    >
      <template slot-scope="scope">
        <dict-tag
          :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
          :value="scope.row.dealStatus"
        />
      </template>
    </el-table-column>
    <el-table-column
      label="最后跟进时间"
      prop="contactLastTime"
      width="180"
      :formatter="dateFormatter"
    />
    <el-table-column
      label="最后跟进记录"
      prop="contactLastContent"
      width="200"
    />
    <el-table-column
      label="地址"
      prop="detailAddress"
      width="180"
    />
    <el-table-column
      v-if="showPoolDay"
      label="距离进入公海天数"
      prop="poolDay"
      width="150"
    >
      <template slot-scope="scope">{{ formatPoolDay(scope.row.poolDay) }}</template>
    </el-table-column>
    <el-table-column
      label="负责人"
      prop="ownerUserName"
      width="110"
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
      width="110"
    />
  </el-table>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import { formatPoolDay } from './common'

export default {
  name: 'CrmCustomerBacklogTable',
  props: {
    loading: { type: Boolean, default: false },
    list: { type: Array, default: () => [] },
    showPoolDay: { type: Boolean, default: false }
  },
  data() {
    return { DICT_TYPE }
  },
  methods: { dateFormatter, formatPoolDay }
}
</script>
