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
        label="名称"
        prop="name"
      ><el-input
        v-model="queryParams.name"
        clearable
        placeholder="请输入名称"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="平台"
        prop="platform"
      >
        <el-select
          v-model="queryParams.platform"
          clearable
          placeholder="请输入平台"
        >
          <el-option
            v-for="item in platformDictDatas"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          clearable
          placeholder="请选择状态"
        >
          <el-option
            v-for="item in statusDictDatas"
            :key="item.value"
            :label="item.label"
            :value="Number(item.value)"
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
          v-hasPermi="['ai:api-key:create']"
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
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.AI_PLATFORM"
        :value="scope.row.platform"
      /></template></el-table-column>
      <el-table-column
        label="名称"
        prop="name"
        align="center"
      />
      <el-table-column
        label="密钥"
        prop="apiKey"
        align="center"
      />
      <el-table-column
        label="自定义 API URL"
        prop="url"
        align="center"
      />
      <el-table-column
        label="状态"
        prop="status"
        align="center"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.COMMON_STATUS"
        :value="scope.row.status"
      /></template></el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="150"
      ><template #default="scope">
        <el-button
          v-hasPermi="['ai:api-key:update']"
          type="text"
          size="mini"
          @click="openForm('update', scope.row.id)"
        >编辑</el-button>
        <el-button
          v-hasPermi="['ai:api-key:delete']"
          type="text"
          size="mini"
          @click="handleDelete(scope.row.id)"
        >删除</el-button>
      </template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <api-key-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { ApiKeyApi } from '@/api/ai/model/apiKey'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import ApiKeyForm from './ApiKeyForm.vue'

export default {
  name: 'AiApiKey',
  components: { ApiKeyForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      list: [],
      total: 0,
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      platformDictDatas: getDictDatas(DICT_TYPE.AI_PLATFORM),
      queryParams: { pageNo: 1, pageSize: 10, name: undefined, platform: undefined, status: undefined }
    }
  },
  created() { this.getList() },
  methods: {
    getList() {
      this.loading = true
      return ApiKeyApi.getApiKeyPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => { this.loading = false })
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() },
    openForm(type, id) { this.$refs.form.open(type, id) },
    handleDelete(id) {
      this.$modal.confirm('是否删除所选中数据？').then(() => ApiKeyApi.deleteApiKey(id)).then(() => {
        this.$modal.msgSuccess('删除成功'); this.getList()
      }).catch(() => {})
    }
  }
}
</script>
