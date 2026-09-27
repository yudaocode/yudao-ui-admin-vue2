<template>
  <div class="app-container oa-discussion-list">
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入讨论标题"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="讨论类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择讨论类型"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="发布人" prop="userId">
        <user-select-v2 v-model="queryParams.userId" placeholder="请选择发布人" style="width: 240px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 讨论列表 -->
    <el-table v-loading="loading" :data="list" border stripe @sort-change="handleSortChange">
      <el-table-column label="标题" prop="title" min-width="220" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button type="text" class="link-button" @click="openDetail(scope.row.id)">
            {{ scope.row.title }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="类型" prop="type" align="center" width="90" sortable="custom">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_DISCUSSION_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="发布人" prop="userName" align="center" width="120" />
      <el-table-column label="浏览" prop="visitCount" align="center" width="80" sortable="custom" />
      <el-table-column label="回复" prop="replyCount" align="center" width="80" />
      <el-table-column label="点赞" prop="likeCount" align="center" width="80" />
      <el-table-column label="附件" align="center" width="80">
        <template slot-scope="scope">{{ (scope.row.fileUrls && scope.row.fileUrls.length) || 0 }}</template>
      </el-table-column>
      <el-table-column
        label="发布时间"
        prop="createTime"
        :formatter="dateFormatter"
        align="center"
        width="180"
        sortable="custom"
      />
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
import * as DiscussionApi from '@/api/oa/discussion'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'

/** 表格排序字段 */
function buildSortingField({ prop, order }) {
  return { field: prop, order: order === 'ascending' ? 'asc' : 'desc' }
}

export default {
  name: 'OaDiscussionList',
  components: { UserSelectV2 },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        title: undefined,
        type: undefined,
        userId: undefined,
        sortingFields: []
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_DISCUSSION_TYPE)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return DiscussionApi.getDiscussionPage(this.queryParams).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    /** 表格排序操作 */
    handleSortChange({ prop, order }) {
      this.queryParams.sortingFields = order ? [buildSortingField({ prop, order })] : []
      return this.handleQuery()
    },
    /** 打开讨论详情 */
    openDetail(id) {
      this.$router.push({ name: 'OaDiscussionDetail', params: { id } })
    }
  }
}
</script>
