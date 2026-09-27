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
      label-width="170px"
    >
      <el-form-item label="客户端编号" prop="clientId"
        ><el-input v-model="formData.clientId" placeholder="请输入客户端编号"
      /></el-form-item>
      <el-form-item label="客户端密钥" prop="secret"
        ><el-input
          v-model="formData.secret"
          show-password
          placeholder="请输入客户端密钥"
      /></el-form-item>
      <el-form-item label="应用名" prop="name"
        ><el-input v-model="formData.name" placeholder="请输入应用名"
      /></el-form-item>
      <el-form-item label="应用图标"
        ><el-input v-model="formData.logo" placeholder="请输入应用图标 URL"
      /></el-form-item>
      <el-form-item label="应用描述"
        ><el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入应用描述"
      /></el-form-item>
      <el-form-item label="状态" prop="status"
        ><el-radio-group v-model="formData.status"
          ><el-radio
            v-for="dict in statusDictDatas"
            :key="dict.value"
            :label="Number(dict.value)"
            >{{ dict.label }}</el-radio
          ></el-radio-group
        ></el-form-item
      >
      <el-form-item label="访问令牌的有效期" prop="accessTokenValiditySeconds"
        ><el-input-number
          v-model="formData.accessTokenValiditySeconds"
          :min="1"
      /></el-form-item>
      <el-form-item label="刷新令牌的有效期" prop="refreshTokenValiditySeconds"
        ><el-input-number
          v-model="formData.refreshTokenValiditySeconds"
          :min="1"
      /></el-form-item>
      <el-form-item label="授权类型" prop="authorizedGrantTypes"
        ><el-select
          v-model="formData.authorizedGrantTypes"
          multiple
          filterable
          allow-create
          placeholder="请输入授权类型"
          ><el-option
            v-for="dict in grantDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value" /></el-select
      ></el-form-item>
      <el-form-item label="授权范围"
        ><el-select
          v-model="formData.scopes"
          multiple
          filterable
          allow-create
          placeholder="请输入授权范围"
          ><el-option
            v-for="scope in formData.scopes"
            :key="scope"
            :label="scope"
            :value="scope" /></el-select
      ></el-form-item>
      <el-form-item label="自动授权范围"
        ><el-select
          v-model="formData.autoApproveScopes"
          multiple
          filterable
          allow-create
          placeholder="请输入授权范围"
          ><el-option
            v-for="scope in formData.scopes"
            :key="scope"
            :label="scope"
            :value="scope" /></el-select
      ></el-form-item>
      <el-form-item label="可重定向的 URI 地址" prop="redirectUris"
        ><el-select
          v-model="formData.redirectUris"
          multiple
          filterable
          allow-create
          placeholder="请输入 URI"
          ><el-option
            v-for="item in formData.redirectUris"
            :key="item"
            :label="item"
            :value="item" /></el-select
      ></el-form-item>
      <el-form-item label="权限"
        ><el-select
          v-model="formData.authorities"
          multiple
          filterable
          allow-create
          placeholder="请输入权限"
          ><el-option
            v-for="item in formData.authorities"
            :key="item"
            :label="item"
            :value="item" /></el-select
      ></el-form-item>
      <el-form-item label="资源"
        ><el-select
          v-model="formData.resourceIds"
          multiple
          filterable
          allow-create
          placeholder="请输入资源"
          ><el-option
            v-for="item in formData.resourceIds"
            :key="item"
            :label="item"
            :value="item" /></el-select
      ></el-form-item>
      <el-form-item label="附加信息"
        ><el-input
          v-model="formData.additionalInformation"
          type="textarea"
          placeholder="请输入附加信息，JSON 格式数据"
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
  getOAuth2Client,
  createOAuth2Client,
  updateOAuth2Client,
} from "@/api/system/oauth2/oauth2Client";
import { CommonStatusEnum } from "@/utils/constants";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
export default {
  name: "SystemOAuth2ClientForm",
  data() {
    return {
      dialogVisible: false,
      dialogTitle: "",
      formType: "create",
      formLoading: false,
      formData: this.defaultForm(),
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      grantDictDatas: getDictDatas(DICT_TYPE.SYSTEM_OAUTH2_GRANT_TYPE),
      formRules: {
        clientId: [
          { required: true, message: "客户端编号不能为空", trigger: "blur" },
        ],
        secret: [
          { required: true, message: "客户端密钥不能为空", trigger: "blur" },
        ],
        name: [{ required: true, message: "应用名不能为空", trigger: "blur" }],
        status: [
          { required: true, message: "状态不能为空", trigger: "change" },
        ],
        accessTokenValiditySeconds: [
          {
            required: true,
            message: "访问令牌的有效期不能为空",
            trigger: "change",
          },
        ],
        refreshTokenValiditySeconds: [
          {
            required: true,
            message: "刷新令牌的有效期不能为空",
            trigger: "change",
          },
        ],
        authorizedGrantTypes: [
          { required: true, message: "授权类型不能为空", trigger: "change" },
        ],
        redirectUris: [
          {
            required: true,
            message: "可重定向的 URI 地址不能为空",
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
        clientId: "",
        secret: "",
        name: "",
        logo: "",
        description: "",
        status: CommonStatusEnum.ENABLE,
        accessTokenValiditySeconds: 1800,
        refreshTokenValiditySeconds: 2592000,
        redirectUris: [],
        authorizedGrantTypes: [],
        scopes: [],
        autoApproveScopes: [],
        authorities: [],
        resourceIds: [],
        additionalInformation: "",
      };
    },
    open(type, id) {
      this.dialogVisible = true;
      this.formType = type || "create";
      this.dialogTitle =
        this.formType === "update"
          ? "修改 OAuth2 客户端"
          : "添加 OAuth2 客户端";
      this.formData = this.defaultForm();
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      if (id !== undefined && id !== null) {
        this.formLoading = true;
        getOAuth2Client(id)
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
            ? createOAuth2Client(this.formData)
            : updateOAuth2Client(this.formData);
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
