<template>
  <div class="app-container">
    <doc-alert
      title="【营销】秒杀活动"
      url="https://doc.iocoder.cn/mall/promotion-seckill/"
    />

    <el-form
      ref="queryForm"
      :inline="true"
      :model="queryParams"
      label-width="68px"
    >
      <el-form-item
        label="活动名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入活动名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="活动状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          clearable
          placeholder="请选择活动状态"
        >
          <el-option
            v-for="dict in statusDictDatas"
            :key="parseInt(dict.value)"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
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
        <el-button
          v-hasPermi="['promotion:seckill-activity:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      stripe
    >
      <el-table-column
        label="活动编号"
        prop="id"
        min-width="80"
        show-overflow-tooltip
      />
      <el-table-column
        label="活动名称"
        prop="name"
        min-width="140"
        show-overflow-tooltip
      />
      <el-table-column
        label="秒杀时段"
        prop="configIds"
        width="220"
        :show-overflow-tooltip="false"
      >
        <template v-slot="scope">
          <el-tag
            v-for="(configId, index) in scope.row.configIds"
            :key="index"
            class="config-tag"
          >{{ formatConfigNames(configId) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="活动时间"
        min-width="210"
        show-overflow-tooltip
      >
        <template v-slot="scope">
          {{ formatDate(scope.row.startTime) }} ~ {{ formatDate(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="商品图片"
        prop="spuName"
        min-width="80"
        show-overflow-tooltip
      >
        <template v-slot="scope">
          <el-image
            :src="scope.row.picUrl"
            :preview-src-list="scope.row.picUrl ? [scope.row.picUrl] : []"
            class="product-image"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="商品标题"
        prop="spuName"
        min-width="300"
        show-overflow-tooltip
      />
      <el-table-column
        label="原价"
        prop="marketPrice"
        min-width="100"
        :formatter="fenToYuanFormat"
        show-overflow-tooltip
      />
      <el-table-column
        label="原价"
        prop="marketPrice"
        min-width="100"
        show-overflow-tooltip
      />
      <el-table-column
        label="秒杀价"
        prop="seckillPrice"
        min-width="100"
        show-overflow-tooltip
      >
        <template v-slot="scope">{{ formatSeckillPrice(scope.row.products) }}</template>
      </el-table-column>
      <el-table-column
        label="活动状态"
        align="center"
        prop="status"
        min-width="100"
        show-overflow-tooltip
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.COMMON_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="库存"
        align="center"
        prop="stock"
        min-width="80"
        show-overflow-tooltip
      />
      <el-table-column
        label="总库存"
        align="center"
        prop="totalStock"
        min-width="80"
        show-overflow-tooltip
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
        show-overflow-tooltip
      >
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['promotion:seckill-activity:update']"
            type="text"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-if="scope.row.status === 0"
            v-hasPermi="['promotion:seckill-activity:close']"
            type="text"
            class="danger-text"
            @click="handleClose(scope.row.id)"
          >关闭</el-button>
          <el-button
            v-else
            v-hasPermi="['promotion:seckill-activity:delete']"
            type="text"
            class="danger-text"
            @click="handleDelete(scope.row.id)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :limit.sync="queryParams.pageSize"
      :page.sync="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />

    <SeckillActivityForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import * as SeckillActivityApi from '@/api/mall/promotion/seckill/seckillActivity'
import { SeckillConfigApi } from '@/api/mall/promotion/seckill/seckillConfig'
import SeckillActivityForm from './SeckillActivityForm.vue'

export default {
  name: 'SeckillActivity',
  components: { SeckillActivityForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      configList: [],
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        status: null
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      return this.getList().then(() => SeckillConfigApi.getSimpleSeckillConfigList()).then(response => {
        this.configList = response.data
      })
    },
    getList() {
      this.loading = true
      return SeckillActivityApi.getSeckillActivityPage(this.queryParams).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    openForm(type, id) {
      return this.$refs.form.open(type, id)
    },
    handleClose(id) {
      return this.$modal.confirm('确认关闭该秒杀活动吗？').then(() => {
        return SeckillActivityApi.closeSeckillActivity(id)
      }).then(() => {
        this.$modal.msgSuccess('关闭成功')
        return this.getList()
      }).catch(() => {})
    },
    handleDelete(id) {
      return this.$modal.confirm('是否删除所选中数据？').then(() => {
        return SeckillActivityApi.deleteSeckillActivity(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    },
    formatConfigNames(configId) {
      const config = this.configList.find(item => item.id === configId)
      return config ? config.name + '[' + config.startTime + ' ~ ' + config.endTime + ']' : ''
    },
    formatSeckillPrice(products) {
      const seckillPrice = Math.min(...products.map(item => item.seckillPrice))
      return '￥' + this.fenToYuan(seckillPrice)
    },
    fenToYuan(value) {
      return (Number(value) / 100).toFixed(2)
    },
    fenToYuanFormat(row, column, cellValue) {
      return this.fenToYuan(cellValue)
    },
    formatDate(value) {
      return parseTime(value, '{y}-{m}-{d}')
    },
    parseTime
  }
}
</script>

<style scoped>
.config-tag { margin-right: 5px; }
.product-image { width: 40px; height: 40px; }
.danger-text { color: #f56c6c; }
</style>
