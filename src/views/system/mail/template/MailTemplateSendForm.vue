<template>
  <el-dialog
    title="测试"
    :visible.sync="dialogVisible"
    width="800px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="140px"
    >
      <el-form-item label="模板内容"
        ><Editor v-model="formData.content" height="150px" :readonly="true"
      /></el-form-item>
      <el-form-item label="收件邮箱" prop="toMails"
        ><el-input
          v-model="toMailsText"
          placeholder="请输入收件邮箱，多个邮箱用逗号分隔"
          @change="syncMails('toMails', toMailsText)"
      /></el-form-item>
      <el-form-item label="抄送邮箱"
        ><el-input
          v-model="ccMailsText"
          placeholder="请输入抄送邮箱，多个邮箱用逗号分隔"
          @change="syncMails('ccMails', ccMailsText)"
      /></el-form-item>
      <el-form-item label="密送邮箱"
        ><el-input
          v-model="bccMailsText"
          placeholder="请输入密送邮箱，多个邮箱用逗号分隔"
          @change="syncMails('bccMails', bccMailsText)"
      /></el-form-item>
      <el-form-item
        v-for="param in formData.params"
        :key="param"
        :label="'参数 {' + param + '}'"
        :prop="'templateParams.' + param"
        ><el-input
          v-model="formData.templateParams[param]"
          :placeholder="'请输入 ' + param + ' 参数'"
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
import Editor from "@/components/Editor";
import { getMailTemplate, sendMail } from "@/api/system/mail/template";
export default {
  name: "SystemMailTemplateSendForm",
  components: { Editor },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      toMailsText: "",
      ccMailsText: "",
      bccMailsText: "",
      formData: this.defaultForm(),
      formRules: {},
    };
  },
  methods: {
    defaultForm() {
      return {
        content: "",
        params: [],
        toMails: [],
        ccMails: [],
        bccMails: [],
        templateCode: "",
        templateParams: {},
      };
    },
    async open(id) {
      this.dialogVisible = true;
      this.formData = this.defaultForm();
      this.toMailsText = "";
      this.ccMailsText = "";
      this.bccMailsText = "";
      this.formLoading = true;
      getMailTemplate(id)
        .then((response) => {
          const data = response.data;
          this.formData.content = data.content;
          this.formData.params = data.params;
          this.formData.templateCode = data.code;
          this.formData.params.forEach((key) => {
            this.$set(this.formData.templateParams, key, "");
          });
        })
        .finally(() => {
          this.formLoading = false;
        });
    },
    syncMails(key, text) {
      this.formData[key] = (text || "").split(/[,，\s]+/).filter(Boolean);
    },
    submitForm() {
      this.syncMails("toMails", this.toMailsText);
      this.syncMails("ccMails", this.ccMailsText);
      this.syncMails("bccMails", this.bccMailsText);
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.formLoading = true;
        sendMail(this.formData)
          .then((response) => {
            const logId = response.data;
            if (logId)
              this.$modal.msgSuccess(
                "提交发送成功！发送结果，见发送日志编号：" + logId
              );
            this.dialogVisible = false;
          })
          .finally(() => {
            this.formLoading = false;
          });
      });
    },
  },
};
</script>
