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
      label-width="85px"
    >
      <el-row>
        <el-col :span="12"
          ><el-form-item label="用户昵称" prop="nickname"
            ><el-input
              v-model="formData.nickname"
              placeholder="请输入用户昵称" /></el-form-item
        ></el-col>
        <el-col :span="12"
          ><el-form-item label="归属部门" prop="deptId"
            ><treeselect
              v-model="formData.deptId"
              :options="deptList"
              :normalizer="normalizer"
              placeholder="请选择归属部门" /></el-form-item
        ></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"
          ><el-form-item label="手机号码" prop="mobile"
            ><el-input
              v-model="formData.mobile"
              maxlength="11"
              placeholder="请输入手机号码" /></el-form-item
        ></el-col>
        <el-col :span="12"
          ><el-form-item label="邮箱" prop="email"
            ><el-input
              v-model="formData.email"
              maxlength="50"
              placeholder="请输入邮箱" /></el-form-item
        ></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"
          ><el-form-item
            v-if="formData.id === undefined"
            label="用户名称"
            prop="username"
            ><el-input
              v-model="formData.username"
              placeholder="请输入用户名称" /></el-form-item
        ></el-col>
        <el-col :span="12"
          ><el-form-item
            v-if="formData.id === undefined"
            label="用户密码"
            prop="password"
            ><el-input
              v-model="formData.password"
              type="password"
              show-password
              placeholder="请输入用户密码" /></el-form-item
        ></el-col>
      </el-row>
      <el-row>
        <el-col :span="12"
          ><el-form-item label="用户性别"
            ><el-select v-model="formData.sex" placeholder="请选择"
              ><el-option
                v-for="dict in sexDictDatas"
                :key="dict.value"
                :label="dict.label"
                :value="Number(dict.value)" /></el-select></el-form-item
        ></el-col>
        <el-col :span="12"
          ><el-form-item label="岗位"
            ><el-select v-model="formData.postIds" multiple placeholder="请选择"
              ><el-option
                v-for="item in postList"
                :key="item.id"
                :label="item.name"
                :value="item.id" /></el-select></el-form-item
        ></el-col>
      </el-row>
      <el-form-item label="备注"
        ><el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入内容"
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
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { getUser, createUser, updateUser } from "@/api/system/user";
import { getSimpleDeptList } from "@/api/system/dept";
import { getSimplePostList } from "@/api/system/post";
import { CommonStatusEnum } from "@/utils/constants";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
export default {
  name: "SystemUserForm",
  components: { Treeselect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: "",
      formType: "create",
      formLoading: false,
      formData: this.defaultForm(),
      deptList: [],
      postList: [],
      sexDictDatas: getDictDatas(DICT_TYPE.SYSTEM_USER_SEX),
      formRules: {
        username: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
        ],
        nickname: [
          { required: true, message: "用户昵称不能为空", trigger: "blur" },
        ],
        password: [
          { required: true, message: "用户密码不能为空", trigger: "blur" },
        ],
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"],
          },
        ],
        mobile: [
          {
            pattern: /^1[3-9]\d{9}$/,
            message: "请输入正确的手机号码",
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
        nickname: "",
        deptId: undefined,
        mobile: "",
        email: "",
        username: "",
        password: "",
        sex: undefined,
        postIds: [],
        remark: "",
        status: CommonStatusEnum.ENABLE,
        roleIds: [],
      };
    },
    normalizer(node) {
      return { id: node.id, label: node.name, children: node.children };
    },
    async open(type, id) {
      this.dialogVisible = true;
      this.formType = type || "create";
      this.dialogTitle = this.formType === "update" ? "修改用户" : "添加用户";
      this.formData = this.defaultForm();
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      Promise.all([getSimpleDeptList(), getSimplePostList()]).then(
        ([depts, posts]) => {
          this.deptList = this.handleTree(depts.data, "id");
          this.postList = posts.data;
        }
      );
      if (id !== undefined && id !== null) {
        this.formLoading = true;
        getUser(id)
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
            ? createUser(this.formData)
            : updateUser(this.formData);
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
