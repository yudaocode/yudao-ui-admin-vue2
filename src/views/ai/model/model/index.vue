<template>
  <div class="app-container">
    <doc-alert
      title="AI 手册"
      url="https://doc.iocoder.cn/ai/build/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      @submit.native.prevent
    >
      <el-form-item
        label="模型名字"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入模型名字"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="模型标识"
        prop="model"
      >
        <el-input
          v-model="queryParams.model"
          clearable
          placeholder="请输入模型标识"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="模型平台"
        prop="platform"
      >
        <el-input
          v-model="queryParams.platform"
          clearable
          placeholder="请输入模型平台"
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['ai:model:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="所属平台"
        prop="platform"
        align="center"
        min-width="100"
      >
        <template #default="scope"><dict-tag
          :type="DICT_TYPE.AI_PLATFORM"
          :value="scope.row.platform"
        /></template>
      </el-table-column>
      <el-table-column
        label="模型类型"
        prop="type"
        align="center"
        min-width="100"
      >
        <template #default="scope"><dict-tag
          :type="DICT_TYPE.AI_MODEL_TYPE"
          :value="scope.row.type"
        /></template>
      </el-table-column>
      <el-table-column
        label="模型名字"
        prop="name"
        align="center"
        min-width="180"
      />
      <el-table-column
        label="模型标识"
        prop="model"
        align="center"
        min-width="180"
      />
      <el-table-column
        label="API 秘钥"
        prop="keyId"
        align="center"
        min-width="140"
      >
        <template #default="scope">{{ findApiKey(scope.row.keyId) }}</template>
      </el-table-column>
      <el-table-column
        label="排序"
        prop="sort"
        align="center"
        min-width="80"
      />
      <el-table-column
        label="状态"
        prop="status"
        align="center"
        min-width="80"
      >
        <template #default="scope"><dict-tag
          :type="DICT_TYPE.COMMON_STATUS"
          :value="scope.row.status"
        /></template>
      </el-table-column>
      <el-table-column
        label="温度参数"
        prop="temperature"
        align="center"
        min-width="80"
      />
      <el-table-column
        label="回复数 Token 数"
        prop="maxTokens"
        align="center"
        min-width="140"
      />
      <el-table-column
        label="上下文数量"
        prop="maxContexts"
        align="center"
        min-width="100"
      />
      <el-table-column
        label="操作"
        align="center"
        width="180"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['ai:model:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['ai:model:delete']"
            type="text"
            size="mini"
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
    <model-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { ModelApi } from '@/api/ai/model/model'
import { ApiKeyApi } from '@/api/ai/model/apiKey'
import { DICT_TYPE } from '@/utils/dict'
import ModelForm from './ModelForm.vue'

export default {
  name: 'AiModel',
  components: { ModelForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      list: [],
      total: 0,
      apiKeyList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        model: undefined,
        platform: undefined
      }
    }
  },
  async created() {
    await this.getList()
    await this.loadApiKeys()
  },
  methods: {
    getList() {
      this.loading = true
      return ModelApi.getModelPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    loadApiKeys() {
      return ApiKeyApi.getApiKeySimpleList().then(response => {
        this.apiKeyList = response.data
      })
    },
    findApiKey(id) {
      const item = this.apiKeyList.find(row => row.id === id)
      return item && item.name
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    handleDelete(id) {
      this.$modal.confirm('是否删除所选中数据？').then(() => ModelApi.deleteModel(id)).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    }
  }
}
</script>
