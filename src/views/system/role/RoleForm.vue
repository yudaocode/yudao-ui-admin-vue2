<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="500px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="角色名称" prop="name"
        ><el-input v-model="formData.name" placeholder="请输入角色名称"
      /></el-form-item>
      <el-form-item label="角色标识" prop="code"
        ><el-input v-model="formData.code" placeholder="请输入角色标识"
      /></el-form-item>
      <el-form-item label="显示顺序" prop="sort"
        ><el-input-number
          v-model="formData.sort"
          :min="0"
          controls-position="right"
      /></el-form-item>
      <el-form-item label="状态" prop="status"
        ><el-select v-model="formData.status" clearable placeholder="请选择状态"
          ><el-option
            v-for="dict in statusDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)" /></el-select
      ></el-form-item>
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
import { getRole, createRole, updateRole } from "@/api/system/role";
import { CommonStatusEnum } from "@/utils/constants";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
export default {
  name: "SystemRoleForm",
  data() {
    return {
      dialogVisible: false,
      dialogTitle: "",
      formType: "create",
      formLoading: false,
      formData: this.defaultForm(),
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      formRules: {
        name: [
          { required: true, message: "角色名称不能为空", trigger: "blur" },
        ],
        code: [
          { required: true, message: "角色标识不能为空", trigger: "change" },
        ],
        sort: [
          { required: true, message: "显示顺序不能为空", trigger: "change" },
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
        name: "",
        code: "",
        sort: 0,
        status: CommonStatusEnum.ENABLE,
        remark: "",
      };
    },
    open(type, id) {
      this.dialogVisible = true;
      this.formType = type || "create";
      this.dialogTitle = this.formType === "update" ? "修改角色" : "添加角色";
      this.formData = this.defaultForm();
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      if (id !== undefined && id !== null) {
        this.formLoading = true;
        getRole(id)
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
            ? createRole(this.formData)
            : updateRole(this.formData);
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
