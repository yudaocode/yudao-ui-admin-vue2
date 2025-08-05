<template>
  <div class="app-container">
    <doc-alert title="邮件配置" url="https://doc.iocoder.cn/mail" />

    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="接收邮箱" prop="toMail">
        <el-input v-model="queryParams.toMail" placeholder="请输入接收邮箱" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="邮箱账号" prop="accountId">
        <el-select v-model="queryParams.accountId" placeholder="请输入邮箱账号" clearable>
          <el-option v-for="account in accountOptions" :key="account.id" :value="account.id" :label="account.mail" />
        </el-select>
      </el-form-item>
      <el-form-item label="模板编号" prop="templateId">
        <el-input v-model="queryParams.templateId" placeholder="请输入模板编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="发送状态" prop="sendStatus">
        <el-select v-model="queryParams.sendStatus" placeholder="请选择发送状态" clearable size="small">
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.SYSTEM_MAIL_SEND_STATUS)"
                     :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="发送时间" prop="sendTime">
        <el-date-picker v-model="queryParams.sendTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item label="用户编号" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="请输入用户编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="用户类型" prop="userType">
        <el-select v-model="queryParams.userType" placeholder="请选择用户类型" clearable>
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.USER_TYPE)"
                     :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="发送时间" align="center" prop="sendTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.sendTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="接收用户" align="center" width="150">
        <template v-slot="scope">
          <div v-if="scope.row.userType && scope.row.userId">
            <dict-tag :type="DICT_TYPE.USER_TYPE" :value="scope.row.userType" />
            <div>{{ '(' + scope.row.userId + ')' }}</div>
          </div>
          <div v-else>-</div>
        </template>
      </el-table-column>
      <el-table-column label="接收信息" align="center" width="300">
        <template v-slot="scope">
          <div class="text-left">
            <div v-if="scope.row.toMails && scope.row.toMails.length > 0">
              收件：
              <span v-for="(mail, index) in scope.row.toMails" :key="mail">
                {{ mail }}<span v-if="index < scope.row.toMails.length - 1">、</span>
              </span>
            </div>
            <div v-if="scope.row.ccMails && scope.row.ccMails.length > 0">
              抄送：
              <span v-for="(mail, index) in scope.row.ccMails" :key="mail">
                {{ mail }}<span v-if="index < scope.row.ccMails.length - 1">、</span>
              </span>
            </div>
            <div v-if="scope.row.bccMails && scope.row.bccMails.length > 0">
              密送：
              <span v-for="(mail, index) in scope.row.bccMails" :key="mail">
                {{ mail }}<span v-if="index < scope.row.bccMails.length - 1">、</span>
              </span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="邮件标题" align="center" prop="templateTitle" />
      <el-table-column label="发送状态" align="center" prop="sendStatus">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_MAIL_SEND_STATUS" :value="scope.row.sendStatus" />
        </template>
      </el-table-column>
      <el-table-column label="邮箱账号" align="center" prop="fromMail" />
      <el-table-column label="模板编号" align="center" prop="templateId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row)"
                     v-hasPermi="['system:mail-log:query']">详细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 邮件日志详细-->
    <el-dialog :title="title" :visible.sync="open" width="800px" v-dialogDrag append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="日志主键">
          {{ form.id }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱账号编号">
          {{ form.accountId }}
        </el-descriptions-item>
        <el-descriptions-item label="发送邮箱地址">
          {{ form.fromMail }}
        </el-descriptions-item>
        <el-descriptions-item label="模板编号">
          {{ form.templateId }}
        </el-descriptions-item>
        <el-descriptions-item label="模板编码">
          {{ form.templateCode }}
        </el-descriptions-item>
        <el-descriptions-item label="模版发送人名称">
          {{ form.templateNickname }}
        </el-descriptions-item>
        <el-descriptions-item label="接收用户">
          <span v-if="form.userType && form.userId">
            <dict-tag :type="DICT_TYPE.USER_TYPE" :value="form.userType" />
            ({{ form.userId }})
          </span>
          <span v-else>无</span>
        </el-descriptions-item>
        <el-descriptions-item label="接收信息">
          <div>
            <div v-if="form.toMails && form.toMails.length > 0">
              收件：
              <span v-for="(mail, index) in form.toMails" :key="mail">
                {{ mail }}<span v-if="index < form.toMails.length - 1">、</span>
              </span>
            </div>
            <div v-if="form.ccMails && form.ccMails.length > 0">
              抄送：
              <span v-for="(mail, index) in form.ccMails" :key="mail">
                {{ mail }}<span v-if="index < form.ccMails.length - 1">、</span>
              </span>
            </div>
            <div v-if="form.bccMails && form.bccMails.length > 0">
              密送：
              <span v-for="(mail, index) in form.bccMails" :key="mail">
                {{ mail }}<span v-if="index < form.bccMails.length - 1">、</span>
              </span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="邮件标题">
          {{ form.templateTitle }}
        </el-descriptions-item>
        <el-descriptions-item label="邮件内容" :span="2">
          <editor v-model="form.templateContent" :min-height="192" readonly />
        </el-descriptions-item>
        <el-descriptions-item label="邮件参数">
          {{ form.templateParams }}
        </el-descriptions-item>
        <el-descriptions-item label="发送状态">
          <dict-tag :type="DICT_TYPE.SYSTEM_MAIL_SEND_STATUS" :value="form.sendStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">
          {{ parseTime(form.sendTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="发送返回的消息编号">
          {{ form.sendMessageId }}
        </el-descriptions-item>
        <el-descriptions-item label="发送异常" :span="2">
          <span style="color: red;" v-if="form.sendException">{{ form.sendException }}</span>
          <span v-else>无</span>
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMailLogPage } from "@/api/system/mail/log";
import { getSimpleMailAccountList } from "@/api/system/mail/account";
import Editor from '@/components/Editor';

export default {
  name: "SystemMailLog",
  components: {
    Editor,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 邮件日志列表
      list: [],
      // 弹出层标题
      title: "邮件发送日志详细",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        toMail: '',
        accountId: undefined,
        templateId: undefined,
        sendStatus: undefined,
        userId: undefined,
        userType: undefined,
        sendTime: []
      },
      // 表单参数
      form: {},
      // 邮箱账号
      accountOptions: []
    };
  },
  created() {
    this.getList();
    // 获得邮箱账号列表
    getSimpleMailAccountList().then(response => {
      this.accountOptions = response.data
    })
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getMailLogPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        userId: undefined,
        userType: undefined,
        toMails: undefined,
        ccMails: undefined,
        bccMails: undefined,
        accountId: undefined,
        fromMail: undefined,
        templateId: undefined,
        templateCode: undefined,
        templateNickname: undefined,
        templateTitle: undefined,
        templateContent: undefined,
        templateParams: undefined,
        sendStatus: undefined,
        sendTime: undefined,
        sendMessageId: undefined,
        sendException: undefined,
      };
      this.resetForm("form");
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
    /** 详细按钮操作 */
    handleView(row) {
      this.open = true;
      this.form = row;
    },
  }
};
</script>
