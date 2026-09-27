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
      label-width="80px"
    >
      <el-form-item label="岗位标题" prop="name"
        ><el-input v-model="formData.name" placeholder="请输入岗位标题"
      /></el-form-item>
      <el-form-item label="岗位编码" prop="code"
        ><el-input v-model="formData.code" placeholder="请输入岗位编码"
      /></el-form-item>
      <el-form-item label="岗位顺序" prop="sort"
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
          placeholder="请输入备注"
          type="textarea"
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
import { getPost, createPost, updatePost } from "@/api/system/post";
import { CommonStatusEnum } from "@/utils/constants";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
export default {
  name: "SystemPostForm",
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
          { required: true, message: "岗位标题不能为空", trigger: "blur" },
        ],
        code: [
          { required: true, message: "岗位编码不能为空", trigger: "change" },
        ],
        status: [
          { required: true, message: "岗位状态不能为空", trigger: "change" },
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
      this.dialogTitle = this.formType === "update" ? "修改岗位" : "添加岗位";
      this.formData = this.defaultForm();
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      if (id !== undefined && id !== null) {
        this.formLoading = true;
        getPost(id)
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
            ? createPost(this.formData)
            : updatePost(this.formData);
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
