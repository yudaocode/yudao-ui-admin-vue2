<template>
  <div class="app-container">
    <doc-alert
      title="【营销】内容管理"
      url="https://doc.iocoder.cn/mall/promotion-content/"
    />

    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
    >
      <el-form-item
        label="分类名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入分类名称"
          clearable
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
        >
          <el-option
            v-for="dict in statusDictDatas"
            :key="parseInt(dict.value)"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="创建时间"
        prop="createTime"
      >
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
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <el-row
      :gutter="10"
      class="mb8"
    >
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['promotion:article-category:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <el-table
      v-loading="loading"
      :data="list"
      stripe
    >
      <el-table-column
        label="编号"
        align="center"
        prop="id"
        min-width="100"
      />
      <el-table-column
        label="分类名称"
        align="center"
        prop="name"
        min-width="220"
      />
      <el-table-column
        label="分类图标"
        align="center"
        min-width="90"
      >
        <template v-slot="scope">
          <el-image
            v-if="scope.row.picUrl"
            :src="scope.row.picUrl"
            :preview-src-list="[scope.row.picUrl]"
            fit="cover"
            style="width: 36px; height: 36px"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        min-width="120"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.COMMON_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="排序"
        align="center"
        prop="sort"
        min-width="100"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="160"
        class-name="small-padding fixed-width"
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['promotion:article-category:update']"
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['promotion:article-category:delete']"
            type="text"
            size="mini"
            icon="el-icon-delete"
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

    <ArticleCategoryForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import {
  deleteArticleCategory,
  getArticleCategoryPage
} from '@/api/mall/promotion/articleCategory'
import ArticleCategoryForm from './ArticleCategoryForm.vue'

export default {
  name: 'PromotionArticleCategory',
  components: { ArticleCategoryForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        status: undefined,
        createTime: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      return getArticleCategoryPage(this.queryParams)
        .then(response => {
          const data = response.data
          this.list = data.list
          this.total = data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    handleAdd() {
      this.$refs.form.open('create')
    },
    handleUpdate(id) {
      this.$refs.form.open('update', id)
    },
    handleDelete(id) {
      this.$modal
        .confirm('是否确认删除文章分类编号为"' + id + '"的数据项?')
        .then(() => deleteArticleCategory(id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          this.getList()
        })
        .catch(() => {})
    }
  }
}
</script>
