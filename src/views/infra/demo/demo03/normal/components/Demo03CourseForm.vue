<template>
  <div class="app-container">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      v-loading="formLoading"
      label-width="0px"
      :inline-message="true"
    >
      <el-table :data="formData" class="-mt-10px">
        <el-table-column label="序号" type="index" width="100"/>
        <el-table-column label="名字" min-width="150">
          <template v-slot="{ row, $index }">
            <el-form-item :prop="`${$index}.name`" :rules="formRules.name" class="mb-0px!">
              <el-input v-model="row.name" placeholder="请输入名字"/>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="分数" min-width="150">
          <template v-slot="{ row, $index }">
            <el-form-item :prop="`${$index}.score`" :rules="formRules.score" class="mb-0px!">
              <el-input v-model="row.score" placeholder="请输入分数"/>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="60">
          <template v-slot="{ $index }">
            <el-link @click="handleDelete($index)">—</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <el-row justify="center" class="mt-3">
      <el-button @click="handleAdd" round>+ 添加学生课程</el-button>
    </el-row>
  </div>
</template>

<script>
import * as Demo03StudentApi from '@/api/infra/demo03-normal';

export default {
  name: "Demo03CourseForm",
  components: {},
  props: [
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
        score: [{ required: true, message: "分数不能为空", trigger: "blur" }],
      },
    };
  },
  watch: {
    /** 监听主表的关联字段的变化，加载对应的子表数据 */
    studentId: {
      handler(val) {
        // 1. 重置表单
        this.formData = []
        // 2. val 非空，则加载数据
        if (!val) {
          return;
        }
        try {
          this.formLoading = true;
          // 这里还是需要获取一下 this 的不然取不到 formData
          const that = this;
          Demo03StudentApi.getDemo03CourseListByStudentId(val).then(function (res) {
            that.formData = res.data;
          })
        } finally {
          this.formLoading = false;
        }
      },
      immediate: true
    }
  },
  methods: {
    /** 新增按钮操作 */
    handleAdd() {
      const row = {
        id: undefined,
        studentId: undefined,
        name: undefined,
        score: undefined,
      }
      row.studentId = this.studentId;
      this.formData.push(row);
    },
    /** 删除按钮操作 */
    handleDelete(index) {
      this.formData.splice(index, 1);
    },
    /** 表单校验 */
    validate() {
      return this.$refs["formRef"].validate();
    },
    /** 表单值 */
    getData() {
      return this.formData;
    }
  }
};
</script>
