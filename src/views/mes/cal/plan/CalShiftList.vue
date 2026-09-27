<!-- MES 排班计划 - 班次列表 -->
<template>
  <div>
    <el-button
      v-if="!isDetail"
      type="primary"
      plain
      size="small"
      icon="el-icon-plus"
      class="shift-add"
      @click="openForm('create')"
    >添加班次</el-button>

    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true" border>
      <el-table-column label="顺序" align="center" prop="sort" width="80" />
      <el-table-column label="班次名称" align="center" prop="name" min-width="120" />
      <el-table-column label="开始时间" align="center" prop="startTime" width="100" />
      <el-table-column label="结束时间" align="center" prop="endTime" width="100" />
      <el-table-column label="备注" align="center" prop="remark" min-width="150" />
      <el-table-column v-if="!isDetail" label="操作" align="center" width="120">
        <template v-slot="scope">
          <el-button type="text" size="mini" @click="openForm('update', scope.row)">编辑</el-button>
          <el-button type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
      <el-form
        ref="form"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="顺序" prop="sort">
          <el-input-number v-model="formData.sort" :min="1" controls-position="right" class="full-width" />
        </el-form-item>
        <el-form-item label="班次名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入班次名称" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker
            v-model="formData.startTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="请选择开始时间"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker
            v-model="formData.endTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="请选择结束时间"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { CalPlanShiftApi } from '@/api/mes/cal/plan/shift'

export default {
  name: 'CalShiftList',
  props: {
    planId: { type: Number, default: undefined },
    formType: { type: String, required: true }
  },
  data() {
    return {
      loading: false,
      list: [],
      dialogVisible: false,
      dialogTitle: '',
      dialogType: '',
      formLoading: false,
      formData: this.getDefaultForm(),
      formRules: {
        sort: [{ required: true, message: '顺序不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '班次名称不能为空', trigger: 'blur' }],
        startTime: [{ required: true, message: '开始时间不能为空', trigger: 'blur' }],
        endTime: [{ required: true, message: '结束时间不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    isDetail() {
      return this.formType === 'detail'
    }
  },
  watch: {
    planId: {
      immediate: true,
      handler(value) {
        if (value) this.getList()
      }
    }
  },
  methods: {
    getDefaultForm() {
      return {
        id: undefined,
        planId: this.planId,
        sort: 1,
        name: undefined,
        startTime: undefined,
        endTime: undefined,
        remark: undefined
      }
    },
    async getList() {
      this.loading = true
      try {
        const response = await CalPlanShiftApi.getPlanShiftListByPlan(this.planId)
        this.list = response.data
      } finally {
        this.loading = false
      }
    },
    openForm(type, row) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增班次' : '修改班次'
      this.dialogType = type
      this.resetFormData()
      if (type === 'update' && row) {
        this.formData = {
          id: row.id,
          planId: row.planId,
          sort: row.sort,
          name: row.name,
          startTime: row.startTime,
          endTime: row.endTime,
          remark: row.remark
        }
      }
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.formLoading = true
        try {
          if (this.dialogType === 'create') {
            await CalPlanShiftApi.createPlanShift(this.formData)
            this.$modal.msgSuccess('新增成功')
          } else {
            await CalPlanShiftApi.updatePlanShift(this.formData)
            this.$modal.msgSuccess('修改成功')
          }
          this.dialogVisible = false
          await this.getList()
        } finally {
          this.formLoading = false
        }
      })
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除班次？')
        await CalPlanShiftApi.deletePlanShift(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 取消删除时保持当前列表
      }
    },
    resetFormData() {
      this.formData = this.getDefaultForm()
      if (this.$refs.form) {
        // 弹窗已挂载时同步重置，避免 nextTick 晚于随后的回填赋值而覆盖数据（对齐 Vue3 源行为）
        this.$refs.form.resetFields()
      }
    }
  }
}
</script>

<style scoped>
.shift-add { margin-bottom: 10px; }
.full-width { width: 100%; }
</style>
