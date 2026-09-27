<template>
  <Dialog
    :title="title"
    v-model="dialogVisible"
    append-to-body
    @closed="reset"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="应用名" prop="name">
        <el-input v-model="form.name" placeholder="请输入应用名" />
      </el-form-item>
      <el-form-item label="社交平台" prop="socialType">
        <el-radio-group v-model="form.socialType">
          <el-radio
            v-for="item in getDictDatas(DICT_TYPE.SYSTEM_SOCIAL_TYPE)"
            :key="item.value"
            :label="toNumber(item.value)"
            >{{ item.label }}</el-radio
          >
        </el-radio-group>
      </el-form-item>
      <el-form-item label="用户类型" prop="userType">
        <el-radio-group v-model="form.userType">
          <el-radio
            v-for="item in getDictDatas(DICT_TYPE.USER_TYPE)"
            :key="item.value"
            :label="toNumber(item.value)"
            >{{ item.label }}</el-radio
          >
        </el-radio-group>
      </el-form-item>
      <el-form-item label="客户端编号" prop="clientId">
        <el-input
          v-model="form.clientId"
          placeholder="请输入客户端编号，对应各平台的 appKey"
        />
      </el-form-item>
      <el-form-item label="客户端密钥" prop="clientSecret">
        <el-input
          v-model="form.clientSecret"
          show-password
          placeholder="请输入客户端密钥，对应各平台的 appSecret"
        />
      </el-form-item>
      <el-form-item
        v-if="Number(form.socialType) === 30"
        label="agentId"
        prop="agentId"
      >
        <el-input
          v-model="form.agentId"
          placeholder="授权方的网页应用 ID，有则填"
        />
      </el-form-item>
      <el-form-item
        v-if="Number(form.socialType) === 40"
        label="publicKey"
        prop="publicKey"
      >
        <el-input
          v-model="form.publicKey"
          placeholder="请输入 publicKey 公钥"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="item in getDictDatas(DICT_TYPE.COMMON_STATUS)"
            :key="item.value"
            :label="toNumber(item.value)"
            >{{ item.label }}</el-radio
          >
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm"
        >确 定</el-button
      >
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import {
  createSocialClient,
  getSocialClient,
  updateSocialClient,
} from "@/api/system/social/client";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
import { CommonStatusEnum } from "@/utils/constants";
import Dialog from "@/components/Dialog";

export default {
  name: "SocialClientForm",
  components: { Dialog },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      title: "",
      formType: "",
      formLoading: false,
      form: this.defaultForm(),
      rules: {
        name: [{ required: true, message: "应用名不能为空", trigger: "blur" }],
        socialType: [
          { required: true, message: "社交平台不能为空", trigger: "change" },
        ],
        userType: [
          { required: true, message: "用户类型不能为空", trigger: "change" },
        ],
        clientId: [
          { required: true, message: "客户端编号不能为空", trigger: "blur" },
        ],
        clientSecret: [
          { required: true, message: "客户端密钥不能为空", trigger: "blur" },
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "change" },
        ],
      },
    };
  },
  methods: {
    getDictDatas,
    toNumber(value) {
      const number = Number(value);
      return Number.isNaN(number) ? value : number;
    },
    defaultForm() {
      return {
        id: undefined,
        name: undefined,
        socialType: undefined,
        userType: undefined,
        clientId: undefined,
        clientSecret: undefined,
        agentId: undefined,
        publicKey: undefined,
        status: Number(CommonStatusEnum.ENABLE),
      };
    },
    async open(type, id) {
      this.formType = type;
      this.title = type === "update" ? "修改社交客户端" : "添加社交客户端";
      this.form = this.defaultForm();
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      if (id !== undefined && id !== null) {
        this.formLoading = true;
        try {
          const response = await getSocialClient(id);
          this.form = response.data;
        } finally {
          this.formLoading = false;
        }
      }
    },
    reset() {
      this.form = this.defaultForm();
      this.formType = "";
      this.formLoading = false;
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
    },
    async submitForm() {
      const valid = await new Promise(resolve => this.$refs.form.validate(resolve));
      if (!valid) return;
      this.formLoading = true;
      try {
        const isCreate = this.formType === "create";
        const action = isCreate ? createSocialClient : updateSocialClient;
        await action(this.form);
        this.$message.success(isCreate ? "新增成功" : "修改成功");
        this.dialogVisible = false;
        this.$emit("success");
      } finally {
        this.formLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
