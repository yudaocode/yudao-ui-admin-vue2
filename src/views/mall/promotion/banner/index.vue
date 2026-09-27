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
      label-width="90px"
    >
      <el-form-item
        label="Banner 标题"
        prop="title"
      >
        <el-input
          v-model="queryParams.title"
          placeholder="请输入 Banner 标题"
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
          placeholder="全部"
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
          v-hasPermi="['promotion:banner:create']"
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
        label="Banner 标题"
        align="center"
        min-width="180"
        prop="title"
        show-overflow-tooltip
      />
      <el-table-column
        label="图片"
        align="center"
        width="90"
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
        width="90"
        prop="status"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.COMMON_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="位置"
        align="center"
        width="120"
        prop="position"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.PROMOTION_BANNER_POSITION"
            :value="scope.row.position"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="跳转地址"
        align="center"
        min-width="220"
        prop="url"
        show-overflow-tooltip
      />
      <el-table-column
        label="创建时间"
        align="center"
        width="180"
        prop="createTime"
      >
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="排序"
        align="center"
        width="70"
        prop="sort"
      />
      <el-table-column
        label="描述"
        align="center"
        min-width="180"
        prop="memo"
        show-overflow-tooltip
      />
      <el-table-column
        label="操作"
        align="center"
        width="150"
        class-name="small-padding fixed-width"
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['promotion:banner:update']"
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['promotion:banner:delete']"
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

    <BannerForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { deleteBanner, getBannerPage } from '@/api/mall/promotion/banner'
import BannerForm from './BannerForm.vue'

export default {
  name: 'PromotionBanner',
  components: { BannerForm },
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
        title: undefined,
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
      return getBannerPage(this.queryParams)
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
        .confirm('是否确认删除 Banner 编号为"' + id + '"的数据项?')
        .then(() => deleteBanner(id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          this.getList()
        })
        .catch(() => {})
    }
  }
}
</script>
