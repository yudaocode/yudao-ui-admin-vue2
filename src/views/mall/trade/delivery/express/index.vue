<template>
  <div class="app-container">
    <doc-alert
      title="【交易】快递发货"
      url="https://doc.iocoder.cn/mall/trade-delivery-express/"
    />

    <!-- 搜索工作栏 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="100px"
    >
      <el-form-item
        label="快递公司编号"
        prop="code"
      >
        <el-input
          v-model="queryParams.code"
          placeholder="请输快递公司编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="快递公司名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输快递公司名称"
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
        <el-button
          v-hasPermi="['trade:delivery:express:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['trade:delivery:express:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
    >
      <el-table-column
        label="公司编码"
        prop="code"
      />
      <el-table-column
        label="公司名称"
        prop="name"
      />
      <el-table-column
        label="公司 logo"
        prop="logo"
      >
        <template v-slot="scope">
          <img
            v-if="scope.row.logo"
            :src="scope.row.logo"
            alt="公司logo"
            style="height: 40px"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="排序"
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
            v-hasPermi="['trade:delivery:express:update']"
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['trade:delivery:express:delete']"
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

    <!-- 表单弹窗：添加/修改 -->
    <ExpressForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import * as DeliveryExpressApi from '@/api/mall/trade/delivery/express'
import download from '@/plugins/download'
import { DICT_TYPE } from '@/utils/dict'
import ExpressForm from './ExpressForm.vue'

export default {
  // Vue3 route/cache identity is the canonical single-word name for this page.
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Express',
  components: { ExpressForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      exportLoading: false,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        code: '',
        name: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      return DeliveryExpressApi.getDeliveryExpressPage(this.queryParams)
        .then((response) => {
          const page = response.data
          this.list = page.list
          this.total = page.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    /** 添加/修改操作 */
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    /** 删除按钮操作 */
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除快递公司编号为"' + id + '"的数据项?')
        .then(() => DeliveryExpressApi.deleteDeliveryExpress(id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          return this.getList()
        })
        .catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      return this.$modal.confirm('是否确认导出所有快递公司数据项?')
        .then(() => {
          this.exportLoading = true
          return DeliveryExpressApi.exportDeliveryExpressApi(this.queryParams)
        })
        .then((response) => download.excel(response.data, '快递公司.xls'))
        .catch(() => {})
        .finally(() => {
          this.exportLoading = false
        })
    }
  }
}
</script>
