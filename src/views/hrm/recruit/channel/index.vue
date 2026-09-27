<template>
  <div class="app-container">
    <el-card
      class="box-card"
      shadow="never"
    >
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="68px"
      >
        <el-form-item
          label="渠道名称"
          prop="name"
        >
          <el-input
            v-model="queryParams.name"
            placeholder="请输入渠道名称"
            clearable
            class="query-width"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            class="query-width"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="handleQuery"
          >搜索</el-button>
          <el-button
            icon="el-icon-refresh"
            @click="resetQuery"
          >重置</el-button>
          <el-button
            v-hasPermi="['hrm:recruit:channel:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card
      class="box-card table-card"
      shadow="never"
    >
      <el-table
        v-loading="loading"
        :data="list"
        stripe
      >
        <el-table-column
          label="渠道编号"
          align="center"
          prop="id"
          width="120"
        />
        <el-table-column
          label="渠道名称"
          align="center"
          prop="name"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column
          label="系统内置"
          align="center"
          prop="systemFlag"
          width="100"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.systemFlag ? 'success' : 'info'">
              {{ scope.row.systemFlag ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          align="center"
          prop="status"
          width="100"
        >
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="CommonStatusEnum.ENABLE"
              :disabled="!checkPermi(['hrm:recruit:channel:update'])"
              :inactive-value="CommonStatusEnum.DISABLE"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="排序"
          align="center"
          prop="sort"
          width="90"
        />
        <el-table-column
          label="备注"
          align="center"
          prop="remark"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="操作"
          align="center"
          width="120"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['hrm:recruit:channel:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-if="!scope.row.systemFlag"
              v-hasPermi="['hrm:recruit:channel:delete']"
              type="text"
              class="danger-text"
              @click="openDeleteForm(scope.row)"
            >删除</el-button>
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
    </el-card>

    <recruit-channel-form
      ref="form"
      @success="getList"
    />
    <recruit-channel-delete-form
      ref="deleteForm"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { dateFormatter } from '@/utils'
import { checkPermi } from '@/utils/permission'
import { getRecruitChannelPage, updateRecruitChannelStatus } from '@/api/hrm/recruit/channel'
import RecruitChannelForm from './RecruitChannelForm.vue'
import RecruitChannelDeleteForm from './RecruitChannelDeleteForm.vue'

export default {
  name: 'HrmRecruitChannel',
  components: { RecruitChannelForm, RecruitChannelDeleteForm },
  data() {
    return {
      DICT_TYPE,
      CommonStatusEnum,
      loading: true,
      total: 0,
      list: [],
      queryParams: { pageNo: 1, pageSize: 10, name: '', status: undefined }
    }
  },
  created() { this.getList() },
  methods: {
    getIntDictOptions,
    checkPermi,
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const response = await getRecruitChannelPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    openForm(type, id) { this.$refs.form.open(type, id) },
    async handleStatusChange(row) {
      if (!row.id || row.status === undefined) return
      try {
        const text = row.status === CommonStatusEnum.ENABLE ? '启用' : '停用'
        await this.$modal.confirm('确认要' + text + '招聘渠道"' + row.name + '"吗？')
        await updateRecruitChannelStatus({ id: row.id, status: row.status })
        await this.getList()
      } catch (error) {
        row.status = row.status === CommonStatusEnum.ENABLE
          ? CommonStatusEnum.DISABLE
          : CommonStatusEnum.ENABLE
      }
    },
    openDeleteForm(channel) { this.$refs.deleteForm.open(channel) }
  }
}
</script>

<style scoped>
.table-card { margin-top: 16px; }
.query-width { width: 240px; }
.danger-text { color: #f56c6c; }
</style>
