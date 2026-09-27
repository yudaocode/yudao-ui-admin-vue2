<template>
  <div class="app-container">
    <doc-alert title="三方登录" url="https://doc.iocoder.cn/social-user/" />

    <!-- 搜索工作栏 -->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px"
             v-show="showSearch" @submit.native.prevent>
      <el-form-item label="社交平台" prop="type">
        <el-select v-model="queryParams.type" clearable placeholder="请选择社交平台">
          <el-option v-for="item in getDictDatas(DICT_TYPE.SYSTEM_SOCIAL_TYPE)" :key="item.value"
                     :label="item.label" :value="toNumber(item.value)" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户昵称" prop="nickname">
        <el-input v-model="queryParams.nickname" clearable placeholder="请输入用户昵称"
                  @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="社交 openid" prop="openid">
        <el-input v-model="queryParams.openid" clearable placeholder="请输入社交 openid"
                  @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" type="daterange" value-format="yyyy-MM-dd HH:mm:ss"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                        :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="list" stripe border>
      <el-table-column label="社交平台" align="center" prop="type" width="130">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_SOCIAL_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="社交 openid" align="center" prop="openid" min-width="220" show-overflow-tooltip />
      <el-table-column label="用户昵称" align="center" prop="nickname" min-width="140" />
      <el-table-column label="用户头像" align="center" prop="avatar" width="100">
        <template v-slot="scope">
          <el-image v-if="scope.row.avatar" :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]"
                    fit="cover" style="width: 30px; height: 30px" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.updateTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="100">
        <template v-slot="scope">
          <el-button v-hasPermi="['system:social-user:query']" size="mini" type="text"
                     icon="el-icon-search" @click="openDetail(scope.row.id)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo"
                :limit.sync="queryParams.pageSize" @pagination="getList" />

    <social-user-detail ref="detail" />
  </div>
</template>

<script>
import { getSocialUserPage } from '@/api/system/social/user'
import SocialUserDetail from './SocialUserDetail'

export default {
  name: 'SocialUser',
  components: { SocialUserDetail },
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        type: undefined,
        openid: undefined,
        nickname: undefined,
        createTime: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    toNumber(value) {
      const number = Number(value)
      return Number.isNaN(number) ? value : number
    },
    getList() {
      this.loading = true
      return getSocialUserPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
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
    openDetail(id) {
      this.$refs.detail.open(id)
    }
  }
}
</script>
