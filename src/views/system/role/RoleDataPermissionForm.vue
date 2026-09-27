<template>
  <Dialog
    title="数据权限"
    v-model="dialogVisible"
    :width="800"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      label-width="80px"
    >
      <el-form-item label="角色名称"
        ><el-tag>{{ formData.name }}</el-tag></el-form-item
      >
      <el-form-item label="角色标识"
        ><el-tag>{{ formData.code }}</el-tag></el-form-item
      >
      <el-form-item label="权限范围"
        ><el-select v-model="formData.dataScope"
          ><el-option
            v-for="item in scopeDictDatas"
            :key="item.value"
            :label="item.label"
            :value="Number(item.value)" /></el-select
      ></el-form-item>
      <el-form-item
        v-if="formData.dataScope === SystemDataScopeEnum.DEPT_CUSTOM"
        label="部门范围"
        ><el-card shadow="never" style="width: 100%; height: 400px; overflow-y: auto"
          ><div slot="header">
            全选/全不选
            <el-switch
              v-model="treeNodeAll"
              active-text="是"
              inactive-text="否"
              @change="handleCheckedTreeNodeAll"
            />
            全部展开/折叠
            <el-switch v-model="deptExpand" active-text="展开" inactive-text="折叠" @change="handleCheckedTreeExpand" />
            父子联动(选中父节点，自动选择子节点)
            <el-switch v-model="checkStrictly" active-text="是" inactive-text="否" />
          </div>
          <el-tree
            ref="tree"
            :data="deptOptions"
            :props="defaultProps"
            node-key="id"
            show-checkbox
            default-expand-all
            empty-text="加载中，请稍后"
            :check-strictly="!checkStrictly" /></el-card
      ></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="formLoading" @click="submitForm"
        >确 定</el-button
      ><el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>
<script>
import { getSimpleDeptList } from "@/api/system/dept";
import { assignRoleDataScope } from "@/api/system/permission";
import { SystemDataScopeEnum } from "@/utils/constants";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
import Dialog from "@/components/Dialog/index.vue";
export default {
  name: "SystemRoleDataPermissionForm",
  components: { Dialog },
  data() {
    return {
      SystemDataScopeEnum,
      DICT_TYPE,
      dialogVisible: false,
      formLoading: false,
      formData: {
        id: undefined,
        name: "",
        code: "",
        dataScope: undefined,
        dataScopeDeptIds: [],
      },
      deptOptions: [],
      defaultProps: { label: "name", children: "children" },
      scopeDictDatas: getDictDatas(DICT_TYPE.SYSTEM_DATA_SCOPE),
      deptExpand: true,
      treeNodeAll: false,
      checkStrictly: true,
    };
  },
  methods: {
    async open(row) {
      this.dialogVisible = true;
      this.resetForm();
      this.formLoading = true;
      try {
        const response = await getSimpleDeptList();
        this.deptOptions = this.handleTree(response.data, "id");
        this.formData.id = row.id;
        this.formData.name = row.name;
        this.formData.code = row.code;
        this.formData.dataScope = row.dataScope;
        await this.$nextTick();
        row.dataScopeDeptIds?.forEach((deptId) => {
          this.$refs.tree.setChecked(deptId, true, false);
        });
      } finally {
        this.formLoading = false;
      }
    },
    resetForm() {
      this.treeNodeAll = false;
      this.deptExpand = true;
      this.checkStrictly = true;
      this.formData = {
        id: undefined,
        name: "",
        code: "",
        dataScope: undefined,
        dataScopeDeptIds: [],
      };
      if (this.$refs.tree) this.$refs.tree.setCheckedNodes([]);
      if (this.$refs.form) this.$refs.form.resetFields();
    },
    handleCheckedTreeNodeAll(value) {
      if (this.$refs.tree)
        this.$refs.tree.setCheckedNodes(value ? this.deptOptions : []);
    },
    handleCheckedTreeExpand(value) {
      const nodes = this.$refs.tree && this.$refs.tree.store.nodesMap;
      if (!nodes) return;
      Object.keys(nodes).forEach((key) => {
        nodes[key].expanded = value;
      });
    },
    submitForm() {
      const dataScopeDeptIds =
        this.formData.dataScope === SystemDataScopeEnum.DEPT_CUSTOM &&
        this.$refs.tree
          ? this.$refs.tree.getCheckedKeys(false)
          : [];
      this.formLoading = true;
      assignRoleDataScope({
        roleId: this.formData.id,
        dataScope: this.formData.dataScope,
        dataScopeDeptIds,
      })
        .then(() => {
          this.$modal.msgSuccess("修改成功");
          this.dialogVisible = false;
          this.$emit("success");
        })
        .finally(() => {
          this.formLoading = false;
        });
    },
  },
};
</script>
