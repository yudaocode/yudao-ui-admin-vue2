<template>
  <div class="app-container">
    <doc-alert
      title="【商品】商品分类"
      url="https://doc.iocoder.cn/mall/product-category/"
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
          v-hasPermi="['product:category:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="list"
      row-key="id"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column
        label="分类名称"
        prop="name"
      />
      <el-table-column
        label="分类图片"
        align="center"
        prop="picUrl"
      >
        <template v-slot="scope">
          <img
            v-if="scope.row.picUrl"
            :src="scope.row.picUrl"
            alt="分类图片"
            style="height: 100px"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="分类排序"
        align="center"
        prop="sort"
      />
      <el-table-column
        label="开启状态"
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
            v-hasPermi="['product:category:update']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >
            修改
          </el-button>
          <el-button
            v-if="scope.row.parentId > 0"
            v-hasPermi="['product:spu:query']"
            size="mini"
            type="text"
            icon="el-icon-goods"
            @click="handleViewSpu(scope.row.id)"
          >
            查看商品
          </el-button>
          <el-button
            v-hasPermi="['product:category:delete']"
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

    <ProductCategoryForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { deleteCategory, getCategoryList } from '@/api/mall/product/category'
import { DICT_TYPE } from '@/utils/dict'
import { handleTree } from '@/utils/ruoyi'
import ProductCategoryForm from './CategoryForm.vue'

export default {
  name: 'ProductCategory',
  components: {
    ProductCategoryForm
  },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      showSearch: true,
      list: [],
      title: '',
      isExpandAll: false,
      refreshTable: true,
      queryParams: {
        name: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查看商品操作 */
    handleViewSpu(id) {
      this.$router.push({ name: 'ProductSpu', query: { categoryId: id } })
    },
    getList() {
      this.loading = true
      return getCategoryList(this.queryParams).then((response) => {
        const tree = handleTree(response.data, 'id', 'parentId')
        this.list = tree
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    toggleExpandAll() {
      this.refreshTable = false
      this.isExpandAll = !this.isExpandAll
      this.$nextTick(() => {
        this.refreshTable = true
      })
    },
    handleAdd() {
      this.$refs.form.open('create')
    },
    handleUpdate(row) {
      this.$refs.form.open('update', row.id)
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除商品分类编号为"' + row.id + '"的数据项?').then(() => {
        return deleteCategory(row.id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    }
  }
}
</script>
