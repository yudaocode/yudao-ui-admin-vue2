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
      <el-form-item label="套餐名" prop="name"
        ><el-input v-model="formData.name" placeholder="请输入套餐名"
      /></el-form-item>
      <el-form-item label="菜单权限" prop="menuIds"
        ><el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll"
          >全选/全不选</el-checkbox
        ><el-tree
          ref="menu"
          class="tree-border"
          :data="menuOptions"
          show-checkbox
          node-key="id"
          :props="defaultProps"
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
import {
  getTenantPackage,
  createTenantPackage,
  updateTenantPackage,
} from "@/api/system/tenantPackage";
import { getSimpleMenusList } from "@/api/system/menu";
import { CommonStatusEnum } from "@/utils/constants";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
export default {
  name: "SystemTenantPackageForm",
  data() {
    return {
      dialogVisible: false,
      dialogTitle: "",
      formType: "create",
      formLoading: false,
      formData: this.defaultForm(),
      menuOptions: [],
      menuNodeAll: false,
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      defaultProps: { label: "name", children: "children" },
      formRules: {
        name: [{ required: true, message: "套餐名不能为空", trigger: "blur" }],
        status: [
          { required: true, message: "状态不能为空", trigger: "change" },
        ],
        menuIds: [
          {
            required: true,
            message: "关联的菜单编号不能为空",
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
        name: "",
        status: CommonStatusEnum.ENABLE,
        remark: "",
        menuIds: [],
      };
    },
    async open(type, id) {
      this.dialogVisible = true;
      this.formType = type || "create";
      this.dialogTitle =
        this.formType === "update" ? "修改租户套餐" : "添加租户套餐";
      this.formData = this.defaultForm();
      this.menuNodeAll = false;
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      getSimpleMenusList().then((response) => {
        this.menuOptions = this.handleTree(response.data, "id");
        if (id !== undefined && id !== null) this.loadDetail(id);
      });
      if (id === undefined || id === null) return;
    },
    loadDetail(id) {
      this.formLoading = true;
      getTenantPackage(id)
        .then((response) => {
          this.formData = response.data;
          this.$nextTick(() => {
            if (this.$refs.menu)
              this.$refs.menu.setCheckedKeys(this.formData.menuIds || []);
          });
        })
        .finally(() => {
          this.formLoading = false;
        });
    },
    handleCheckedTreeNodeAll(value) {
      if (this.$refs.menu)
        this.$refs.menu.setCheckedNodes(value ? this.menuOptions : []);
    },
    submitForm() {
      const checked = this.$refs.menu
        ? this.$refs.menu
            .getCheckedKeys()
            .concat(this.$refs.menu.getHalfCheckedKeys())
        : [];
      this.formData.menuIds = checked;
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.formLoading = true;
        const request =
          this.formType === "create"
            ? createTenantPackage(this.formData)
            : updateTenantPackage(this.formData);
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
