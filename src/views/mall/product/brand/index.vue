<template>
  <div class="app-container">
    <doc-alert
      title="商城手册（功能开启）"
      url="https://doc.iocoder.cn/mall/build/"
    />

    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="68px"
    >
      <el-form-item
        label="品牌名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入品牌名称"
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
          size="small"
        >
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
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
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
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
          v-hasPermi="['product:brand:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >
          新增
        </el-button>
      </el-col>
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <el-table
      v-loading="loading"
      :data="list"
    >
      <el-table-column
        label="品牌编号"
        align="center"
        prop="id"
      />
      <el-table-column
        label="品牌名称"
        align="center"
        prop="name"
      />
      <el-table-column
        label="品牌图片"
        align="center"
        prop="picUrl"
      >
        <template v-slot="scope">
          <img
            v-if="scope.row.picUrl"
            :src="scope.row.picUrl"
            alt="品牌图片"
            style="height: 100px"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="品牌排序"
        align="center"
        prop="sort"
      />
      <el-table-column
        label="品牌描述"
        align="center"
        prop="description"
      />
      <el-table-column
        label="状态"
        align="center"
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
        class-name="small-padding fixed-width"
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['product:brand:update']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['product:brand:delete']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
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

    <ProductBrandForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { deleteBrand, getBrandParam } from '@/api/mall/product/brand'
import ProductBrandForm from './BrandForm.vue'

export default {
  name: 'ProductBrand',
  components: {
    ProductBrandForm
  },
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
        status: null,
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
      return getBrandParam(this.queryParams).then((response) => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleAdd() {
      this.$refs.form.open('create')
    },
    handleUpdate(row) {
      this.$refs.form.open('update', row.id)
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除品牌编号为"' + row.id + '"的数据项?').then(() => {
        return deleteBrand(row.id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    }
  }
}
</script>
