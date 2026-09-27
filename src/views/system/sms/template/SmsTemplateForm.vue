<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="760px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="145px"
    >
      <el-form-item label="短信渠道编号" prop="channelId"
        ><el-select
          v-model="formData.channelId"
          placeholder="请选择短信渠道编号"
          ><el-option
            v-for="channel in channelList"
            :key="channel.id"
            :label="channel.signature + '【' + channel.code + '】'"
            :value="channel.id" /></el-select
      ></el-form-item>
      <el-form-item label="短信类型" prop="type"
        ><el-select v-model="formData.type" placeholder="请选择短信类型"
          ><el-option
            v-for="dict in typeDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)" /></el-select
      ></el-form-item>
      <el-form-item label="模板编号" prop="code"
        ><el-input v-model="formData.code" placeholder="请输入模板编号"
      /></el-form-item>
      <el-form-item label="模板名称" prop="name"
        ><el-input v-model="formData.name" placeholder="请输入模板名称"
      /></el-form-item>
      <el-form-item label="模板内容" prop="content"
        ><el-input
          v-model="formData.content"
          type="textarea"
          :rows="4"
          placeholder="请输入模板内容"
      /></el-form-item>
      <el-form-item label="开启状态" prop="status"
        ><el-radio-group v-model="formData.status"
          ><el-radio
            v-for="dict in statusDictDatas"
            :key="dict.value"
            :label="Number(dict.value)"
            >{{ dict.label }}</el-radio
          ></el-radio-group
        ></el-form-item
      >
      <el-form-item label="短信 API 模板编号" prop="apiTemplateId"
        ><el-input
          v-model="formData.apiTemplateId"
          placeholder="请输入短信 API 的模板编号"
      /></el-form-item>
      <el-form-item label="备注"
        ><el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
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
  getSmsTemplate,
  createSmsTemplate,
  updateSmsTemplate,
} from "@/api/system/sms/smsTemplate";
import { getSimpleSmsChannelList } from "@/api/system/sms/smsChannel";
import { CommonStatusEnum } from "@/utils/constants";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
export default {
  name: "SystemSmsTemplateForm",
  data() {
    return {
      dialogVisible: false,
      dialogTitle: "",
      formType: "create",
      formLoading: false,
      formData: this.defaultForm(),
      channelList: [],
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      typeDictDatas: getDictDatas(DICT_TYPE.SYSTEM_SMS_TEMPLATE_TYPE),
      formRules: {
        channelId: [
          {
            required: true,
            message: "短信渠道编号不能为空",
            trigger: "change",
          },
        ],
        type: [
          { required: true, message: "短信类型不能为空", trigger: "change" },
        ],
        code: [
          { required: true, message: "模板编码不能为空", trigger: "blur" },
        ],
        name: [
          { required: true, message: "模板名称不能为空", trigger: "blur" },
        ],
        content: [
          { required: true, message: "模板内容不能为空", trigger: "blur" },
        ],
        status: [
          { required: true, message: "开启状态不能为空", trigger: "change" },
        ],
        apiTemplateId: [
          {
            required: true,
            message: "短信 API 的模板编号不能为空",
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
        type: undefined,
        status: CommonStatusEnum.ENABLE,
        code: "",
        name: "",
        content: "",
        remark: "",
        apiTemplateId: "",
        channelId: undefined,
      };
    },
    open(type, id) {
      this.dialogVisible = true;
      this.formType = type || "create";
      this.dialogTitle =
        this.formType === "update" ? "修改短信模板" : "添加短信模板";
      this.formData = this.defaultForm();
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      getSimpleSmsChannelList().then((response) => {
        this.channelList = response.data;
      });
      if (id !== undefined && id !== null) {
        this.formLoading = true;
        getSmsTemplate(id)
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
            ? createSmsTemplate(this.formData)
            : updateSmsTemplate(this.formData);
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
