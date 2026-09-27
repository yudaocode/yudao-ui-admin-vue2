<template>
  <el-dialog
    :title="dialogTitle"
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
      <el-form-item label="邮箱账号" prop="accountId"
        ><el-select v-model="formData.accountId" placeholder="请选择邮箱账号"
          ><el-option
            v-for="account in accountList"
            :key="account.id"
            :label="account.mail"
            :value="account.id" /></el-select
      ></el-form-item>
      <el-form-item label="模板编码" prop="code"
        ><el-input v-model="formData.code" placeholder="请输入模板编码"
      /></el-form-item>
      <el-form-item label="模板名称" prop="name"
        ><el-input v-model="formData.name" placeholder="请输入模板名称"
      /></el-form-item>
      <el-form-item label="发送人名称"
        ><el-input v-model="formData.nickname" placeholder="请输入发送人名称"
      /></el-form-item>
      <el-form-item label="模板标题" prop="title"
        ><el-input v-model="formData.title" placeholder="请输入模板标题"
      /></el-form-item>
      <el-form-item label="模板内容" prop="content"
        ><Editor v-model="formData.content" height="200px"
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
import {
  getMailTemplate,
  createMailTemplate,
  updateMailTemplate,
} from "@/api/system/mail/template";
import { getSimpleMailAccountList } from "@/api/system/mail/account";
import { CommonStatusEnum } from "@/utils/constants";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
export default {
  name: "SystemMailTemplateForm",
  components: { Editor },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: "",
      formType: "create",
      formLoading: false,
      formData: this.defaultForm(),
      accountList: [],
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      formRules: {
        accountId: [
          { required: true, message: "邮箱账号不能为空", trigger: "change" },
        ],
        code: [
          { required: true, message: "模板编码不能为空", trigger: "blur" },
        ],
        name: [
          { required: true, message: "模板名称不能为空", trigger: "blur" },
        ],
        title: [
          { required: true, message: "模板标题不能为空", trigger: "blur" },
        ],
        content: [
          { required: true, message: "模板内容不能为空", trigger: "blur" },
        ],
        status: [
          { required: true, message: "开启状态不能为空", trigger: "change" },
        ],
      },
    };
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        name: "",
        code: "",
        accountId: undefined,
        nickname: "",
        title: "",
        content: "",
        status: CommonStatusEnum.ENABLE,
      };
    },
    async open(type, id) {
      this.dialogVisible = true;
      this.formType = type || "create";
      this.dialogTitle =
        this.formType === "update" ? "修改邮件模板" : "添加邮件模板";
      this.formData = this.defaultForm();
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      getSimpleMailAccountList().then((response) => {
        this.accountList = response.data;
      });
      if (id !== undefined && id !== null) {
        this.formLoading = true;
        getMailTemplate(id)
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
            ? createMailTemplate(this.formData)
            : updateMailTemplate(this.formData);
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
