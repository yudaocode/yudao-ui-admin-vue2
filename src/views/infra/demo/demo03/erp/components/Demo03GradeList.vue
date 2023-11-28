<template>
  <div class="app-container">
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="openForm(undefined)"
                   v-hasPermi="['infra:demo03-student:create']">新增</el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="名字" align="center" prop="name" />
      <el-table-column label="班主任" align="center" prop="teacher" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="openForm(scope.row.id)"
                     v-hasPermi="['infra:demo03-student:update']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['infra:demo03-student:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
    <!-- 对话框(添加 / 修改) -->
    <Demo03GradeForm ref="formRef" @success="getList" />
  </div>
</template>

<script>
import * as Demo03StudentApi from '@/api/infra/demo03-erp';
import Demo03GradeForm from './Demo03GradeForm.vue';
export default {
  name: "Demo03GradeList",
  components: {
    Demo03GradeForm
  },
  props:[
    'studentId'
  ],// 学生编号（主表的关联字段）
  data() {
    return {
      // 遮罩层
      loading: true,
      // 列表的数据
      list: [],
      // 列表的总页数
      total: 0,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        studentId: undefined
      }
    };
  },
  watch:{/** 监听主表的关联字段的变化，加载对应的子表数据 */
    studentId:{
      handler(val) {
        this.queryParams.studentId = val;
        if (val){
          this.handleQuery();
        }
      },
      immediate: true
    }
  },
  methods: {
    /** 查询列表 */
    async getList() {
      try {
        this.loading = true;
        const res = await Demo03StudentApi.getDemo03GradePage(this.queryParams);
        this.list = res.data.list;
        this.total = res.data.total;
      } finally {
        this.loading = false;
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 添加/修改操作 */
    openForm(id) {
      if (!this.studentId) {
        this.$modal.msgError('请选择一个学生');
        return;
      }
      this.$refs["formRef"].open(id, this.studentId);
    },
    /** 删除按钮操作 */
    async handleDelete(row) {
      const id = row.id;
      await this.$modal.confirm('是否确认删除学生编号为"' + id + '"的数据项?');
      try {
        await Demo03StudentApi.deleteDemo03Grade(id);
        await this.getList();
        this.$modal.msgSuccess("删除成功");
      } catch {}
    },
  }
};
</script>
