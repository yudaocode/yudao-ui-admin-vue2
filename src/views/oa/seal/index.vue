<template>
  <div class="app-container oa-seal">
    <doc-alert
      title="【行政】办公用品、用印管理"
      url="https://doc.iocoder.cn/oa/administration/supply-seal/"
    />
    <!-- 搜索工作栏 -->
    <content-wrap>
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="68px"
        @submit.native.prevent
      >
        <el-form-item label="编号" prop="no">
          <el-input
            v-model="queryParams.no"
            placeholder="请输入编号"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="印章分类" prop="category">
          <el-select
            v-model="queryParams.category"
            placeholder="请选择印章分类"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in categoryOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门" prop="deptId">
          <dept-select v-model="queryParams.deptId" placeholder="请选择所属部门" style="width: 240px" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
            <el-option
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="印章类型" prop="type">
          <el-select
            v-model="queryParams.type"
            placeholder="请选择印章类型"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in typeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="保管人" prop="keeperUserId">
          <user-select-v2
            v-model="queryParams.keeperUserId"
            placeholder="请选择保管人"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="购买时间" prop="purchaseTime">
          <el-date-picker
            v-model="queryParams.purchaseTime"
            type="daterange"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="[new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="启用时间" prop="enableTime">
          <el-date-picker
            v-model="queryParams.enableTime"
            type="daterange"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="[new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="停用时间" prop="disableTime">
          <el-date-picker
            v-model="queryParams.disableTime"
            type="daterange"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="[new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button
            v-hasPermi="['oa:seal:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
        </el-form-item>
      </el-form>
    </content-wrap>
    <!-- 列表 -->
    <content-wrap>
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column label="所属部门" prop="deptName" min-width="150" />
        <el-table-column label="印章编号" prop="no" min-width="180" />
        <el-table-column label="印章名称" min-width="160">
          <template slot-scope="scope">
            <el-button type="text" @click="openDetail(scope.row.id)">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_SEAL_STATUS" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="印章照片" width="100" align="center">
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.picUrl"
              :src="scope.row.picUrl"
              :preview-src-list="[scope.row.picUrl]"
              fit="contain"
              class="seal-pic"
            />
          </template>
        </el-table-column>
        <el-table-column label="印章类型" min-width="110" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_SEAL_TYPE" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column label="分类" min-width="120" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_SEAL_CATEGORY" :value="scope.row.category" />
          </template>
        </el-table-column>
        <el-table-column label="保管人" prop="keeperName" min-width="120" />
        <el-table-column label="保管部门" prop="keeperDeptName" min-width="150" />
        <el-table-column
          label="购买日期"
          prop="purchaseTime"
          :formatter="dateFormatter2"
          width="120"
        />
        <el-table-column label="启用日期" prop="enableTime" :formatter="dateFormatter2" width="120" />
        <el-table-column
          label="停用日期"
          prop="disableTime"
          :formatter="dateFormatter2"
          width="120"
        />
        <el-table-column label="显示顺序" prop="sort" width="100" align="center" />
        <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip />
        <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" width="180" />
        <el-table-column label="操作" fixed="right" width="140" align="center">
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['oa:seal:update']"
              type="text"
              size="mini"
              @click="openForm('update', scope.row.id)"
            >修改</el-button>
            <el-button
              v-hasPermi="['oa:seal:delete']"
              type="text"
              size="mini"
              class="danger-text"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </content-wrap>
    <!-- 添加或修改印章弹窗 -->
    <oa-seal-form ref="form" @success="getList" />
    <!-- 印章详情弹窗 -->
    <oa-seal-detail ref="detail" />
  </div>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import OaSealForm from './OaSealForm.vue'
import OaSealDetail from './OaSealDetail.vue'
import { dateFormatter, dateFormatter2 } from '@/utils/formatTime'
import * as SealApi from '@/api/oa/seal'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'

export default {
  name: 'OaSeal',
  components: { OaSealForm, OaSealDetail, DeptSelect, UserSelectV2 },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: '',
        name: '',
        category: undefined,
        deptId: undefined,
        status: undefined,
        type: undefined,
        keeperUserId: undefined,
        purchaseTime: [],
        enableTime: [],
        disableTime: []
      }
    }
  },
  computed: {
    categoryOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SEAL_CATEGORY)
    },
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SEAL_STATUS)
    },
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SEAL_TYPE)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    dateFormatter2,
    getList() {
      this.loading = true
      return SealApi.getSealPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
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
      this.$refs.form.open(type, id)
    },
    openDetail(id) {
      this.$refs.detail.open(id)
    },
    handleDelete(id) {
      return this.$modal.delConfirm().then(() => {
        return SealApi.deleteSeal(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.seal-pic {
  width: 50px;
  height: 50px;
}

.danger-text {
  color: #f56c6c;
}
</style>
