<template>
  <div class="app-container">
    <doc-alert
      title="【商品】商品属性"
      url="https://doc.iocoder.cn/mall/product-property/"
    />

    <!-- 搜索工作栏 -->
    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="68px"
    >
      <el-form-item
        label="属性项"
        prop="propertyId"
      >
        <el-select
          v-model="queryParams.propertyId"
          disabled
          style="width: 240px"
        >
          <el-option
            v-for="item in propertyOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入名称"
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

    <!-- 操作工具栏 -->
    <el-row
      :gutter="10"
      class="mb8"
    >
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['product:property:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="openForm('create')"
        >新增</el-button>
      </el-col>
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
    >
      <el-table-column
        label="编号"
        align="center"
        prop="id"
        min-width="60"
      />
      <el-table-column
        label="属性值名称"
        align="center"
        prop="name"
        min-width="150"
      />
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
        show-overflow-tooltip
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
        class-name="small-padding fixed-width"
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['product:property:update']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['product:property:delete']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
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

    <ValueForm
      ref="valueForm"
      @success="getList"
    />
  </div>
</template>

<script>
import {
  deletePropertyValue,
  getProperty,
  getPropertyValuePage
} from '@/api/mall/product/property'
import ValueForm from './value/ValueForm.vue'

export default {
  name: 'ProductPropertyValue',
  components: { ValueForm },
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      propertyOptions: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        propertyId: Number(this.$route.params.propertyId),
        name: undefined
      }
    }
  },
  created() {
    this.loadProperty()
    this.getList()
  },
  methods: {
    loadProperty() {
      return getProperty(this.queryParams.propertyId).then(response => {
        this.propertyOptions = [response.data]
      })
    },
    /** 查询列表 */
    getList() {
      this.loading = true
      return getPropertyValuePage(this.queryParams).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      const propertyId = this.queryParams.propertyId
      this.resetForm('queryForm')
      this.queryParams.propertyId = propertyId
      this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.valueForm.open(type, this.queryParams.propertyId, id)
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除名称为"' + row.name + '"的数据项?').then(() => {
        return deletePropertyValue(row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    }
  }
}
</script>
