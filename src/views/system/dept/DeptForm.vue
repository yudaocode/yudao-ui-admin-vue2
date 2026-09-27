<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="600px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="90px"
    >
      <el-form-item label="上级部门" prop="parentId">
        <treeselect
          v-model="formData.parentId"
          :options="deptTree"
          :normalizer="normalizer"
          placeholder="请选择上级部门"
        />
      </el-form-item>
      <el-form-item label="部门名称" prop="name"
        ><el-input v-model="formData.name" placeholder="请输入部门名称"
      /></el-form-item>
      <el-form-item label="显示排序" prop="sort"
        ><el-input-number
          v-model="formData.sort"
          :min="0"
          controls-position="right"
      /></el-form-item>
      <el-form-item label="负责人" prop="leaderUserId"
        ><el-select
          v-model="formData.leaderUserId"
          clearable
          placeholder="请输入负责人"
          ><el-option
            v-for="item in userList"
            :key="item.id"
            :label="item.nickname"
            :value="item.id" /></el-select
      ></el-form-item>
      <el-form-item label="联系电话" prop="phone"
        ><el-input
          v-model="formData.phone"
          maxlength="11"
          placeholder="请输入联系电话"
      /></el-form-item>
      <el-form-item label="邮箱" prop="email"
        ><el-input
          v-model="formData.email"
          maxlength="50"
          placeholder="请输入邮箱"
      /></el-form-item>
      <el-form-item label="状态" prop="status"
        ><el-select v-model="formData.status" clearable placeholder="请选择状态"
          ><el-option
            v-for="dict in statusDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)" /></el-select
      ></el-form-item>
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
import {
  getDept,
  createDept,
  updateDept,
  getSimpleDeptList,
} from "@/api/system/dept";
import { getSimpleUserList } from "@/api/system/user";
import { CommonStatusEnum } from "@/utils/constants";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";

export default {
  name: "SystemDeptForm",
  components: { Treeselect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: "",
      formType: "create",
      formLoading: false,
      formData: this.defaultForm(),
      deptTree: [],
      userList: [],
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      formRules: {
        parentId: [
          { required: true, message: "上级部门不能为空", trigger: "change" },
        ],
        name: [
          { required: true, message: "部门名称不能为空", trigger: "blur" },
        ],
        sort: [
          { required: true, message: "显示排序不能为空", trigger: "blur" },
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "change" },
        ],
      },
    };
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        parentId: undefined,
        name: "",
        sort: 0,
        leaderUserId: undefined,
        phone: "",
        email: "",
        status: CommonStatusEnum.ENABLE,
      };
    },
    normalizer(node) {
      return { id: node.id, label: node.name, children: node.children };
    },
    async open(type, id, parentId) {
      this.dialogVisible = true;
      this.formType = type || "create";
      this.dialogTitle = this.formType === "update" ? "修改部门" : "添加部门";
      this.formData = this.defaultForm();
      if (parentId !== undefined && parentId !== null)
        this.formData.parentId = parentId;
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      const [deptResponse, users] = await Promise.all([
        getSimpleDeptList(),
        getSimpleUserList(),
      ]);
      const departments = deptResponse.data;
      this.deptTree = this.handleTree(departments, "id");
      if (departments.length === 0 || departments.some((dept) => dept.parentId === 0)) {
        this.deptTree = [{ id: 0, name: "顶级部门", children: this.deptTree }];
      }
      this.userList = users.data;
      if (id !== undefined && id !== null) {
        this.formLoading = true;
        getDept(id)
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
            ? createDept(this.formData)
            : updateDept(this.formData);
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
