<template>
  <div class="iteration-list-page">
    <doc-alert
      title="【PMS】项目详情与迭代"
      url="https://doc.iocoder.cn/pms/pm/project/detail/"
    />

    <div class="iteration-toolbar">
      <el-form
        ref="queryFormRef"
        :inline="true"
        :model="queryParams"
        class="query-form"
      >
        <el-form-item prop="name">
          <el-input
            v-model="queryParams.name"
            clearable
            placeholder="搜索迭代"
            style="width: 240px"
            @clear="handleQuery"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-popover
            v-model="showFilterPopover"
            placement="bottom-start"
            width="360"
          >
            <el-button
              slot="reference"
              icon="el-icon-plus"
            >高级筛选</el-button>
            <el-form-item
              class="filter-item"
              label="迭代状态"
              prop="status"
            >
              <el-select
                v-model="queryParams.status"
                clearable
                placeholder="全部状态"
                style="width: 100%"
              >
                <el-option
                  label="未开始"
                  :value="PmsIterationStatus.PLANNED"
                />
                <el-option
                  label="进行中"
                  :value="PmsIterationStatus.ACTIVE"
                />
                <el-option
                  label="已完成"
                  :value="PmsIterationStatus.COMPLETED"
                />
              </el-select>
            </el-form-item>
            <div class="filter-actions">
              <el-button @click="resetQuery">清空</el-button>
              <el-button @click="showFilterPopover = false">取消</el-button>
              <el-button
                type="primary"
                @click="handleAdvancedQuery"
              >确认</el-button>
            </div>
          </el-popover>
        </el-form-item>
      </el-form>
      <el-button
        v-if="editable"
        v-hasPermi="['pms:pm:iteration:create']"
        type="primary"
        @click="openForm('create')"
      >
        新建迭代
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="iterationList"
      class="iteration-table"
      @row-click="handleRowClick"
    >
      <el-table-column
        show-overflow-tooltip
        label="引用 ID"
        width="90"
      >
        <template slot-scope="scope">#{{ scope.row.id }}</template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        label="迭代名称"
        min-width="200"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click.stop="openDetail(scope.row)"
          >
            {{ scope.row.name }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        :formatter="dateFormatter"
        label="开始时间"
        prop="startTime"
        width="180"
      />
      <el-table-column
        show-overflow-tooltip
        :formatter="dateFormatter"
        label="结束时间"
        prop="endTime"
        width="180"
      />
      <el-table-column
        show-overflow-tooltip
        align="center"
        label="状态"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag :type="getIterationStatusTagType(scope.row.status)">
            {{ getIterationStatusName(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        align="center"
        label="进度"
        width="160"
      >
        <template slot-scope="scope">
          <el-progress :percentage="scope.row.progress" />
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        label="负责人"
        min-width="110"
        prop="ownerUserName"
      />
      <el-table-column
        show-overflow-tooltip
        v-if="editable"
        align="center"
        fixed="right"
        label="操作"
        width="90"
      >
        <template slot-scope="scope">
          <el-dropdown
            trigger="click"
            @command="handleIterationCommand($event, scope.row)"
          >
            <el-button
              type="text"
              @click.stop
            >更多</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-if="
                  scope.row.status === PmsIterationStatus.PLANNED &&
                    checkPermi(['pms:pm:iteration:update'])
                "
                command="start"
              >
                开始迭代
              </el-dropdown-item>
              <el-dropdown-item
                v-if="
                  scope.row.status === PmsIterationStatus.ACTIVE &&
                    checkPermi(['pms:pm:iteration:update'])
                "
                command="complete"
              >
                完成迭代
              </el-dropdown-item>
              <el-dropdown-item
                v-if="checkPermi(['pms:pm:iteration:update'])"
                command="edit"
              >
                编辑迭代
              </el-dropdown-item>
              <el-dropdown-item
                v-if="checkPermi(['pms:pm:iteration:delete'])"
                command="delete"
                divided
              >
                删除迭代
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :limit.sync="queryParams.pageSize"
      :page.sync="queryParams.pageNo"
      :total="total"
      @pagination="getIterationList"
    />

    <IterationForm
      ref="formRef"
      @success="getIterationList"
    />
    <IterationStartForm
      ref="startFormRef"
      @success="getIterationList"
    />
  </div>
</template>

<script>
import { dateFormatter } from '@/utils/formatTime'
import * as IterationApi from '@/api/pms/pm/iteration'
import { PmsIterationStatus } from '@/views/pms/pm/utils/constants'
import IterationForm from '../components/IterationForm.vue'
import IterationStartForm from '../components/IterationStartForm.vue'
import { getIterationStatusName, getIterationStatusTagType } from '@/views/pms/pm/utils/format'
import { checkPermi } from '@/utils/permission'

export default {
  name: 'PmsIterationList',
  components: { IterationForm, IterationStartForm },
  props: {
    projectId: { type: Number, required: true },
    editable: { type: Boolean, required: true }
  },
  data() {
    return {
      PmsIterationStatus,
      loading: true,
      total: 0,
      iterationList: [],
      showFilterPopover: false,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        projectId: this.projectId,
        name: '',
        status: undefined
      }
    }
  },
  mounted() {
    this.getIterationList()
  },
  methods: {
    checkPermi,
    dateFormatter,
    getIterationStatusName,
    getIterationStatusTagType,
    async getIterationList() {
      this.loading = true
      try {
        const response = await IterationApi.getIterationPage(this.queryParams)
        this.iterationList = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getIterationList()
    },
    handleAdvancedQuery() {
      this.showFilterPopover = false
      this.handleQuery()
    },
    resetQuery() {
      this.$refs.queryFormRef.resetFields()
      this.showFilterPopover = false
      this.handleQuery()
    },
    openDetail(iteration) {
      this.$router.push({ name: 'PmsIterationDetail', params: { id: iteration.id }})
    },
    handleRowClick(iteration) {
      this.openDetail(iteration)
    },
    handleIterationCommand(command, iteration) {
      if (command === 'start') {
        this.openStartForm(iteration)
      } else if (command === 'complete') {
        this.handleComplete(iteration)
      } else if (command === 'edit') {
        this.openForm('update', iteration.id)
      } else if (command === 'delete') {
        this.handleDelete(iteration)
      }
    },
    openForm(type, id) {
      this.$refs.formRef.open(type, this.projectId, id)
    },
    openStartForm(iteration) {
      this.$refs.startFormRef.open(iteration)
    },
    async handleComplete(iteration) {
      try {
        await this.$confirm(`确认完成迭代“${iteration.name}”吗？`, '提示', {
          type: 'warning'
        })
        await IterationApi.completeIteration(iteration.id)
        this.$message.success('迭代已完成')
        await this.getIterationList()
      } catch (error) {
        // 用户取消时保留当前列表。
      }
    },
    async handleDelete(iteration) {
      try {
        await this.$confirm(`确认删除迭代“${iteration.name}”吗？`, '提示', {
          type: 'warning'
        })
        await IterationApi.deleteIteration(iteration.id)
        this.$message.success('删除成功')
        await this.getIterationList()
      } catch (error) {
        // 用户取消时保留当前列表。
      }
    },
    refresh() {
      return this.getIterationList()
    }
  }
}
</script>

<style scoped>
.iteration-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.query-form { margin-bottom: -15px; }
.filter-item { width: 100%; font-weight: 600; }
.filter-actions { display: flex; justify-content: flex-end; }
.iteration-table ::v-deep .el-table__row { cursor: pointer; }
</style>
