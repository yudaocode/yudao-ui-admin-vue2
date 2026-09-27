<template>
  <div class="app-container">
    <doc-alert title="会员等级、积分、签到" url="https://doc.iocoder.cn/member/level/" />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      v-show="showSearch"
    >
      <el-form-item label="用户" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入用户昵称"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="业务类型" prop="bizType">
        <el-select
          v-model="queryParams.bizType"
          placeholder="请选择业务类型"
          clearable
          style="width: 220px"
        >
          <el-option
            v-for="dict in bizTypeDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="积分标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入积分标题"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="获得时间" prop="createDate">
        <el-date-picker
          v-model="queryParams.createDate"
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
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" width="180" />
      <el-table-column label="获得时间" align="center" prop="createTime" width="180" :formatter="dateFormatter" />
      <el-table-column label="用户" align="center" prop="nickname" width="200" />
      <el-table-column label="获得积分" align="center" prop="point" width="100">
        <template v-slot="scope">
          <el-tag v-if="scope.row.point > 0" size="mini" type="success">+{{ scope.row.point }}</el-tag>
          <el-tag v-else size="mini" type="danger">{{ scope.row.point }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="总积分" align="center" prop="totalPoint" width="100" />
      <el-table-column label="标题" align="center" prop="title" />
      <el-table-column label="描述" align="center" prop="description" />
      <el-table-column label="业务编码" align="center" prop="bizId" />
      <el-table-column label="业务类型" align="center" prop="bizType" width="120">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.MEMBER_POINT_BIZ_TYPE" :value="scope.row.bizType" />
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
  </div>
</template>

<script>
import { getRecordPage } from '@/api/member/point/record'
import { dateFormatter } from '@/utils'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'

export default {
  name: 'PointRecord',
  data() {
    return {
      DICT_TYPE,
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      bizTypeDictDatas: getIntDictOptions(DICT_TYPE.MEMBER_POINT_BIZ_TYPE),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: undefined,
        nickname: null,
        bizType: null,
        title: null,
        createDate: []
      }
    }
  },
  created() {
    const userId = this.$route && this.$route.query && this.$route.query.userId
    if (userId !== undefined && userId !== null && userId !== '') {
      this.queryParams.userId = Number(userId)
    }
    this.getList()
  },
  methods: {
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const response = await getRecordPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    }
  }
}
</script>
