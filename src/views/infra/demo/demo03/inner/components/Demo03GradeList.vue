<template>
  <div class="app-container">
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
  </div>
</template>

<script>
import * as Demo03StudentApi from '@/api/infra/demo03-inner'
export default {
  name: "Demo03GradeList",
  props:[
    'studentId'
  ],// 学生编号（主表的关联字段）
  data() {
    return {
      // 遮罩层
      loading: true,
      // 列表的数据
      list: [],
    };
  },
  created() {
    this.getList();
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
    getList() {
      try {
        this.loading = true;
        const that = this;
        Demo03StudentApi.getDemo03GradeByStudentId(this.studentId).then(response=>{
          const data = response.data;
          if (!data) {
            return
          }
          that.list.push(data)
        })
      } finally {
        this.loading = false;
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
  }
};
</script>
