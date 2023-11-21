<template>
  <div class="app-container">
    <!-- 对话框(添加 / 修改) -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="45%" v-dialogDrag append-to-body>
      <el-form ref="formRef" :model="formData" :rules="formRules" v-loading="formLoading" label-width="100px">
        <el-form-item label="名字" prop="name">
          <el-input v-model="formData.name" placeholder="请输入名字" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="formData.sex">
            <el-radio v-for="dict in this.getDictDatas(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="dict.value" :label="dict.value">{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生年" prop="birthday">
          <el-date-picker clearable v-model="formData.birthday" type="date" value-format="timestamp" placeholder="选择出生年" />
        </el-form-item>
        <el-form-item label="简介">
          <Editor v-model="formData.description" :min-height="192"/>
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-input v-model="formData.avatar" placeholder="请输入头像" />
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
import * as Demo01ContactApi from '@/api/infra/demo01'
import Editor from '@/components/Editor';
export default {
  name: "Demo01ContactForm",
  components: {
    Editor,
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
        sex: undefined,
        birthday: undefined,
        description: undefined,
        avatar: undefined,
      },
      // 表单校验
      formRules: {
        name: [{ required: true, message: '名字不能为空', trigger: 'blur' }],
        sex: [{ required: true, message: '性别不能为空', trigger: 'blur' }],
        birthday: [{ required: true, message: '出生年不能为空', trigger: 'blur' }],
        description: [{ required: true, message: '简介不能为空', trigger: 'blur' }],
      },
    };
  },
  methods: {
    /** 打开弹窗 */
    open(id) {
      this.dialogVisible = true;
      this.reset();
      const that = this;
      // 修改时，设置数据
      if (id) {
        this.formLoading = true;
        try {
          Demo01ContactApi.getDemo01Contact(id).then(res=>{
            that.formData = res.data;
            that.title = "修改示例联系人";
          })
        } finally {
          this.formLoading = false;
        }
      }
      this.title = "新增示例联系人";
    },

    /** 提交按钮 */
    submitForm() {
      this.formLoading = true;
      try {
        const that = this;
        let data = this.formData;

        this.getRef("formRef").validate(valid => {
          if (!valid) {
            return;
          }
          // 修改的提交
          if (data.id) {
            Demo01ContactApi.updateDemo01Contact(data).then(response => {
              that.$modal.msgSuccess("修改成功");
              that.dialogVisible = false;
              that.$emit('success');
            });
            return;
          }
          // 添加的提交
          Demo01ContactApi.createDemo01Contact(data).then(response => {
            that.$modal.msgSuccess("新增成功");
            that.dialogVisible = false;
            that.$emit('success');
          });
        });
      }finally {
        this.formLoading = false
      }
    },
    getRef(refName){ // TODO puhui999: 获得表单 ref，提取出来的目的呢是解决 $ 在 if 中 end闭合不了的问题，代码生成后可删除此方法
      return this.$refs[refName]
    },
    /** 表单重置 */
    reset() {
      this.formData = {
        id: undefined,
        name: undefined,
        sex: undefined,
        birthday: undefined,
        description: undefined,
        avatar: undefined,
      };
      this.resetForm("formRef");
    },
  }
};
</script>
