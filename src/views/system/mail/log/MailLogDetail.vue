<template>
  <el-dialog
    title="详情"
    :visible.sync="dialogVisible"
    width="820px"
    append-to-body
  >
    <el-descriptions :column="1" border>
      <el-descriptions-item label="日志主键">{{
        detailData.id
      }}</el-descriptions-item>
      <el-descriptions-item label="邮箱账号">{{
        accountName
      }}</el-descriptions-item>
      <el-descriptions-item label="邮件模板"
        >{{ detailData.templateId }} |
        {{ detailData.templateCode }}</el-descriptions-item
      >
      <el-descriptions-item label="模版发送人名称">{{
        detailData.templateNickname
      }}</el-descriptions-item>
      <el-descriptions-item label="接收用户">{{
        detailData.userId || "无"
      }}</el-descriptions-item>
      <el-descriptions-item label="收件信息">{{
        mailsText
      }}</el-descriptions-item>
      <el-descriptions-item label="邮件标题">{{
        detailData.templateTitle
      }}</el-descriptions-item>
      <el-descriptions-item label="邮件内容"
        ><div v-dompurify-html="detailData.templateContent"></div
      ></el-descriptions-item>
      <el-descriptions-item label="邮件参数">{{
        detailData.templateParams
      }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{
        parseTime(detailData.createTime)
      }}</el-descriptions-item>
      <el-descriptions-item label="发送状态"
        ><dict-tag
          :type="DICT_TYPE.SYSTEM_MAIL_SEND_STATUS"
          :value="detailData.sendStatus"
      /></el-descriptions-item>
      <el-descriptions-item label="发送时间">{{
        parseTime(detailData.sendTime)
      }}</el-descriptions-item>
      <el-descriptions-item label="发送返回的消息编号">{{
        detailData.sendMessageId
      }}</el-descriptions-item>
      <el-descriptions-item label="发送异常">{{
        detailData.sendException
      }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>
<script>
import { getSimpleMailAccountList } from "@/api/system/mail/account";
import { DICT_TYPE } from "@/utils/dict";
export default {
  name: "SystemMailLogDetail",
  data() {
    return { DICT_TYPE, dialogVisible: false, detailData: {}, accountList: [] };
  },
  computed: {
    accountName() {
      const item = this.accountList.find(
        (account) => account.id === this.detailData.accountId
      );
      return item ? item.mail : "";
    },
    mailsText() {
      return []
        .concat(this.detailData.toMails || [])
        .concat(this.detailData.ccMails || [])
        .concat(this.detailData.bccMails || [])
        .join("、");
    },
  },
  methods: {
    open(data) {
      this.detailData = Object.assign({}, data || {});
      this.dialogVisible = true;
      getSimpleMailAccountList().then((response) => {
        this.accountList = response.data;
      });
    },
  },
};
</script>
