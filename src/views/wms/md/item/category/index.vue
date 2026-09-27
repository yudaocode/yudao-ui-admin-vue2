<template>
  <div class="app-container">
    <doc-alert
      title="【基础】商品、SKU、分类、品牌"
      url="https://doc.iocoder.cn/wms/md/item/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      @submit.native.prevent
    >
      <el-form-item
        label="分类编号"
        prop="code"
      ><el-input
        v-model="queryParams.code"
        clearable
        placeholder="请输入分类编号"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="分类名称"
        prop="name"
      ><el-input
        v-model="queryParams.name"
        clearable
        placeholder="请输入分类名称"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="分类状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          clearable
          placeholder="请选择分类状态"
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
          v-hasPermi="['wms:item-category:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          type="danger"
          plain
          icon="el-icon-sort"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="list"
      row-key="id"
      stripe
      :default-expand-all="isExpandAll"
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="分类名称"
        prop="name"
        min-width="220"
      />
      <el-table-column
        label="分类编号"
        prop="code"
        align="center"
        width="180"
      />
      <el-table-column
        label="排序"
        prop="sort"
        align="center"
        width="100"
      />
      <el-table-column
        label="状态"
        prop="status"
        align="center"
        width="110"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.COMMON_STATUS"
        :value="scope.row.status"
      /></template></el-table-column>
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="180"
      ><template #default="scope">{{
        parseTime(scope.row.createTime)
      }}</template></el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="245"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['wms:item-category:create']"
            type="text"
            size="mini"
            @click="openForm('create', undefined, scope.row.id)"
          >新增下级</el-button>
          <el-button
            v-hasPermi="['wms:item-category:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >修改</el-button>
          <el-button
            v-hasPermi="['wms:item-category:delete']"
            type="text"
            size="mini"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <item-category-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { handleTree } from '@/utils/ruoyi'
import { ItemCategoryApi } from '@/api/wms/md/item/category'
import ItemCategoryForm from './ItemCategoryForm.vue'

export default {
  name: 'WmsItemCategory',
  components: { ItemCategoryForm },
  data() {
    return {
      DICT_TYPE,
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      loading: false,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 100,
        code: undefined,
        name: undefined,
        status: undefined
      },
      isExpandAll: true,
      refreshTable: true
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      return ItemCategoryApi.getItemCategoryList(this.queryParams)
        .then((response) => {
          this.list = handleTree(response.data, 'id', 'parentId')
        })
        .finally(() => {
          this.loading = false
        })
    },
    toggleExpandAll() {
      this.refreshTable = false
      this.isExpandAll = !this.isExpandAll
      this.$nextTick(() => {
        this.refreshTable = true
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
    openForm(type, id, parentId) {
      this.$refs.form.open(type, id, parentId)
    },
    handleDelete(row) {
      this.$modal
        .confirm('确认删除分类“' + (row.name || '') + '”吗？')
        .then(() => ItemCategoryApi.deleteItemCategory(row.id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          this.getList()
        })
        .catch(() => {})
    }
  }
}
</script>
