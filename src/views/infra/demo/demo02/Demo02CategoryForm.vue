<template>
  <div class="app-container">
    <!-- 对话框(添加 / 修改) -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="45%" v-dialogDrag append-to-body>
      <el-form ref="formRef" :model="formData" :rules="formRules" v-loading="formLoading" label-width="100px">
        <el-form-item label="名字" prop="name">
          <el-input v-model="formData.name" placeholder="请输入名字" />
        </el-form-item>
        <el-form-item label="父级编号" prop="parentId">
          <TreeSelect
              v-model="formData.parentId"
              :options="demo02CategoryTree"
              :normalizer="normalizer"
              placeholder="请选择父级编号"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" :disabled="formLoading">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as Demo02CategoryApi from '@/api/infra/demo02'
import TreeSelect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  name: "Demo02CategoryForm",
  components: {
    TreeSelect,
  },
  data() {
    return {
      // 弹出层标题
      dialogTitle: "",
      // 是否显示弹出层
      dialogVisible: false,
      // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
      formLoading: false,
      // 表单参数
      formData: {
        id: undefined,
        name: undefined,
        parentId: undefined,
      },
      // 表单校验
      formRules: {
        name: [{ required: true, message: '名字不能为空', trigger: 'blur' }],
        parentId: [{ required: true, message: '父级编号不能为空', trigger: 'blur' }],
      },
      demo02CategoryTree: [], // 树形结构
    };
  },
  methods: {
    /** 打开弹窗 */
    async open(id) {
      this.dialogVisible = true;
      this.reset();
      // 修改时，设置数据
      if (id) {
        this.formLoading = true;
        try {
          const res = await Demo02CategoryApi.getDemo02Category(id);
          this.formData = res.data;
          this.title = "修改示例分类";
        } finally {
          this.formLoading = false;
        }
      }
      this.title = "新增示例分类";
      this.getDemo02CategoryTree();
    },
    /** 提交按钮 */
    async submitForm() {
      // 校验主表
      await this.$refs["formRef"].validate();
      this.formLoading = true;
      try {
        const data = this.formData;
        // 修改的提交
        if (data.id) {
          await Demo02CategoryApi.updateDemo02Category(data);
          this.$modal.msgSuccess("修改成功");
          this.dialogVisible = false;
          this.$emit('success');
          return;
        }
        // 添加的提交
        await Demo02CategoryApi.createDemo02Category(data);
        this.$modal.msgSuccess("新增成功");
        this.dialogVisible = false;
        this.$emit('success');
      }finally {
        this.formLoading = false;
      }
    },
    /** 获得示例分类树 */
    async getDemo02CategoryTree() {
      this.demo02CategoryTree = [];
      const res = await Demo02CategoryApi.getDemo02CategoryList();
      const root = { id: 0, name: '顶级示例分类', children: [] };
      root.children = this.handleTree(res.data, 'id', 'parentId')
      this.demo02CategoryTree.push(root)
    },
    /** 转换示例分类数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      };
    },
    /** 表单重置 */
    reset() {
      this.formData = {
        id: undefined,
        name: undefined,
        parentId: undefined,
      };
      this.resetForm("formRef");
    }
  }
};
</script>
