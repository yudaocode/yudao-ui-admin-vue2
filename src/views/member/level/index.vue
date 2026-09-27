<template>
  <div class="app-container member-level-page">
    <doc-alert
      title="会员等级、积分、签到"
      url="https://doc.iocoder.cn/member/level/"
    />
    <el-card
      shadow="never"
      class="search-card"
    >
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="68px"
        size="small"
        @submit.native.prevent
      >
        <el-form-item
          label="等级名称"
          prop="name"
        ><el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入等级名称"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        ><el-select
          v-model="queryParams.status"
          clearable
          placeholder="请选择状态"
        ><el-option
          v-for="item in statusDictDatas"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        /></el-select></el-form-item>
        <el-form-item><el-button
          type="primary"
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button><el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button><el-button
          v-hasPermi="['member:level:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
      >
        <el-table-column
          label="编号"
          prop="id"
          width="70"
        />
        <el-table-column
          label="等级图标"
          prop="icon"
          width="100"
        ><template #default="scope"><el-image
          v-if="scope.row.icon"
          :src="scope.row.icon"
          :preview-src-list="[scope.row.icon]"
          style="width: 30px; height: 30px"
        /></template></el-table-column>
        <el-table-column
          label="等级背景图"
          prop="backgroundUrl"
          width="110"
        ><template #default="scope"><el-image
          v-if="scope.row.backgroundUrl"
          :src="scope.row.backgroundUrl"
          :preview-src-list="[scope.row.backgroundUrl]"
          style="width: 30px; height: 30px"
        /></template></el-table-column>
        <el-table-column
          label="等级名称"
          prop="name"
          min-width="110"
        /><el-table-column
          label="等级"
          prop="level"
          width="70"
        /><el-table-column
          label="升级经验"
          prop="experience"
          width="100"
        /><el-table-column
          label="享受折扣(%)"
          prop="discountPercent"
          width="120"
        />
        <el-table-column
          label="状态"
          prop="status"
          width="90"
        ><template #default="scope"><dict-tag
          :type="DICT_TYPE.COMMON_STATUS"
          :value="scope.row.status"
        /></template></el-table-column>
        <el-table-column
          label="创建时间"
          prop="createTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="操作"
          fixed="right"
          width="150"
        ><template #default="scope"><el-button
          v-hasPermi="['member:level:update']"
          type="text"
          size="mini"
          @click="openForm('update', scope.row.id)"
        >编辑</el-button><el-button
          v-hasPermi="['member:level:delete']"
          type="text"
          size="mini"
          class="danger-text"
          @click="handleDelete(scope.row.id)"
        >删除</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <level-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import * as LevelApi from '@/api/member/level'
import LevelForm from './LevelForm'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils'

export default {
  name: 'MemberLevel',
  components: { LevelForm },
  data() { return { DICT_TYPE, loading: false, list: [], queryParams: { name: undefined, status: undefined }} },
  computed: { statusDictDatas() { return getIntDictOptions(DICT_TYPE.COMMON_STATUS) } },
  created() { this.getList() },
  methods: {
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const response = await LevelApi.getLevelList(this.queryParams)
        this.list = response.data
      } finally {
        this.loading = false
      }
    },
    handleQuery() { this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() },
    openForm(type, id) { this.$refs.form.open(type, id) },
    handleDelete(id) { this.$modal.confirm('是否确认删除该会员等级？').then(() => LevelApi.deleteLevel(id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {}) }
  }
}
</script>

<style scoped>
.search-card { margin-bottom: 16px; }
.danger-text { color: #f56c6c; }
</style>
