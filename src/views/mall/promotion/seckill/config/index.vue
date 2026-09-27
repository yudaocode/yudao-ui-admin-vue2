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
      label-width="108px"
    >
      <el-form-item
        label="秒杀时段名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入秒杀时段名称"
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
          v-hasPermi="['promotion:seckill-config:create']"
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
        label="秒杀时段名称"
        align="center"
        prop="name"
        show-overflow-tooltip
      />
      <el-table-column
        label="开始时间点"
        align="center"
        prop="startTime"
        show-overflow-tooltip
      />
      <el-table-column
        label="结束时间点"
        align="center"
        prop="endTime"
        show-overflow-tooltip
      />
      <el-table-column
        label="秒杀轮播图"
        align="center"
        prop="sliderPicUrls"
        show-overflow-tooltip
      >
        <template v-slot="scope">
          <el-image
            v-for="(url, index) in scope.row.sliderPicUrls"
            :key="index"
            :src="url"
            :preview-src-list="scope.row.sliderPicUrls"
            class="slider-image"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="活动状态"
        align="center"
        prop="status"
        show-overflow-tooltip
      >
        <template v-slot="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="CommonStatusEnum.ENABLE"
            :inactive-value="CommonStatusEnum.DISABLE"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
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
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['promotion:seckill-config:update']"
            type="text"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['promotion:seckill-config:delete']"
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

    <SeckillConfigForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { parseTime } from '@/utils/ruoyi'
import { SeckillConfigApi } from '@/api/mall/promotion/seckill/seckillConfig'
import SeckillConfigForm from './SeckillConfigForm.vue'

export default {
  name: 'SeckillConfig',
  components: { SeckillConfigForm },
  data() {
    return {
      CommonStatusEnum,
      loading: true,
      list: [],
      total: 0,
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      return SeckillConfigApi.getSeckillConfigPage(this.queryParams).then(response => {
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
    handleDelete(id) {
      return this.$modal.confirm('是否删除所选中数据？').then(() => {
        return SeckillConfigApi.deleteSeckillConfig(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    },
    handleStatusChange(row) {
      const text = row.status === CommonStatusEnum.ENABLE ? '启用' : '停用'
      return this.$modal.confirm('确认要' + text + '"' + row.name + '"活动吗?').then(() => {
        return SeckillConfigApi.updateSeckillConfigStatus(row.id, row.status)
      }).then(() => {
        return this.getList()
      }).catch(() => {
        row.status = row.status === CommonStatusEnum.ENABLE
          ? CommonStatusEnum.DISABLE
          : CommonStatusEnum.ENABLE
      })
    },
    parseTime
  }
}
</script>

<style scoped>
.slider-image { max-width: 40px; height: 40px; }
.danger-text { color: #f56c6c; }
</style>
