<template>
  <section
    class="backlog-list"
    aria-label="分配给我的线索"
  >
    <el-card
      shadow="never"
      class="filter-card"
    >
      <div class="list-title">分配给我的线索</div>
      <el-form
        :inline="true"
        :model="queryParams"
        label-width="68px"
        size="small"
      >
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.followUpStatus"
            placeholder="状态"
            @change="handleQuery"
          >
            <el-option
              v-for="option in FOLLOWUP_STATUS"
              :key="String(option.value)"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        border
        :show-overflow-tooltip="true"
      >
        <el-table-column
          label="线索名称"
          prop="name"
          fixed="left"
          width="160"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="openDetail(scope.row.id)"
            >
              {{ scope.row.name || '-' }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="线索来源"
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
          label="地址"
          prop="detailAddress"
          width="180"
        />
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
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
  </section>
</template>

<script>
import * as ClueApi from '@/api/crm/clue'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import { FOLLOWUP_STATUS } from './common'

export default {
  name: 'CrmClueFollowList',
  data() {
    return {
      DICT_TYPE,
      FOLLOWUP_STATUS,
      loading: false,
      total: 0,
      list: [],
      requestSequence: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        sceneType: 1,
        followUpStatus: false,
        transformStatus: false
      }
    }
  },
  created() {
    this.getList()
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    dateFormatter,
    async getList() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const page = (await ClueApi.getCluePage(this.queryParams)).data
        if (requestId !== this.requestSequence) return
        this.list = page.list
        this.total = page.total
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    openDetail(id) {
      if (!id) return
      this.$router.push({ name: 'CrmClueDetail', params: { id }}).catch(() => {})
    }
  }
}
</script>

<style scoped>
.filter-card { margin-bottom: 16px; }
.list-title { margin-bottom: 18px; font-size: 18px; line-height: 24px; font-weight: 500; }
</style>
