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
        label="模板名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入模板名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="计费方式"
        prop="chargeMode"
      >
        <el-select
          v-model="queryParams.chargeMode"
          placeholder="计费方式"
          clearable
        >
          <el-option
            v-for="dict in chargeModeDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="parseInt(dict.value)"
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
          v-hasPermi="['trade:delivery:express-template:create']"
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
        min-width="60"
        prop="id"
      />
      <el-table-column
        label="模板名称"
        min-width="100"
        prop="name"
      />
      <el-table-column
        label="计费方式"
        prop="chargeMode"
        min-width="100"
        align="center"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.EXPRESS_CHARGE_MODE"
            :value="scope.row.chargeMode"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="排序"
        min-width="100"
        prop="sort"
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
            v-hasPermi="['trade:delivery:express-template:update']"
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['trade:delivery:express-template:delete']"
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
    <ExpressTemplateForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import * as DeliveryExpressTemplateApi from '@/api/mall/trade/delivery/expressTemplate'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import ExpressTemplateForm from './ExpressTemplateForm.vue'

const EXPRESS_CHARGE_MODE_DICT_TYPE = 'trade_delivery_express_charge_mode'

export default {
  name: 'DeliveryExpressTemplate',
  components: { ExpressTemplateForm },
  data() {
    return {
      DICT_TYPE: Object.assign({}, DICT_TYPE, {
        EXPRESS_CHARGE_MODE: EXPRESS_CHARGE_MODE_DICT_TYPE
      }),
      chargeModeDictDatas: getDictDatas(EXPRESS_CHARGE_MODE_DICT_TYPE),
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: '',
        chargeMode: undefined
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
      return DeliveryExpressTemplateApi.getDeliveryExpressTemplatePage(this.queryParams)
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
      return this.$modal.confirm('是否确认删除快递运费模板编号为"' + id + '"的数据项?')
        .then(() => DeliveryExpressTemplateApi.deleteDeliveryExpressTemplate(id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          return this.getList()
        })
        .catch(() => {})
    }
  }
}
</script>
