<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="680px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="145px"
    >
      <el-form-item label="短信签名" prop="signature"
        ><el-input v-model="formData.signature" placeholder="请输入短信签名"
      /></el-form-item>
      <el-form-item label="渠道编码" prop="code"
        ><el-select
          v-model="formData.code"
          clearable
          placeholder="请选择渠道编码"
          ><el-option
            v-for="dict in channelCodeDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value" /></el-select
      ></el-form-item>
      <el-form-item label="启用状态" prop="status"
        ><el-radio-group v-model="formData.status"
          ><el-radio
            v-for="dict in statusDictDatas"
            :key="dict.value"
            :label="Number(dict.value)"
            >{{ dict.label }}</el-radio
          ></el-radio-group
        ></el-form-item
      >
      <el-form-item label="备注"
        ><el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
      /></el-form-item>
      <el-form-item label="短信 API 的账号" prop="apiKey"
        ><el-input
          v-model="formData.apiKey"
          placeholder="请输入短信 API 的账号"
      /></el-form-item>
      <el-form-item label="短信 API 的密钥"
        ><el-input
          v-model="formData.apiSecret"
          show-password
          placeholder="请输入短信 API 的密钥"
      /></el-form-item>
      <el-form-item label="短信发送回调 URL"
        ><el-input
          v-model="formData.callbackUrl"
          placeholder="请输入短信发送回调 URL"
      /></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm"
        >确 定</el-button
      ><el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import {
  getSmsChannel,
  createSmsChannel,
  updateSmsChannel,
} from "@/api/system/sms/smsChannel";
import { CommonStatusEnum } from "@/utils/constants";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
export default {
  name: "SystemSmsChannelForm",
  data() {
    return {
      dialogVisible: false,
      dialogTitle: "",
      formType: "create",
      formLoading: false,
      formData: this.defaultForm(),
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      channelCodeDictDatas: getDictDatas(DICT_TYPE.SYSTEM_SMS_CHANNEL_CODE),
      formRules: {
        signature: [
          { required: true, message: "短信签名不能为空", trigger: "blur" },
        ],
        code: [
          { required: true, message: "渠道编码不能为空", trigger: "change" },
        ],
        status: [
          { required: true, message: "启用状态不能为空", trigger: "change" },
        ],
        apiKey: [
          {
            required: true,
            message: "短信 API 的账号不能为空",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        signature: "",
        code: "",
        status: CommonStatusEnum.ENABLE,
        remark: "",
        apiKey: "",
        apiSecret: "",
        callbackUrl: "",
      };
    },
    open(type, id) {
      this.dialogVisible = true;
      this.formType = type || "create";
      this.dialogTitle =
        this.formType === "update" ? "修改短信渠道" : "添加短信渠道";
      this.formData = this.defaultForm();
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      if (id !== undefined && id !== null) {
        this.formLoading = true;
        getSmsChannel(id)
          .then((response) => {
            this.formData = response.data;
          })
          .finally(() => {
            this.formLoading = false;
          });
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.formLoading = true;
        const request =
          this.formType === "create"
            ? createSmsChannel(this.formData)
            : updateSmsChannel(this.formData);
        request
          .then(() => {
            this.$modal.msgSuccess(
              this.formType === "create" ? "新增成功" : "修改成功"
            );
            this.dialogVisible = false;
            this.$emit("success");
          })
          .finally(() => {
            this.formLoading = false;
          });
      });
    },
  },
};
</script>
