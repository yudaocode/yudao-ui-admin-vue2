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
        label="门店手机"
        prop="phone"
      >
        <el-input
          v-model="queryParams.phone"
          placeholder="请输门店手机"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="门店名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输门店名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="门店状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="门店状态"
          clearable
        >
          <el-option
            v-for="dict in statusDictDatas"
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
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
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
        <el-button
          v-hasPermi="['trade:delivery:pick-up-store:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
    >
      <el-table-column
        label="编号"
        prop="id"
        min-width="80"
      />
      <el-table-column
        label="门店 logo"
        prop="logo"
        min-width="100"
      >
        <template v-slot="scope">
          <img
            v-if="scope.row.logo"
            :src="scope.row.logo"
            alt="门店 logo"
            style="height: 50px"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="门店名称"
        prop="name"
        min-width="150"
      />
      <el-table-column
        label="门店手机"
        prop="phone"
        min-width="100"
      />
      <el-table-column
        label="地址"
        prop="detailAddress"
        min-width="100"
      />
      <el-table-column
        label="营业时间"
        min-width="180"
      >
        <template v-slot="scope">
          {{ scope.row.openingTime }} ~ {{ scope.row.closingTime }}
        </template>
      </el-table-column>
      <el-table-column
        label="开启状态"
        align="center"
        prop="status"
        min-width="100"
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
        min-width="180"
        class-name="small-padding fixed-width"
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['trade:delivery:pick-up-store:update']"
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['trade:delivery:pick-up-store:update']"
            type="text"
            size="mini"
            icon="el-icon-user"
            @click="openFormBind(scope.row.id)"
          >绑定店员</el-button>
          <el-button
            v-hasPermi="['trade:delivery:pick-up-store:delete']"
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
    <DeliveryPickUpStoreForm
      ref="form"
      @success="getList"
    />
    <!-- 表单弹窗：绑定店员 -->
    <DeliveryPickUpStoreBindForm ref="formBind" />
  </div>
</template>

<script>
import * as DeliveryPickUpStoreApi from '@/api/mall/trade/delivery/pickUpStore'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import DeliveryPickUpStoreForm from './PickUpStoreForm.vue'
import DeliveryPickUpStoreBindForm from './DeliveryPickUpStoreBindForm.vue'

export default {
  name: 'DeliveryPickUpStore',
  components: { DeliveryPickUpStoreForm, DeliveryPickUpStoreBindForm },
  data() {
    return {
      DICT_TYPE,
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        status: undefined,
        phone: undefined,
        name: undefined,
        createTime: []
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
      return DeliveryPickUpStoreApi.getDeliveryPickUpStorePage(this.queryParams)
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
    /** 绑定店员操作 */
    openFormBind(id) {
      this.$refs.formBind.open(id)
    },
    /** 删除按钮操作 */
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除自提门店编号为"' + id + '"的数据项?')
        .then(() => DeliveryPickUpStoreApi.deleteDeliveryPickUpStore(id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          return this.getList()
        })
        .catch(() => {})
    }
  }
}
</script>
