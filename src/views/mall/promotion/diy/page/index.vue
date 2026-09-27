<template>
  <div class="app-container">
    <doc-alert
      title="【营销】商城装修"
      url="https://doc.iocoder.cn/mall/diy/"
    />

    <!-- 搜索工作栏 -->
    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
    >
      <el-form-item
        label="页面名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入页面名称"
          clearable
          class="query-control"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="创建时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          class="query-control"
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
          v-hasPermi="['promotion:diy-page:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >
          新增
        </el-button>
      </el-form-item>
    </el-form>

    <el-row
      :gutter="10"
      class="mb8"
    >
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <!-- 页面列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      stripe
    >
      <el-table-column
        label="编号"
        align="center"
        prop="id"
        min-width="80"
      />
      <el-table-column
        label="预览图"
        align="center"
        prop="previewPicUrls"
        min-width="160"
      >
        <template v-slot="scope">
          <div class="preview-list">
            <el-image
              v-for="(url, index) in scope.row.previewPicUrls"
              :key="url + '-' + index"
              :src="url"
              :preview-src-list="getPreviewUrlsAt(scope.row.previewPicUrls, index)"
              fit="cover"
              class="preview-image"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="页面名称"
        align="center"
        prop="name"
        min-width="140"
        show-overflow-tooltip
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
      >
        <template v-slot="scope">{{ parseTime(scope.row.createTime) || '-' }}</template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        width="190"
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['promotion:diy-page:update']"
            type="text"
            size="mini"
            icon="el-icon-brush"
            @click="handleDecorate(scope.row.id)"
          >
            装修
          </el-button>
          <el-button
            v-hasPermi="['promotion:diy-page:update']"
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['promotion:diy-page:delete']"
            type="text"
            size="mini"
            class="danger-button"
            icon="el-icon-delete"
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

    <DiyPageForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import * as DiyPageApi from '@/api/mall/promotion/diy/page'
import { parseTime } from '@/utils/ruoyi'
import DiyPageForm from './DiyPageForm.vue'

export default {
  name: 'DiyPage',
  components: { DiyPageForm },
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
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
      return DiyPageApi.getDiyPagePage(this.queryParams)
        .then((response) => {
          this.list = response.data.list
          this.total = response.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    openForm(type, id) {
      return this.$refs.form.open(type, id)
    },
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除该装修页面？')
        .then(() => DiyPageApi.deleteDiyPage(id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          return this.getList()
        })
        .catch(() => false)
    },
    handleDecorate(id) {
      return this.$router.push({ name: 'DiyPageDecorate', params: { id }})
    },
    getPreviewUrlsAt(value, index) {
      return value.slice(index).concat(value.slice(0, index))
    },
    parseTime
  }
}
</script>

<style lang="scss" scoped>
.query-control {
  width: 240px;
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
}

.preview-image {
  width: 40px;
  height: 40px;
}

.danger-button {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .query-control {
    width: 100%;
  }

  .preview-image {
    width: 32px;
    height: 32px;
  }
}
</style>
