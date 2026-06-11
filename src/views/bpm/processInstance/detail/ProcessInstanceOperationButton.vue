<template>
  <div class="operation-bar" v-if="processInstance && processInstance.id">
    <template v-if="todoTask && todoTask.id">
      <el-button type="success" icon="el-icon-check" size="small" @click="openAction('approve')">通过</el-button>
      <el-button type="danger" icon="el-icon-close" size="small" @click="openAction('reject')">拒绝</el-button>
      <el-button icon="el-icon-back" size="small" @click="openAction('return')">退回</el-button>
      <el-button icon="el-icon-position" size="small" @click="openAction('transfer')">转办</el-button>
      <el-button icon="el-icon-user" size="small" @click="openAction('delegate')">委派</el-button>
      <el-button icon="el-icon-plus" size="small" @click="openAction('addSign')">加签</el-button>
      <el-button icon="el-icon-minus" size="small" @click="openAction('deleteSign')">减签</el-button>
      <el-button icon="el-icon-message" size="small" @click="openAction('copy')">抄送</el-button>
      <el-button icon="el-icon-refresh-left" size="small" @click="handleWithdraw">撤回</el-button>
    </template>
    <template v-else>
      <el-button
        v-if="processInstance.status === TaskStatusEnum.RUNNING"
        type="danger"
        icon="el-icon-close"
        size="small"
        @click="openAction('cancel')"
      >
        取消流程
      </el-button>
      <el-button icon="el-icon-refresh" size="small" @click="handleReCreate">重新发起</el-button>
    </template>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="560px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="96px">
        <el-form-item v-if="needsUser" label="处理人" prop="userId">
          <el-select v-model="form.userId" filterable clearable placeholder="请选择用户" style="width: 100%">
            <el-option
              v-for="item in userOptions"
              :key="item.id"
              :label="item.nickname || item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="actionType === 'return'" label="退回节点" prop="targetTaskDefinitionKey">
          <el-select v-model="form.targetTaskDefinitionKey" clearable placeholder="请选择退回节点" style="width: 100%">
            <el-option
              v-for="item in returnNodeList"
              :key="item.id || item.taskDefinitionKey"
              :label="item.name"
              :value="item.id || item.taskDefinitionKey"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="actionType === 'addSign'" label="加签位置" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="before">前加签</el-radio>
            <el-radio label="after">后加签</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理意见" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入处理意见"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="formLoading" @click="submitAction">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  approveTask,
  copyTask,
  delegateTask,
  getChildrenTaskList,
  getTaskListByReturn,
  rejectTask,
  returnTask,
  signCreateTask,
  signDeleteTask,
  TaskStatusEnum,
  transferTask,
  withdrawTask
} from '@/api/bpm/task'
import {
  cancelProcessInstanceByAdmin,
  cancelProcessInstanceByStartUser
} from '@/api/bpm/processInstance'

export default {
  name: 'ProcessInstanceOperationButton',
  props: {
    processInstance: {
      type: Object,
      default: () => ({})
    },
    processDefinition: {
      type: Object,
      default: () => ({})
    },
    userOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      TaskStatusEnum,
      todoTask: null,
      dialogVisible: false,
      formLoading: false,
      actionType: '',
      returnNodeList: [],
      form: {
        reason: '',
        userId: undefined,
        targetTaskDefinitionKey: undefined,
        type: 'after'
      },
      rules: {
        reason: [{ required: true, message: '处理意见不能为空', trigger: 'blur' }],
        userId: [{ required: true, message: '处理人不能为空', trigger: 'change' }],
        targetTaskDefinitionKey: [{ required: true, message: '退回节点不能为空', trigger: 'change' }],
        type: [{ required: true, message: '加签位置不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      const map = {
        approve: '审批通过',
        reject: '审批拒绝',
        return: '退回流程',
        transfer: '转办任务',
        delegate: '委派任务',
        addSign: '加签任务',
        deleteSign: '减签任务',
        copy: '抄送',
        cancel: '取消流程'
      }
      return map[this.actionType] || '流程操作'
    },
    needsUser() {
      return ['transfer', 'delegate', 'addSign', 'deleteSign', 'copy'].includes(this.actionType)
    }
  },
  methods: {
    loadTodoTask(todoTask) {
      this.todoTask = todoTask || null
    },
    resetFormData() {
      this.form = {
        reason: '',
        userId: undefined,
        targetTaskDefinitionKey: undefined,
        type: 'after'
      }
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
    async openAction(type) {
      this.actionType = type
      this.resetFormData()
      if (type === 'return' && this.todoTask) {
        const response = await getTaskListByReturn(this.todoTask.id)
        this.returnNodeList = response.data || []
      }
      if (type === 'deleteSign' && this.todoTask) {
        try {
          const response = await getChildrenTaskList(this.todoTask.id)
          const children = response.data || []
          if (children.length > 0) {
            this.form.userId = children[0].id
          }
        } catch (e) {}
      }
      this.dialogVisible = true
    },
    submitAction() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) {
          return
        }
        this.formLoading = true
        try {
          await this.dispatchAction()
          this.dialogVisible = false
          this.$modal.msgSuccess('操作成功')
          this.$emit('success')
        } finally {
          this.formLoading = false
        }
      })
    },
    dispatchAction() {
      const taskId = this.todoTask && this.todoTask.id
      const reason = this.form.reason
      const map = {
        approve: () => approveTask({ id: taskId, reason }),
        reject: () => rejectTask({ id: taskId, reason }),
        return: () => returnTask({
          id: taskId,
          reason,
          targetTaskDefinitionKey: this.form.targetTaskDefinitionKey
        }),
        transfer: () => transferTask({ id: taskId, reason, assigneeUserId: this.form.userId }),
        delegate: () => delegateTask({ id: taskId, reason, delegateUserId: this.form.userId }),
        addSign: () => signCreateTask({
          id: taskId,
          reason,
          userId: this.form.userId,
          type: this.form.type
        }),
        deleteSign: () => signDeleteTask({
          id: taskId,
          reason,
          userId: this.form.userId
        }),
        copy: () => copyTask({
          id: taskId,
          reason,
          copyUserIds: [this.form.userId]
        }),
        cancel: () => {
          const isStartUser = this.processInstance.startUser && this.processInstance.startUser.id === this.$store.getters.userId
          return isStartUser
            ? cancelProcessInstanceByStartUser(this.processInstance.id, reason)
            : cancelProcessInstanceByAdmin(this.processInstance.id, reason)
        }
      }
      return map[this.actionType]()
    },
    async handleWithdraw() {
      if (!this.todoTask || !this.todoTask.id) {
        return
      }
      await this.$modal.confirm('确认撤回当前任务？')
      await withdrawTask(this.todoTask.id)
      this.$modal.msgSuccess('撤回成功')
      this.$emit('success')
    },
    handleReCreate() {
      this.$router.push({
        name: 'BpmProcessInstanceCreate',
        query: {
          processInstanceId: this.processInstance.id
        }
      })
    }
  }
}
</script>

<style scoped>
.operation-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 0;
}
</style>
