<template>
  <div class="app-container">
    <!-- 对话框(添加 / 修改) -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="45%" v-dialogDrag append-to-body>
      <el-form ref="formRef" :model="formData" :rules="formRules" v-loading="formLoading" label-width="100px">
        <el-form-item label="名字" prop="name">
          <el-input v-model="formData.name" placeholder="请输入名字" />
        </el-form-item>
        <el-form-item label="班主任" prop="teacher">
          <el-input v-model="formData.teacher" placeholder="请输入班主任" />
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
import * as Demo03StudentApi from '@/api/infra/demo03-erp';
export default {
  name: "Demo03GradeForm",
  components: {
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
        studentId: undefined,
        name: undefined,
        teacher: undefined,
      },
      // 表单校验
      formRules: {
        studentId: [{ required: true, message: "学生编号不能为空", trigger: "blur" }],
        name: [{ required: true, message: "名字不能为空", trigger: "blur" }],
        teacher: [{ required: true, message: "班主任不能为空", trigger: "blur" }],
      },
    };
  },
  methods: {
    /** 打开弹窗 */
    async open(id, studentId) {
      this.dialogVisible = true;
      this.reset();
      this.formData.studentId = studentId;
      // 修改时，设置数据
      if (id) {
        this.formLoading = true;
        try {
          const res = await Demo03StudentApi.getDemo03Grade(id);
          this.formData = res.data;
          this.dialogTitle = "修改学生班级";
        } finally {
          this.formLoading = false;
        }
      }
      this.dialogTitle = "新增学生班级";
    },
    /** 提交按钮 */
    async submitForm() {
      await this.$refs["formRef"].validate();
      this.formLoading = true;
      try {
        const data = this.formData;
        // 修改的提交
        if (data.id) {
          await  Demo03StudentApi.updateDemo03Grade(data);
          this.$modal.msgSuccess("修改成功");
          this.dialogVisible = false;
          this.$emit('success');
          return;
        }
        // 添加的提交
        await Demo03StudentApi.createDemo03Grade(data);
        this.$modal.msgSuccess("新增成功");
        this.dialogVisible = false;
        this.$emit('success');
      }finally {
        this.formLoading = false;
      }
    },
    /** 表单重置 */
    reset() {
      this.formData = {
        id: undefined,
        studentId: undefined,
        name: undefined,
        teacher: undefined,
      };
      this.resetForm("formRef");
    },
  }
};
</script>
