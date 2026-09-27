<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="620px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="90px"
    >
      <el-form-item label="租户名" prop="name"
        ><el-input v-model="formData.name" placeholder="请输入租户名"
      /></el-form-item>
      <el-form-item label="租户套餐" prop="packageId"
        ><el-select
          v-model="formData.packageId"
          clearable
          placeholder="请选择租户套餐"
          ><el-option
            v-for="item in packageList"
            :key="item.id"
            :label="item.name"
            :value="item.id" /></el-select
      ></el-form-item>
      <el-form-item label="联系人" prop="contactName"
        ><el-input v-model="formData.contactName" placeholder="请输入联系人"
      /></el-form-item>
      <el-form-item label="联系手机" prop="contactMobile"
        ><el-input
          v-model="formData.contactMobile"
          maxlength="11"
          placeholder="请输入联系手机"
      /></el-form-item>
      <el-form-item
        v-if="formData.id === undefined"
        label="用户名称"
        prop="username"
        ><el-input v-model="formData.username" placeholder="请输入用户名称"
      /></el-form-item>
      <el-form-item
        v-if="formData.id === undefined"
        label="用户密码"
        prop="password"
        ><el-input
          v-model="formData.password"
          type="password"
          show-password
          placeholder="请输入用户密码"
      /></el-form-item>
      <el-form-item label="账号额度" prop="accountCount"
        ><el-input-number
          v-model="formData.accountCount"
          :min="0"
          controls-position="right"
      /></el-form-item>
      <el-form-item label="过期时间" prop="expireTime"
        ><el-date-picker
          v-model="formData.expireTime"
          type="date"
          value-format="timestamp"
          clearable
          placeholder="请选择过期时间"
      /></el-form-item>
      <el-form-item label="绑定域名"
        ><el-input
          v-model="websitesText"
          placeholder="请输入绑定域名，多个域名用逗号分隔"
          @change="syncWebsites"
      /></el-form-item>
      <el-form-item label="租户状态" prop="status"
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
import { getTenant, createTenant, updateTenant } from "@/api/system/tenant";
import { getTenantPackageList } from "@/api/system/tenantPackage";
import { CommonStatusEnum } from "@/utils/constants";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
export default {
  name: "SystemTenantForm",
  data() {
    return {
      dialogVisible: false,
      dialogTitle: "",
      formType: "create",
      formLoading: false,
      formData: this.defaultForm(),
      packageList: [],
      websitesText: "",
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      formRules: {
        name: [{ required: true, message: "租户名不能为空", trigger: "blur" }],
        packageId: [
          { required: true, message: "租户套餐不能为空", trigger: "change" },
        ],
        contactName: [
          { required: true, message: "联系人不能为空", trigger: "blur" },
        ],
        accountCount: [
          { required: true, message: "账号额度不能为空", trigger: "change" },
        ],
        expireTime: [
          { required: true, message: "过期时间不能为空", trigger: "change" },
        ],
        status: [
          { required: true, message: "租户状态不能为空", trigger: "change" },
        ],
        username: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
        ],
        password: [
          { required: true, message: "用户密码不能为空", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        name: "",
        packageId: undefined,
        contactName: "",
        contactMobile: "",
        accountCount: 0,
        expireTime: undefined,
        websites: [],
        status: CommonStatusEnum.ENABLE,
        username: "",
        password: "",
      };
    },
    async open(type, id) {
      this.dialogVisible = true;
      this.formType = type || "create";
      this.dialogTitle = this.formType === "update" ? "修改租户" : "添加租户";
      this.formData = this.defaultForm();
      this.websitesText = "";
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      getTenantPackageList().then((response) => {
        this.packageList = response.data;
      });
      if (id !== undefined && id !== null) {
        this.formLoading = true;
        getTenant(id)
          .then((response) => {
            this.formData = response.data;
            this.websitesText = (this.formData.websites || []).join(",");
          })
          .finally(() => {
            this.formLoading = false;
          });
      }
    },
    syncWebsites() {
      this.formData.websites = (this.websitesText || "")
        .split(/[,，\s]+/)
        .filter(Boolean);
    },
    submitForm() {
      this.syncWebsites();
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.formLoading = true;
        const request =
          this.formType === "create"
            ? createTenant(this.formData)
            : updateTenant(this.formData);
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
