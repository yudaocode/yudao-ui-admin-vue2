<template>
  <el-dialog
    title="选择商品"
    :visible.sync="dialogVisible"
    width="70%"
    append-to-body
  >
    <el-form
      ref="queryForm"
      :inline="true"
      :model="queryParams"
      label-width="68px"
    >
      <el-form-item
        label="商品名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          class="query-field"
          clearable
          placeholder="请输入商品名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="商品分类"
        prop="categoryId"
      >
        <el-cascader
          v-model="queryParams.categoryId"
          :options="categoryTreeList"
          :props="categoryProps"
          class="query-field"
          clearable
          placeholder="请选择商品分类"
        />
      </el-form-item>
      <el-form-item
        label="创建时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          :default-time="['00:00:00', '23:59:59']"
          class="query-field"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      show-overflow-tooltip
    >
      <el-table-column
        v-if="multiple"
        width="55"
      >
        <template slot="header">
          <el-checkbox
            v-model="isCheckAll"
            :indeterminate="isIndeterminate"
            @change="handleCheckAll"
          />
        </template>
        <template slot-scope="scope">
          <el-checkbox
            v-model="checkedStatus[scope.row.id]"
            @change="checked => handleCheckOne(checked, scope.row, true)"
          />
        </template>
      </el-table-column>
      <el-table-column
        v-else
        label="#"
        width="55"
      >
        <template slot-scope="scope">
          <el-radio
            v-model="selectedSpuId"
            :label="scope.row.id"
            @change="handleSingleSelected(scope.row)"
          >
            &nbsp;
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column
        key="id"
        align="center"
        label="商品编号"
        prop="id"
        min-width="60"
      />
      <el-table-column
        label="商品图"
        min-width="80"
      >
        <template slot-scope="scope">
          <el-image
            :src="scope.row.picUrl"
            class="spu-image"
            :preview-src-list="[scope.row.picUrl]"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="商品名称"
        min-width="200"
        prop="name"
      />
      <el-table-column
        label="商品分类"
        min-width="100"
        prop="categoryId"
      >
        <template slot-scope="scope">
          <span>{{ getCategoryName(scope.row.categoryId) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :limit.sync="queryParams.pageSize"
      :page.sync="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
    <div
      v-if="multiple"
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        @click="handleEmitChange"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as ProductCategoryApi from '@/api/mall/product/category'
import * as ProductSpuApi from '@/api/mall/product/spu'
import { handleTree } from '@/utils/ruoyi'

export default {
  name: 'SpuTableSelect',
  props: {
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      total: 0,
      list: [],
      loading: false,
      dialogVisible: false,
      queryParams: this.defaultQueryParams(),
      isCheckAll: false,
      isIndeterminate: false,
      checkedSpus: [],
      checkedStatus: {},
      selectedSpuId: undefined,
      categoryList: [],
      categoryTreeList: [],
      categoryProps: {
        value: 'id',
        label: 'name',
        children: 'children',
        emitPath: false,
        checkStrictly: true
      }
    }
  },
  async mounted() {
    await this.getList()
    const response = await ProductCategoryApi.getCategoryList({})
    this.categoryList = response.data
    this.categoryTreeList = handleTree(this.categoryList, 'id', 'parentId')
  },
  methods: {
    defaultQueryParams() {
      return {
        pageNo: 1,
        pageSize: 10,
        tabType: 0,
        name: '',
        categoryId: null,
        createTime: []
      }
    },
    open(spuList) {
      this.checkedSpus = []
      this.checkedStatus = {}
      this.isCheckAll = false
      this.isIndeterminate = false
      if (spuList && spuList.length > 0) {
        this.checkedSpus = spuList.slice()
        spuList.forEach(spu => {
          this.$set(this.checkedStatus, spu.id, true)
        })
      }
      this.dialogVisible = true
      return this.resetQuery()
    },
    getList() {
      this.loading = true
      return ProductSpuApi.getSpuPage(this.queryParams)
        .then(response => {
          this.list = response.data.list
          this.total = response.data.total
          this.list.forEach(spu => {
            this.$set(this.checkedStatus, spu.id, this.checkedStatus[spu.id] || false)
          })
          this.calculateIsCheckAll()
          return this.list
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
      this.queryParams = this.defaultQueryParams()
      return this.getList()
    },
    handleSingleSelected(spu) {
      this.$emit('change', spu)
      this.dialogVisible = false
      this.selectedSpuId = spu.id
    },
    handleEmitChange() {
      this.dialogVisible = false
      this.$emit('change', this.checkedSpus.slice())
    },
    handleCheckAll(checked) {
      this.isCheckAll = checked
      this.isIndeterminate = false
      this.list.forEach(spu => this.handleCheckOne(checked, spu, false))
    },
    handleCheckOne(checked, spu, isCalcCheckAll) {
      if (checked) {
        this.checkedSpus.push(spu)
        this.$set(this.checkedStatus, spu.id, true)
      } else {
        const index = this.findCheckedIndex(spu)
        if (index > -1) {
          this.checkedSpus.splice(index, 1)
          this.$set(this.checkedStatus, spu.id, false)
          this.isCheckAll = false
        }
      }
      if (isCalcCheckAll) {
        this.calculateIsCheckAll()
      }
    },
    findCheckedIndex(spu) {
      return this.checkedSpus.findIndex(item => item.id === spu.id)
    },
    calculateIsCheckAll() {
      this.isCheckAll = this.list.every(spu => this.checkedStatus[spu.id])
      this.isIndeterminate =
        !this.isCheckAll && this.list.some(spu => this.checkedStatus[spu.id])
    },
    getCategoryName(categoryId) {
      const category = this.categoryList.find(item => item.id === categoryId)
      return category ? category.name : ''
    }
  }
}
</script>

<style scoped lang="scss">
.query-field {
  width: 240px;
}
.spu-image {
  width: 30px;
  height: 30px;
}
</style>
