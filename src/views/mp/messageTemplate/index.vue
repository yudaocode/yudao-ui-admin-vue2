<template>
  <div class="app-container">
    <doc-alert title="模版消息" url="https://doc.iocoder.cn/mp/message-template/" />

    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="公众号" prop="accountId">
        <el-select v-model="queryParams.accountId" placeholder="请选择公众号" @change="handleAccountChange">
          <el-option v-for="item in accounts" :key="parseInt(item.id)" :label="item.name" :value="parseInt(item.id)" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="success" plain icon="el-icon-refresh" @click="handleSync" :loading="syncLoading"
                   v-hasPermi="['mp:message-template:sync']" :disabled="queryParams.accountId === undefined">
          同步
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="公众号模板 ID" align="center" prop="templateId" width="200" />
      <el-table-column label="标题" align="center" prop="title" width="150" />
      <el-table-column label="模板内容" align="center" prop="content" />
      <el-table-column label="模板示例" align="center" prop="example" width="200" />
      <el-table-column label="一级行业" align="center" prop="primaryIndustry" width="120" />
      <el-table-column label="二级行业" align="center" prop="deputyIndustry" width="120" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-s-promotion" @click="handleSend(scope.row)"
                     v-hasPermi="['mp:message-template:send']">发送</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['mp:message-template:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 发送消息模板弹窗 -->
    <el-dialog title="发送消息模板" :visible.sync="sendDialogVisible" width="600px" append-to-body>
      <el-form ref="sendForm" :model="sendFormData" :rules="sendFormRules" label-width="120px">
        <el-form-item label="模板编号">
          <el-input v-model="sendFormData.id" disabled />
        </el-form-item>
        <el-form-item label="模板标题">
          <el-input v-model="templateTitle" disabled />
        </el-form-item>
        <el-form-item label="用户" prop="userId">
          <el-select
            v-model="sendFormData.userId"
            filterable
            remote
            reserve-keyword
            placeholder="请输入用户昵称搜索"
            :remote-method="searchUser"
            :loading="userLoading"
            style="width: 100%"
          >
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.nickname + ' | ' + user.openid"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模板数据" prop="data">
          <el-input
            v-model="sendFormData.data"
            type="textarea"
            :rows="4"
            placeholder='请输入模板数据（JSON 格式），例如：{"keyword1": {"value": "测试内容"}}'
          />
        </el-form-item>
        <el-form-item label="跳转链接" prop="url">
          <el-input v-model="sendFormData.url" placeholder="请输入跳转链接" />
        </el-form-item>
        <el-form-item label="小程序 appId" prop="miniProgramAppId">
          <el-input v-model="sendFormData.miniProgramAppId" placeholder="请输入小程序 appId" />
        </el-form-item>
        <el-form-item label="小程序页面路径" prop="miniProgramPagePath">
          <el-input v-model="sendFormData.miniProgramPagePath" placeholder="请输入小程序页面路径" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitSendForm" :loading="sendLoading">发 送</el-button>
        <el-button @click="sendDialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMessageTemplateList, deleteMessageTemplate, syncMessageTemplate, sendMessageTemplate } from "@/api/mp/messageTemplate";
import { getSimpleAccounts } from "@/api/mp/account";
import { getUserPage } from "@/api/mp/mpuser";

export default {
  name: "MpMessageTemplate",
  data() {
    return {
      // 遮罩层
      loading: false,
      // 同步模板加载中
      syncLoading: false,
      // 列表数据
      list: [],
      // 公众号账号列表
      accounts: [],
      // 查询参数
      queryParams: {
        accountId: undefined
      },
      // 发送弹窗
      sendDialogVisible: false,
      sendLoading: false,
      templateTitle: '',
      sendFormData: {
        id: undefined,
        userId: undefined,
        data: '',
        url: '',
        miniProgramAppId: '',
        miniProgramPagePath: ''
      },
      sendFormRules: {
        userId: [{ required: true, message: '请选择用户', trigger: 'change' }]
      },
      // 用户搜索
      userLoading: false,
      userList: [],
      // 当前账号编号
      currentAccountId: undefined
    };
  },
  created() {
    this.getAccounts();
  },
  methods: {
    /** 获取公众号账号列表 */
    getAccounts() {
      getSimpleAccounts().then(response => {
        this.accounts = response.data;
        // 默认选中第一个
        if (this.accounts.length > 0) {
          this.queryParams.accountId = parseInt(this.accounts[0].id);
          this.getList();
        }
      });
    },
    /** 公众号选择变化 */
    handleAccountChange(accountId) {
      this.queryParams.accountId = accountId;
      this.getList();
    },
    /** 查询列表 */
    getList() {
      if (!this.queryParams.accountId) {
        return;
      }
      this.loading = true;
      getMessageTemplateList(this.queryParams).then(response => {
        this.list = response.data || [];
        this.loading = false;
      });
    },
    /** 同步操作 */
    handleSync() {
      this.$modal.confirm('是否确认同步消息模板？').then(() => {
        this.syncLoading = true;
        return syncMessageTemplate(this.queryParams.accountId);
      }).then(() => {
        this.$modal.msgSuccess('同步消息模板成功');
        this.getList();
      }).finally(() => {
        this.syncLoading = false;
      });
    },
    /** 发送消息操作 */
    handleSend(row) {
      this.resetSendForm();
      this.sendDialogVisible = true;
      this.sendFormData.id = row.id;
      this.currentAccountId = row.accountId;
      this.templateTitle = row.title;
      // 加载用户列表
      this.searchUser('');
    },
    /** 搜索用户 */
    searchUser(query) {
      if (!this.currentAccountId) {
        return;
      }
      this.userLoading = true;
      getUserPage({
        pageNo: 1,
        pageSize: 20,
        accountId: this.currentAccountId,
        nickname: query || undefined
      }).then(response => {
        this.userList = response.data.list || [];
      }).finally(() => {
        this.userLoading = false;
      });
    },
    /** 提交发送表单 */
    submitSendForm() {
      this.$refs['sendForm'].validate(valid => {
        if (!valid) {
          return;
        }
        this.sendLoading = true;
        const sendData = { ...this.sendFormData };
        // 如果填写了小程序信息，需要拼接成 miniprogram 字段
        if (sendData.miniProgramAppId && sendData.miniProgramPagePath) {
          sendData.miniprogram = JSON.stringify({
            appid: sendData.miniProgramAppId,
            pagepath: sendData.miniProgramPagePath
          });
        }
        // 如果填写了 data 字段
        if (sendData.data) {
          try {
            sendData.data = JSON.parse(sendData.data);
          } catch (e) {
            this.$modal.msgError('模板数据格式不正确，请输入有效的 JSON 格式');
            this.sendLoading = false;
            return;
          }
        }
        sendMessageTemplate(sendData).then(() => {
          this.$modal.msgSuccess('发送成功');
          this.sendDialogVisible = false;
        }).finally(() => {
          this.sendLoading = false;
        });
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id;
      this.$modal.confirm('是否确认删除该消息模板？').then(() => {
        return deleteMessageTemplate(id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess('删除成功');
      }).catch(() => {});
    },
    /** 重置发送表单 */
    resetSendForm() {
      this.sendFormData = {
        id: undefined,
        userId: undefined,
        data: '',
        url: '',
        miniProgramAppId: '',
        miniProgramPagePath: ''
      };
      this.userList = [];
      this.templateTitle = '';
      if (this.$refs['sendForm']) {
        this.$refs['sendForm'].resetFields();
      }
    }
  }
};
</script>

