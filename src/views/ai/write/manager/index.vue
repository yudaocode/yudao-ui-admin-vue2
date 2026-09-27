<template>
  <div class="app-container ai-write-manager">
    <doc-alert title="AI 写作助手" url="https://doc.iocoder.cn/ai/write/" />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="用户编号" prop="userId">
        <el-select v-model="queryParams.userId" clearable placeholder="请输入用户编号">
          <el-option
            v-for="item in userList"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="写作类型" prop="type">
        <el-select v-model="queryParams.type" clearable placeholder="请选择写作类型">
          <el-option
            v-for="item in typeDictDatas"
            :key="item.value"
            :label="item.label"
            :value="Number(item.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="平台" prop="platform">
        <el-select v-model="queryParams.platform" clearable placeholder="请选择平台">
          <el-option
            v-for="item in platformDictDatas"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="编号" prop="id" align="center" width="120" fixed="left" show-overflow-tooltip />
      <el-table-column label="用户" prop="userId" align="center" width="180" show-overflow-tooltip>
        <template v-slot="scope">{{ userNames[scope.row.userId] }}</template>
      </el-table-column>
      <el-table-column label="写作类型" prop="type" align="center" show-overflow-tooltip>
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.AI_WRITE_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="平台" prop="platform" align="center" width="120" show-overflow-tooltip>
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.AI_PLATFORM" :value="scope.row.platform" />
        </template>
      </el-table-column>
      <el-table-column label="模型" prop="model" align="center" width="180" show-overflow-tooltip />
      <el-table-column label="生成内容提示" prop="prompt" align="center" width="180" show-overflow-tooltip />
      <el-table-column label="生成的内容" prop="generatedContent" align="center" width="180" show-overflow-tooltip />
      <el-table-column label="原文" prop="originalContent" align="center" width="180" show-overflow-tooltip />
      <el-table-column label="长度" prop="length" align="center" show-overflow-tooltip>
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.AI_WRITE_LENGTH" :value="scope.row.length" />
        </template>
      </el-table-column>
      <el-table-column label="格式" prop="format" align="center" show-overflow-tooltip>
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.AI_WRITE_FORMAT" :value="scope.row.format" />
        </template>
      </el-table-column>
      <el-table-column label="语气" prop="tone" align="center" show-overflow-tooltip>
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.AI_WRITE_TONE" :value="scope.row.tone" />
        </template>
      </el-table-column>
      <el-table-column label="语言" prop="language" align="center" show-overflow-tooltip>
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.AI_WRITE_LANGUAGE" :value="scope.row.language" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" align="center" width="180" show-overflow-tooltip>
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="错误信息" prop="errorMessage" align="center" show-overflow-tooltip />
      <el-table-column label="操作" align="center">
        <template v-slot="scope">
          <el-button
            type="text"
            size="mini"
            v-hasPermi="['ai:write:delete']"
            class="ai-write-manager__delete"
            @click="handleDelete(scope.row.id)"
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
  </div>
</template>

<script>
import { WriteApi } from '@/api/ai/write/index'
import { getSimpleUserList } from '@/api/system/user'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'

export default {
  name: 'AiWriteManager',
  data() {
    return {
      DICT_TYPE,
      loading: true,
      list: [],
      total: 0,
      userList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: undefined,
        type: undefined,
        platform: undefined,
        createTime: undefined
      }
    }
  },
  computed: {
    typeDictDatas() {
      return getDictDatas(DICT_TYPE.AI_WRITE_TYPE)
    },
    platformDictDatas() {
      return getDictDatas(DICT_TYPE.AI_PLATFORM)
    },
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
        const response = await WriteApi.getWritePage(this.queryParams)
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
        await this.$modal.confirm('是否删除所选中数据？')
        await WriteApi.deleteWrite(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消删除时不提示错误
      }
    }
  }
}
</script>

<style scoped>
.ai-write-manager .el-input,
.ai-write-manager .el-select {
  width: 240px;
}

.ai-write-manager__delete {
  color: #f56c6c;
}

.ai-write-manager__delete:hover,
.ai-write-manager__delete:focus {
  color: #f78989;
}
</style>
