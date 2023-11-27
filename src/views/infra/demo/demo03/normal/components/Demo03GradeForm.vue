<template>
  <div class="app-container">
    <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        v-loading="formLoading"
    >
      <el-form-item label="名字" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名字" />
      </el-form-item>
      <el-form-item label="班主任" prop="teacher">
        <el-input v-model="formData.teacher" placeholder="请输入班主任" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import * as Demo03StudentApi from '@/api/infra/demo03-normal'
export default {
  name: "Demo03GradeForm",
  components: {
  },
  props:[
    'studentId'
  ],// 学生编号（主表的关联字段）
  data() {
    return {
      // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
      formLoading: false,
      // 表单参数
      formData: [],
      // 表单校验
      formRules: {
        studentId: [{ required: true, message: "学生编号不能为空", trigger: "blur" }],
        name: [{ required: true, message: "名字不能为空", trigger: "blur" }],
        teacher: [{ required: true, message: "班主任不能为空", trigger: "blur" }],
      },
    };
  },
  watch:{/** 监听主表的关联字段的变化，加载对应的子表数据 */
    studentId:{
      handler(val) {
        // 1. 重置表单
        this.formData = {
          id: undefined,
          studentId: undefined,
          name: undefined,
          teacher: undefined,
        }
        // 2. val 非空，则加载数据
        if (!val) {
          return;
        }
        try {
          this.formLoading = true;
          // 这里还是需要获取一下 this 的不然取不到 formData
          const that = this;
          Demo03StudentApi.getDemo03GradeByStudentId(val).then(function (res){
            const data = res.data;
            if (!data) {
              return
            }
            that.formData = data;
          })
        } finally {
          this.formLoading = false;
        }
      },
      immediate: true
    }
  },
  methods: {
    /** 表单校验 */
    validate(){
      return this.$refs["formRef"].validate();
    },
    /** 表单值 */
    getData(){
      return this.formData;
    }
  }
};
</script>
