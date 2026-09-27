<template>
  <div class="app-container">
    <doc-alert title="AI 绘图创作" url="https://doc.iocoder.cn/ai/image/" />
    <el-form ref="queryForm" :model="queryParams" :inline="true" size="small" @submit.native.prevent>
      <el-form-item label="用户编号" prop="userId">
        <el-select v-model="queryParams.userId" clearable filterable placeholder="请选择用户" style="width: 200px">
          <el-option v-for="item in userList" :key="item.id" :label="item.nickname" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="平台" prop="platform">
        <el-select v-model="queryParams.platform" clearable placeholder="请选择平台" style="width: 180px">
          <el-option v-for="item in platformDictDatas" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="绘画状态" prop="status">
        <el-select v-model="queryParams.status" clearable placeholder="请选择状态" style="width: 180px">
          <el-option v-for="item in statusDictDatas" :key="item.value" :label="item.label" :value="Number(item.value)" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否发布" prop="publicStatus">
        <el-select v-model="queryParams.publicStatus" clearable placeholder="请选择" style="width: 140px">
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="编号" prop="id" align="center" width="170" />
      <el-table-column label="图片" prop="picUrl" align="center" width="110">
        <template v-slot="scope">
          <el-image
            v-if="scope.row.picUrl"
            :src="scope.row.picUrl"
            :preview-src-list="[scope.row.picUrl]"
            fit="cover"
            style="width: 70px; height: 70px"
          />
        </template>
      </el-table-column>
      <el-table-column label="用户" prop="userId" align="center" width="150">
        <template v-slot="scope">{{ getUserName(scope.row.userId) }}</template>
      </el-table-column>
      <el-table-column label="平台" prop="platform" align="center" width="120">
        <template v-slot="scope"><dict-tag :type="DICT_TYPE.AI_PLATFORM" :value="scope.row.platform" /></template>
      </el-table-column>
      <el-table-column label="模型" prop="model" align="center" width="150" />
      <el-table-column label="绘画状态" prop="status" align="center" width="110">
        <template v-slot="scope"><dict-tag :type="DICT_TYPE.AI_IMAGE_STATUS" :value="scope.row.status" /></template>
      </el-table-column>
      <el-table-column label="是否发布" prop="publicStatus" align="center" width="110">
        <template v-slot="scope">
          <el-switch
            v-model="scope.row.publicStatus"
            :active-value="true"
            :inactive-value="false"
            :disabled="scope.row.status !== AiImageStatusEnum.SUCCESS"
            @change="handlePublicStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="提示词" prop="prompt" align="center" min-width="180" show-overflow-tooltip />
      <el-table-column label="创建时间" prop="createTime" align="center" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="宽度" prop="width" align="center" />
      <el-table-column label="高度" prop="height" align="center" />
      <el-table-column label="错误信息" prop="errorMessage" align="center" />
      <el-table-column label="任务编号" prop="taskId" align="center" />
      <el-table-column label="操作" align="center" width="90" fixed="right">
        <template v-slot="scope">
          <el-button type="text" size="mini" v-hasPermi="['ai:image:delete']" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { ImageApi } from '@/api/ai/image'
import { getSimpleUserList } from '@/api/system/user'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { AiImageStatusEnum } from '@/views/ai/utils/constants'

export default {
  name: 'AiImageManager',
  data() {
    return {
      DICT_TYPE,
      AiImageStatusEnum,
      loading: true,
      list: [],
      total: 0,
      userList: [],
      platformDictDatas: getDictDatas(DICT_TYPE.AI_PLATFORM),
      statusDictDatas: getDictDatas(DICT_TYPE.AI_IMAGE_STATUS),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: undefined,
        platform: undefined,
        status: undefined,
        publicStatus: undefined,
        createTime: []
      }
    }
  },
  async created() {
    this.getList()
    await this.loadUsers()
  },
  methods: {
    getList() {
      this.loading = true
      return ImageApi.getImagePage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => { this.loading = false })
    },
    loadUsers() {
      return getSimpleUserList().then(response => {
        this.userList = response.data
      })
    },
    getUserName(userId) {
      const user = this.userList.find(item => String(item.id) === String(userId))
      return user ? user.nickname : userId
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() },
    handleDelete(id) {
      this.$modal.confirm('是否删除所选中数据？').then(() => ImageApi.deleteImage(id)).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handlePublicStatusChange(row) {
      const publicStatus = row.publicStatus
      return this.$modal.confirm('确认要"' + (publicStatus ? '公开' : '私有') + '"该图片吗?').then(() => ImageApi.updateImage({ id: row.id, publicStatus })).then(() => this.getList()).catch(() => { row.publicStatus = !publicStatus })
    }
  }
}
</script>
