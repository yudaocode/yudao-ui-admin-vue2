<template>
  <el-dialog
    title="测试"
    :visible.sync="dialogVisible"
    width="620px"
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
        ><el-input
          v-model="formData.content"
          type="textarea"
          :rows="4"
          readonly
      /></el-form-item>
      <el-form-item label="手机号" prop="mobile"
        ><el-input v-model="formData.mobile" placeholder="请输入手机号"
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
import { getSmsTemplate, sendSms } from "@/api/system/sms/smsTemplate";
export default {
  name: "SystemSmsTemplateSendForm",
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: this.defaultForm(),
      formRules: {
        mobile: [{ required: true, message: "手机不能为空", trigger: "blur" }],
      },
    };
  },
  methods: {
    defaultForm() {
      return {
        content: "",
        params: [],
        mobile: "",
        templateCode: "",
        templateParams: {},
      };
    },
    open(id) {
      this.dialogVisible = true;
      this.formData = this.defaultForm();
      this.formLoading = true;
      getSmsTemplate(id)
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
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.formLoading = true;
        sendSms(this.formData)
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
