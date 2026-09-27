<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="560px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="150px"
    >
      <el-form-item label="邮箱" prop="mail"
        ><el-input v-model="formData.mail" placeholder="请输入邮箱"
      /></el-form-item>
      <el-form-item label="用户名" prop="username"
        ><el-input v-model="formData.username" placeholder="请输入用户名"
      /></el-form-item>
      <el-form-item label="密码" prop="password"
        ><el-input
          v-model="formData.password"
          type="password"
          show-password
          placeholder="请输入密码"
      /></el-form-item>
      <el-form-item label="SMTP 服务器域名" prop="host"
        ><el-input v-model="formData.host" placeholder="请输入 SMTP 服务器域名"
      /></el-form-item>
      <el-form-item label="SMTP 服务器端口" prop="port"
        ><el-input-number
          v-model="formData.port"
          :min="1"
          :max="65535"
          controls-position="right"
      /></el-form-item>
      <el-form-item label="是否开启 SSL"
        ><el-switch v-model="formData.sslEnable"
      /></el-form-item>
      <el-form-item label="是否开启 STARTTLS"
        ><el-switch v-model="formData.starttlsEnable"
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
  getMailAccount,
  createMailAccount,
  updateMailAccount,
} from "@/api/system/mail/account";
export default {
  name: "SystemMailAccountForm",
  data() {
    return {
      dialogVisible: false,
      dialogTitle: "",
      formType: "create",
      formLoading: false,
      formData: this.defaultForm(),
      formRules: {
        mail: [
          { required: true, message: "邮箱不能为空", trigger: "blur" },
          {
            type: "email",
            message: "请输入正确的邮箱格式",
            trigger: ["blur", "change"],
          },
        ],
        username: [
          { required: true, message: "用户名不能为空", trigger: "blur" },
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
        ],
        host: [
          {
            required: true,
            message: "SMTP 服务器域名不能为空",
            trigger: "blur",
          },
        ],
        port: [
          {
            required: true,
            message: "SMTP 服务器端口不能为空",
            trigger: "change",
          },
        ],
      },
    };
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        mail: "",
        username: "",
        password: "",
        host: "",
        port: 465,
        sslEnable: true,
        starttlsEnable: false,
      };
    },
    open(type, id) {
      this.dialogVisible = true;
      this.formType = type || "create";
      this.dialogTitle =
        this.formType === "update" ? "修改邮箱账号" : "添加邮箱账号";
      this.formData = this.defaultForm();
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      if (id !== undefined && id !== null) {
        this.formLoading = true;
        getMailAccount(id)
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
            ? createMailAccount(this.formData)
            : updateMailAccount(this.formData);
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
