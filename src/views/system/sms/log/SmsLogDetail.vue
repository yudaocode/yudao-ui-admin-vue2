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
      <el-descriptions-item label="短信渠道"
        >{{ channelName }}
        <dict-tag
          :type="DICT_TYPE.SYSTEM_SMS_CHANNEL_CODE"
          :value="detailData.channelCode"
      /></el-descriptions-item>
      <el-descriptions-item label="短信模板"
        >{{ detailData.templateId }} | {{ detailData.templateCode }}
        <dict-tag
          :type="DICT_TYPE.SYSTEM_SMS_TEMPLATE_TYPE"
          :value="detailData.templateType"
      /></el-descriptions-item>
      <el-descriptions-item label="API 的模板编号">{{
        detailData.apiTemplateId
      }}</el-descriptions-item>
      <el-descriptions-item label="用户信息"
        >{{ detailData.mobile }}
        <span v-if="detailData.userType && detailData.userId"
          ><dict-tag :type="DICT_TYPE.USER_TYPE" :value="detailData.userType" />
          ({{ detailData.userId }})</span
        ></el-descriptions-item
      >
      <el-descriptions-item label="短信内容">{{
        detailData.templateContent
      }}</el-descriptions-item>
      <el-descriptions-item label="短信参数">{{
        detailData.templateParams
      }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{
        parseTime(detailData.createTime)
      }}</el-descriptions-item>
      <el-descriptions-item label="发送状态"
        ><dict-tag
          :type="DICT_TYPE.SYSTEM_SMS_SEND_STATUS"
          :value="detailData.sendStatus"
      /></el-descriptions-item>
      <el-descriptions-item label="发送时间">{{
        parseTime(detailData.sendTime)
      }}</el-descriptions-item>
      <el-descriptions-item label="API 发送结果"
        >{{ detailData.apiSendCode }} |
        {{ detailData.apiSendMsg }}</el-descriptions-item
      >
      <el-descriptions-item label="API 短信编号">{{
        detailData.apiSerialNo
      }}</el-descriptions-item>
      <el-descriptions-item label="API 请求编号">{{
        detailData.apiRequestId
      }}</el-descriptions-item>
      <el-descriptions-item label="API 接收状态"
        ><dict-tag
          :type="DICT_TYPE.SYSTEM_SMS_RECEIVE_STATUS"
          :value="detailData.receiveStatus"
        />
        {{ parseTime(detailData.receiveTime) }}</el-descriptions-item
      >
      <el-descriptions-item label="API 接收结果"
        >{{ detailData.apiReceiveCode }} |
        {{ detailData.apiReceiveMsg }}</el-descriptions-item
      >
    </el-descriptions>
  </el-dialog>
</template>
<script>
import { getSimpleSmsChannelList } from "@/api/system/sms/smsChannel";
import { DICT_TYPE } from "@/utils/dict";
export default {
  name: "SystemSmsLogDetail",
  data() {
    return { DICT_TYPE, dialogVisible: false, detailData: {}, channelList: [] };
  },
  computed: {
    channelName() {
      const item = this.channelList.find(
        (channel) => channel.id === this.detailData.channelId
      );
      return item ? item.signature : "";
    },
  },
  methods: {
    open(data) {
      this.detailData = Object.assign({}, data || {});
      this.dialogVisible = true;
      getSimpleSmsChannelList().then((response) => {
        this.channelList = response.data;
      });
    },
  },
};
</script>
