<!-- MES 生产任务列表（工单排产弹窗内使用） -->
<template>
  <div>
    <div
      v-if="!disabled"
      class="operation-bar"
    >
      <el-button
        v-hasPermi="['mes:pro-task:create']"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="openForm('create')"
      >新增任务</el-button>
    </div>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      show-overflow-tooltip
    >
      <el-table-column
        label="任务编码"
        align="center"
        prop="code"
        width="140"
      />
      <el-table-column
        label="任务名称"
        align="center"
        prop="name"
        min-width="150"
      />
      <el-table-column
        label="工作站编号"
        align="center"
        prop="workstationCode"
        width="120"
      />
      <el-table-column
        label="工作站名称"
        align="center"
        prop="workstationName"
        width="120"
      />
      <el-table-column
        label="排产数量"
        align="center"
        prop="quantity"
        width="100"
      />
      <el-table-column
        label="已生产数量"
        align="center"
        prop="producedQuantity"
        width="100"
      />
      <el-table-column
        label="开始生产时间"
        align="center"
        prop="startTime"
        :formatter="dateFormatter"
        width="170"
      />
      <el-table-column
        label="生产时长"
        align="center"
        prop="duration"
        width="80"
      />
      <el-table-column
        label="预计完成时间"
        align="center"
        prop="endTime"
        :formatter="dateFormatter"
        width="170"
      />
      <el-table-column
        label="显示颜色"
        align="center"
        prop="colorCode"
        width="100"
      >
        <template #default="scope">
          <div
            class="color-block"
            :style="{ background: scope.row.colorCode || '#00AEF3' }"
          />
        </template>
      </el-table-column>
      <el-table-column
        v-if="!disabled"
        label="操作"
        align="center"
        width="160"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['mes:pro-task:update']"
            type="text"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['mes:pro-task:delete']"
            type="text"
            class="danger-text"
            @click="handleDelete(scope.row.id)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="960px"
      append-to-body
    >
      <el-form
        ref="form"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="8"><el-form-item
            label="工作站"
            prop="workstationId"
          ><md-workstation-select
            v-model="formData.workstationId"
            :disabled="isDetail"
          /></el-form-item></el-col>
          <el-col :span="8"><el-form-item
            label="排产数量"
            prop="quantity"
          ><el-input-number
            v-model="formData.quantity"
            :min="0.01"
            :precision="2"
            class="full-width"
            :disabled="isDetail"
          /></el-form-item></el-col>
          <el-col :span="8"><el-form-item
            label="甘特颜色"
            prop="colorCode"
          ><el-color-picker
            v-model="formData.colorCode"
            :disabled="isDetail"
          /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8"><el-form-item
            label="开始时间"
            prop="startTime"
          ><el-date-picker
            v-model="formData.startTime"
            type="datetime"
            placeholder="请选择开始时间"
            value-format="timestamp"
            class="full-width"
            :disabled="isDetail"
          /></el-form-item></el-col>
          <el-col :span="8"><el-form-item
            label="生产时长"
            prop="duration"
          ><el-input-number
            v-model="formData.duration"
            :min="1"
            :precision="0"
            class="full-width"
            :disabled="isDetail"
            @change="handleDurationChange"
          /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="结束时间"><el-date-picker
            v-model="formData.endTime"
            type="datetime"
            value-format="timestamp"
            class="full-width"
            disabled
          /></el-form-item></el-col>
        </el-row>
        <el-form-item
          label="备注"
          prop="remark"
        ><el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
          :disabled="isDetail"
        /></el-form-item>
      </el-form>
      <span slot="footer">
        <el-button
          v-if="!isDetail"
          type="primary"
          :loading="formLoading"
          @click="submitForm"
        >确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { dateFormatter } from '@/utils/formatTime'
import { ProTaskApi } from '@/api/mes/pro/task'
import MdWorkstationSelect from '@/views/mes/md/workstation/components/MdWorkstationSelect.vue'

export default {
  name: 'ProTaskList',
  components: { MdWorkstationSelect },
  props: {
    workOrderId: { type: Number, required: true },
    routeId: { type: Number, required: true },
    processId: { type: Number, required: true },
    itemId: Number,
    colorCode: String,
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      loading: false,
      list: [],
      dialogVisible: false,
      formLoading: false,
      formType: '',
      formData: this.emptyForm(),
      formRules: {
        workstationId: [{ required: true, message: '工作站不能为空', trigger: 'change' }],
        quantity: [
          { required: true, message: '排产数量不能为空', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '排产数量必须大于 0', trigger: 'blur' }
        ],
        startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
        duration: [{ required: true, message: '生产时长不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      return { create: '新增生产任务', update: '编辑生产任务', detail: '生产任务详情' }[this.formType] || ''
    },
    isDetail() {
      return this.formType === 'detail'
    }
  },
  watch: {
    processId() {
      this.getList()
    },
    'formData.startTime'() {
      this.handleDurationChange()
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    emptyForm() {
      return {
        id: undefined,
        workOrderId: undefined,
        workstationId: undefined,
        routeId: undefined,
        processId: undefined,
        itemId: undefined,
        quantity: undefined,
        startTime: undefined,
        duration: 1,
        endTime: undefined,
        colorCode: undefined,
        status: undefined,
        remark: undefined
      }
    },
    async getList() {
      this.loading = true
      try {
        const response = await ProTaskApi.getTaskPage({
          workOrderId: this.workOrderId,
          routeId: this.routeId,
          processId: this.processId,
          pageNo: 1,
          pageSize: 100
        })
        this.list = response.data.list
      } finally {
        this.loading = false
      }
    },
    async openForm(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.resetForm()
      if (type === 'create') {
        Object.assign(this.formData, {
          workOrderId: this.workOrderId,
          routeId: this.routeId,
          processId: this.processId,
          itemId: this.itemId,
          colorCode: this.colorCode || '#00AEF3'
        })
      } else if (id) {
        this.formLoading = true
        try {
          const response = await ProTaskApi.getTask(id)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
      }
    },
    async submitForm() {
      await this.$refs.form.validate()
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await ProTaskApi.createTask(this.formData)
          this.$modal.msgSuccess('新增成功')
        } else {
          await ProTaskApi.updateTask(this.formData)
          this.$modal.msgSuccess('修改成功')
        }
        this.dialogVisible = false
        await this.getList()
      } finally {
        this.formLoading = false
      }
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除该生产任务？')
        await ProTaskApi.deleteTask(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        if (error !== 'cancel') throw error
      }
    },
    handleDurationChange() {
      if (this.formData.startTime && this.formData.duration) {
        const start = typeof this.formData.startTime === 'number'
          ? this.formData.startTime
          : new Date(this.formData.startTime).getTime()
        this.formData.endTime = start + this.formData.duration * 8 * 60 * 60 * 1000
      }
    },
    resetForm() {
      this.formData = this.emptyForm()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    }
  }
}
</script>

<style scoped>
.operation-bar { margin-bottom: 10px; }
.full-width { width: 100%; }
.color-block { width: 20px; height: 20px; margin: 0 auto; border-radius: 4px; }
.danger-text { color: #f56c6c; }
</style>
