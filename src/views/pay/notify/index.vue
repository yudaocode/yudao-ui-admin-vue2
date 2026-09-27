<template>
  <div class="app-container">
    <doc-alert title="支付功能开启" url="https://doc.iocoder.cn/pay/build/" />

    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="应用编号" prop="appId">
        <el-select clearable v-model="queryParams.appId" filterable placeholder="请选择应用信息">
          <el-option v-for="item in appList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="通知类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择通知类型" clearable size="small">
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.PAY_NOTIFY_TYPE)"
                     :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="关联编号" prop="dataId">
        <el-input v-model="queryParams.dataId" placeholder="请输入关联编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="通知状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择通知状态" clearable size="small">
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.PAY_NOTIFY_STATUS)"
                     :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="商户订单编号" prop="merchantOrderId">
        <el-input v-model="queryParams.merchantOrderId" placeholder="请输入商户订单编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="商户退款编号" prop="merchantRefundId">
        <el-input v-model="queryParams.merchantRefundId" placeholder="请输入商户退款编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="商户转账编号" prop="merchantTransferId">
        <el-input v-model="queryParams.merchantTransferId" placeholder="请输入商户转账编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column label="任务编号" align="center" prop="id" />
      <el-table-column label="应用编号" align="center" prop="appName" />
      <el-table-column label="商户单信息" align="center" prop="merchant">
        <template v-slot="scope">
          <div v-if="scope.row.merchantOrderId">商户订单编号：{{ scope.row.merchantOrderId }}</div>
          <div v-if="scope.row.merchantRefundId">商户退款编号：{{ scope.row.merchantRefundId }}</div>
          <div v-if="scope.row.merchantTransferId">商户转账编号：{{ scope.row.merchantTransferId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="通知类型" align="center" prop="type">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.PAY_NOTIFY_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="关联编号" align="center" prop="dataId" />
      <el-table-column label="通知状态" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.PAY_NOTIFY_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="最后通知时间" align="center" prop="lastExecuteTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.lastExecuteTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下次通知时间" align="center" prop="nextNotifyTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.nextNotifyTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="通知次数" align="center" prop="notifyTimes">
        <template v-slot="scope">
          <el-tag size="mini" type="success">
            {{ scope.row.notifyTimes }} / {{ scope.row.maxNotifyTimes }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-search" @click="handleDetail(scope.row)"
                     v-hasPermi="['pay:notify:query']">查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <notify-detail ref="detailRef" />
  </div>
</template>

<script>
import { getNotifyTaskPage } from "@/api/pay/notify";
import { getAppList } from "@/api/pay/app";
import NotifyDetail from './NotifyDetail.vue';

export default {
  name: "PayNotify",
  components: { NotifyDetail },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 支付通知列表
      list: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        appId: null,
        type: null,
        dataId: null,
        status: null,
        merchantOrderId: null,
        merchantRefundId: null,
        merchantTransferId: null,
        createTime: [],
      },

      // 支付应用列表集合
      appList: [],
    };
  },
  created() {
    this.getList();
    // 获得筛选项
    getAppList().then(response => {
      this.appList = response.data;
    });
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      return getNotifyTaskPage(this.queryParams).then(response => {
        const page = response.data;
        this.list = page.list;
        this.total = page.total;
      }).finally(() => {
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 详情按钮操作 */
    handleDetail(row) {
      this.$refs.detailRef.open(row.id);
    },
  }
};
</script>
