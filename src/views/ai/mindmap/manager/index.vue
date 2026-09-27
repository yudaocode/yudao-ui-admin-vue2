<template>
  <div class="app-container ai-mindmap-manager">
    <doc-alert title="AI 思维导图" url="https://doc.iocoder.cn/ai/mindmap/" />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="用户编号" prop="userId">
        <el-select v-model="queryParams.userId" clearable filterable placeholder="请输入用户编号">
          <el-option
            v-for="item in userList"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="提示词" prop="prompt">
        <el-input
          v-model="queryParams.prompt"
          clearable
          placeholder="请输入提示词"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" width="180" fixed="left" />
      <el-table-column label="用户" align="center" prop="userId" width="180">
        <template v-slot="scope">{{ userNames[scope.row.userId] || scope.row.userId }}</template>
      </el-table-column>
      <el-table-column label="提示词" align="center" prop="prompt" width="180" />
      <el-table-column label="思维导图" align="center" prop="generatedContent" min-width="300" />
      <el-table-column label="模型" align="center" prop="model" width="180" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="错误信息" align="center" prop="errorMessage" />
      <el-table-column label="操作" align="center" width="120" fixed="right">
        <template v-slot="scope">
          <el-button type="text" size="mini" @click="openPreview(scope.row)">预览</el-button>
          <el-button
            type="text"
            size="mini"
            v-hasPermi="['ai:mind-map:delete']"
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

    <el-drawer
      :visible.sync="previewVisible"
      :with-header="false"
      size="800px"
      append-to-body
      @closed="previewVisible2 = false"
    >
      <Right
        v-if="previewVisible2"
        :generated-content="previewContent"
        :is-end="true"
        :is-generating="false"
        :is-start="false"
      />
    </el-drawer>
  </div>
</template>

<script>
import { AiMindMapApi } from '@/api/ai/mindmap'
import { getSimpleUserList } from '@/api/system/user'
import Right from '@/views/ai/mindmap/index/components/Right.vue'

export default {
  name: 'AiMindMapManager',
  components: { Right },
  data() {
    return {
      loading: true,
      list: [],
      total: 0,
      userList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: undefined,
        prompt: undefined,
        createTime: []
      },
      previewVisible: false,
      previewVisible2: false,
      previewContent: ''
    }
  },
  computed: {
    userNames() {
      return this.userList.reduce((result, user) => {
        result[user.id] = user.nickname
        return result
      }, {})
    }
  },
  created() {
    this.getList()
    this.loadUsers()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const response = await AiMindMapApi.getMindMapPage(this.queryParams)
        const data = response.data
        this.list = data.list
        this.total = data.total
      } finally {
        this.loading = false
      }
    },
    async loadUsers() {
      const response = await getSimpleUserList()
      this.userList = response.data
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('确认删除该思维导图记录吗？')
        await AiMindMapApi.deleteMindMap(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消删除时不提示错误
      }
    },
    async openPreview(row) {
      this.previewVisible2 = false
      this.previewVisible = true
      await this.$nextTick()
      this.previewVisible2 = true
      this.previewContent = row.generatedContent || ''
    }
  }
}
</script>

<style scoped>
.ai-mindmap-manager .el-input,
.ai-mindmap-manager .el-select {
  width: 240px;
}

::v-deep .el-drawer__body {
  height: 100%;
}
</style>
