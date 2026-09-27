<template>
  <section
    class="crm-follow-up-record"
    aria-label="跟进记录"
  >
    <el-row
      type="flex"
      justify="end"
      class="follow-up-toolbar"
    >
      <el-button
        type="primary"
        size="small"
        icon="el-icon-edit"
        @click="openForm"
      >
        写跟进
      </el-button>
    </el-row>

    <el-table
      v-loading="loading"
      :data="list"
      stripe
      border
      :show-overflow-tooltip="true"
    >
      <el-table-column
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      >
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) || '-' }}</template>
      </el-table-column>
      <el-table-column
        align="center"
        label="跟进人"
        prop="creatorName"
        min-width="110"
      />
      <el-table-column
        align="center"
        label="跟进类型"
        prop="type"
        width="110"
      >
        <template slot-scope="scope">
          <dict-tag
            type="crm_follow_up_type"
            :value="scope.row.type"
          />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="跟进内容"
        prop="content"
        min-width="200"
      />
      <el-table-column
        label="图片"
        align="center"
        min-width="140"
      >
        <template slot-scope="scope">
          <div
            v-if="normalizeUrls(scope.row.picUrls).length > 0"
            class="image-list"
          >
            <el-image
              v-for="url in normalizeUrls(scope.row.picUrls)"
              :key="url"
              :src="url"
              :preview-src-list="normalizeUrls(scope.row.picUrls)"
              fit="cover"
              class="record-image"
            />
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        label="附件"
        align="center"
        min-width="160"
      >
        <template slot-scope="scope">
          <div
            v-if="normalizeUrls(scope.row.fileUrls).length > 0"
            class="file-list"
          >
            <el-link
              v-for="url in normalizeUrls(scope.row.fileUrls)"
              :key="url"
              :href="url"
              type="primary"
              target="_blank"
              :underline="false"
            >{{ getFileName(url) }}</el-link>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="下次联系时间"
        prop="nextTime"
        width="180"
      >
        <template slot-scope="scope">{{ parseTime(scope.row.nextTime) || '-' }}</template>
      </el-table-column>
      <el-table-column
        v-if="Number(bizType) === BizTypeEnum.CRM_CUSTOMER"
        align="center"
        label="关联联系人"
        min-width="150"
      >
        <template slot-scope="scope">
          <el-link
            v-for="contact in scope.row.contacts || []"
            :key="contact.id"
            type="primary"
            :underline="false"
            class="relation-link"
            @click="openContactDetail(contact.id)"
          >{{ contact.name }}</el-link>
          <span v-if="!scope.row.contacts || scope.row.contacts.length === 0">-</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="Number(bizType) === BizTypeEnum.CRM_CUSTOMER"
        align="center"
        label="关联商机"
        min-width="150"
      >
        <template slot-scope="scope">
          <el-link
            v-for="business in scope.row.businesses || []"
            :key="business.id"
            type="primary"
            :underline="false"
            class="relation-link"
            @click="openBusinessDetail(business.id)"
          >{{ business.name }}</el-link>
          <span v-if="!scope.row.businesses || scope.row.businesses.length === 0">-</span>
        </template>
      </el-table-column>
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
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <follow-up-record-form
      ref="form"
      @success="getList"
    />
  </section>
</template>

<script>
import { FollowUpRecordApi } from '@/api/crm/followup'
import { BizTypeEnum } from '@/api/crm/permission'
import FollowUpRecordForm from './FollowUpRecordForm.vue'

export default {
  name: 'FollowUpRecord',
  components: { FollowUpRecordForm },
  props: {
    bizType: { type: Number, required: true },
    bizId: { type: [Number, String], required: true }
  },
  data() {
    return {
      BizTypeEnum,
      loading: false,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        bizType: undefined,
        bizId: undefined
      },
      requestSequence: 0
    }
  },
  watch: {
    bizId: { immediate: true, handler: 'handleBizChange' },
    bizType: 'handleBizChange'
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    handleBizChange() {
      this.queryParams.pageNo = 1
      this.queryParams.bizType = this.bizType
      this.queryParams.bizId = this.bizId
      if (this.bizId !== undefined && this.bizId !== null && this.bizId !== '') this.getList()
    },
    async getList() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const data = (await FollowUpRecordApi.getFollowUpRecordPage(this.queryParams)).data
        if (requestId !== this.requestSequence) return
        this.list = data.list
        this.total = data.total
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    openForm() {
      this.$refs.form.open(this.bizType, this.bizId)
    },
    handleDelete(id) {
      this.$modal.confirm('是否确认删除该跟进记录？')
        .then(() => FollowUpRecordApi.deleteFollowUpRecord(id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          return this.getList()
        })
        .catch(() => {})
    },
    openContactDetail(id) {
      this.$router.push({ name: 'CrmContactDetail', params: { id }}).catch(() => {})
    },
    openBusinessDetail(id) {
      this.$router.push({ name: 'CrmBusinessDetail', params: { id }}).catch(() => {})
    },
    normalizeUrls(value) {
      if (Array.isArray(value)) return value.filter(Boolean)
      if (!value) return []
      return String(value).split(',').map(item => item.trim()).filter(Boolean)
    },
    getFileName(url) {
      if (!url) return ''
      const path = String(url).split('?')[0]
      return decodeURIComponent(path.substring(path.lastIndexOf('/') + 1))
    }
  }
}
</script>

<style scoped>
.follow-up-toolbar { margin-bottom: 12px; }
.image-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
.record-image { width: 40px; height: 40px; }
.file-list { display: flex; flex-direction: column; align-items: flex-start; }
.relation-link { margin-right: 8px; }
.danger-text { color: #f56c6c; }
</style>
