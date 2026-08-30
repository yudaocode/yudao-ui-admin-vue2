<template>
  <div class="operation-bar" v-if="processInstance && processInstance.id">
    <template v-if="todoTask && todoTask.id && canHandleTask">
      <el-button
        v-if="isShowButton(OperationButtonType.APPROVE)"
        type="success"
        icon="el-icon-check"
        size="small"
        @click="openAction('approve')"
      >{{ getButtonDisplayName(OperationButtonType.APPROVE) }}</el-button>
      <el-button
        v-if="isShowButton(OperationButtonType.REJECT)"
        type="danger"
        icon="el-icon-close"
        size="small"
        @click="openAction('reject')"
      >{{ getButtonDisplayName(OperationButtonType.REJECT) }}</el-button>
      <el-button type="primary" icon="el-icon-chat-line-round" size="small" @click="openAction('comment')">评论</el-button>
      <el-button v-if="isShowButton(OperationButtonType.RETURN)" icon="el-icon-back" size="small" @click="openAction('return')">{{ getButtonDisplayName(OperationButtonType.RETURN) }}</el-button>
      <el-button v-if="isShowButton(OperationButtonType.TRANSFER)" icon="el-icon-position" size="small" @click="openAction('transfer')">{{ getButtonDisplayName(OperationButtonType.TRANSFER) }}</el-button>
      <el-button v-if="isShowButton(OperationButtonType.DELEGATE)" icon="el-icon-user" size="small" @click="openAction('delegate')">{{ getButtonDisplayName(OperationButtonType.DELEGATE) }}</el-button>
      <el-button v-if="isShowButton(OperationButtonType.ADD_SIGN)" icon="el-icon-plus" size="small" @click="openAction('addSign')">{{ getButtonDisplayName(OperationButtonType.ADD_SIGN) }}</el-button>
      <el-button icon="el-icon-minus" size="small" @click="openAction('deleteSign')">减签</el-button>
      <el-button v-if="isShowButton(OperationButtonType.COPY)" icon="el-icon-message" size="small" @click="openAction('copy')">{{ getButtonDisplayName(OperationButtonType.COPY) }}</el-button>
      <el-button icon="el-icon-refresh-left" size="small" @click="handleWithdraw">撤回</el-button>
    </template>
    <template v-else>
      <el-button
        v-if="canCancel"
        type="danger"
        icon="el-icon-close"
        size="small"
        @click="openAction('cancel')"
      >
        取消流程
      </el-button>
      <el-button
        v-if="canReCreate"
        icon="el-icon-refresh"
        size="small"
        @click="handleReCreate"
      >重新发起</el-button>
    </template>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="760px" append-to-body @close="handleDialogClose">
      <form-create
        v-if="actionType === 'approve' && approveForm.rule && approveForm.rule.length"
        class="approve-node-form"
        v-model="approveFormApi"
        :rule="approveForm.rule"
        :option="approveForm.option"
        @change="handleApproveFormChange"
      />

      <el-form ref="form" :model="form" :rules="actionRules" label-width="120px">
        <el-form-item v-if="needsUser" :label="userSelectLabel" prop="userId">
          <el-select v-model="form.userId" filterable clearable placeholder="请选择用户" style="width: 100%">
            <el-option
              v-for="item in userOptions"
              :key="item.id"
              :label="item.nickname || item.name || item.username"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="needsUserList" :label="userSelectLabel" prop="userIds">
          <el-select v-model="form.userIds" filterable multiple clearable placeholder="请选择用户" style="width: 100%">
            <el-option
              v-for="item in userOptions"
              :key="item.id"
              :label="item.nickname || item.name || item.username"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="actionType === 'deleteSign'" label="减签人员" prop="deleteSignTaskId">
          <el-select v-model="form.deleteSignTaskId" clearable placeholder="请选择减签人员" style="width: 100%">
            <el-option
              v-for="item in deleteSignTaskList"
              :key="item.id"
              :label="getDeleteSignUserLabel(item)"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="actionType === 'return'" label="退回节点" prop="targetTaskDefinitionKey">
          <el-select v-model="form.targetTaskDefinitionKey" clearable placeholder="请选择退回节点" style="width: 100%">
            <el-option
              v-for="item in returnNodeList"
              :key="item.taskDefinitionKey || item.id"
              :label="item.name"
              :value="item.taskDefinitionKey || item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="actionType === 'addSign'" label="加签位置" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="before">前加签</el-radio>
            <el-radio label="after">后加签</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="actionType === 'approve' && todoTask && todoTask.signEnable" label="签名图片" prop="signPicUrl">
          <el-button size="small" @click="$refs.signDialog && $refs.signDialog.open(form.signPicUrl)">点击签名</el-button>
          <el-image
            v-if="form.signPicUrl"
            class="sign-preview"
            :src="form.signPicUrl"
            :preview-src-list="[form.signPicUrl]"
            fit="contain"
          />
        </el-form-item>
        <el-form-item :label="reasonLabel" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="4"
            :placeholder="reasonPlaceholder"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item v-if="actionType === 'approve' || actionType === 'reject'" label="上传附件/图片">
          <FileUpload
            v-model="form.attachments"
            :limit="10"
            :file-type="approvalAttachmentFileTypes"
            :file-size="approvalAttachmentFileSize"
            :is-show-tip="false"
          />
        </el-form-item>
        <el-form-item
          v-if="actionType === 'approve' && nextAssigneesActivityNode.length > 0"
          label="下一个节点的审批人"
          prop="nextAssignees"
        >
          <ProcessInstanceTimeline
            ref="nextAssigneesTimeline"
            :activity-nodes="nextAssigneesActivityNode"
            :show-status-icon="false"
            :enable-approve-user-select="true"
            @select-user-confirm="selectNextAssigneesConfirm"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="formLoading" @click="submitAction">确 定</el-button>
      </div>
    </el-dialog>
    <SignDialog ref="signDialog" @success="handleSignFinish" />
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
import { createComment } from '@/api/bpm/comment'
import {
  cancelProcessInstanceByStartUser,
  getNextApprovalNodes
} from '@/api/bpm/processInstance'
import { BpmModelFormType } from '@/utils/constants'
import {
  CandidateStrategy,
  NodeType,
  OPERATION_BUTTON_NAME,
  OperationButtonType
} from '@/components/SimpleProcessDesignerV2/src/consts'
import { setConfAndFields2 } from '@/utils/formCreate'
import { isEmpty } from '@/utils/is'
import FileUpload from '@/components/FileUpload'
import ProcessInstanceTimeline from './ProcessInstanceTimeline.vue'
import SignDialog from './SignDialog.vue'

export default {
  name: 'ProcessInstanceOperationButton',
  components: {
    FileUpload,
    ProcessInstanceTimeline,
    SignDialog
  },
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
    },
    normalForm: {
      type: Object,
      default: () => ({})
    },
    normalFormApi: {
      type: Object,
      default: () => ({})
    },
    writableFields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      TaskStatusEnum,
      OperationButtonType,
      BpmModelFormType,
      todoTask: null,
      dialogVisible: false,
      formLoading: false,
      actionType: '',
      returnNodeList: [],
      form: this.defaultForm(),
      approveForm: {
        rule: [],
        option: {
          submitBtn: false,
          resetBtn: false
        },
        value: {}
      },
      approveFormApi: {},
      nextAssigneesActivityNode: [],
      deleteSignTaskList: [],
      nextApprovalRequestId: 0,
      pendingNextNodesTask: null,
      approvalRefreshTimer: null,
      reasonRequire: false,
      nodeTypeName: '审批',
      approvalAttachmentFileTypes: [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'bmp',
        'webp',
        'pdf',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
        'txt',
        'zip',
        'rar'
      ],
      approvalAttachmentFileSize: 5
    }
  },
  computed: {
    dialogTitle() {
      const map = {
        approve: this.nodeTypeName + '通过',
        reject: '审批拒绝',
        return: '退回流程',
        transfer: '转办任务',
        delegate: '委派任务',
        addSign: '加签任务',
        deleteSign: '减签任务',
        copy: '抄送',
        comment: '评论',
        cancel: '取消流程'
      }
      return map[this.actionType] || '流程操作'
    },
    needsUser() {
      return ['transfer', 'delegate'].includes(this.actionType)
    },
    needsUserList() {
      return ['addSign', 'copy'].includes(this.actionType)
    },
    userSelectLabel() {
      const map = {
        transfer: '新审批人',
        delegate: '接收人',
        addSign: '加签处理人',
        copy: '抄送人'
      }
      return map[this.actionType] || '处理人'
    },
    reasonLabel() {
      if (this.actionType === 'comment') return '评论内容'
      return this.actionType === 'approve' ? `${this.nodeTypeName}意见` : '处理意见'
    },
    reasonPlaceholder() {
      if (this.actionType === 'comment') return '请输入评论内容'
      return this.actionType === 'approve' ? `请输入${this.nodeTypeName}意见` : '请输入处理意见'
    },
    /**
     * 取消/重新发起属于流程发起人的操作。详情页也会被审批人、抄送人和
     * 管理员打开，不能仅凭「没有待办任务」就把这些按钮展示给所有人。
     */
    isStartUser() {
      const startUser = this.processInstance && this.processInstance.startUser
      const startUserId = startUser && startUser.id !== undefined
        ? startUser.id
        : this.processInstance && this.processInstance.startUserId
      const currentUserId = this.$store && this.$store.getters && this.$store.getters.userId
      return startUserId !== undefined && startUserId !== null && currentUserId !== undefined && currentUserId !== null && String(startUserId) === String(currentUserId)
    },
    canCancel() {
      return this.isStartUser && Number(this.processInstance && this.processInstance.status) === TaskStatusEnum.RUNNING
    },
    // A task may be returned by the detail API in WAIT/APPROVING state (for
    // example while another sign task is pending). Keep task operations
    // disabled until Flowable marks the task RUNNING, matching the Vue3
    // `isHandleTaskStatus` guard and preventing invalid state transitions.
    canHandleTask() {
      return !!(this.todoTask && this.todoTask.id && Number(this.todoTask.status) === TaskStatusEnum.RUNNING)
    },
    canReCreate() {
      if (!this.isStartUser || !this.isEndProcessStatus(this.processInstance.status)) {
        return false
      }
      const formType = this.processDefinition && this.processDefinition.formType
      return Number(formType) === Number(BpmModelFormType.NORMAL) ||
        (Number(formType) === Number(BpmModelFormType.CUSTOM) && !!(this.processDefinition && this.processDefinition.formCustomCreatePath))
    },
    actionRules() {
      const reasonRequired = this.isReasonRequired()
      return {
        reason: [{ required: reasonRequired, message: `${this.reasonLabel}不能为空`, trigger: 'blur' }],
        userId: [{ required: this.needsUser, message: `${this.userSelectLabel}不能为空`, trigger: 'change' }],
        userIds: [{ type: 'array', required: this.needsUserList, message: `${this.userSelectLabel}不能为空`, trigger: 'change' }],
        deleteSignTaskId: [{ required: this.actionType === 'deleteSign', message: '减签人员不能为空', trigger: 'change' }],
        targetTaskDefinitionKey: [{ required: this.actionType === 'return', message: '退回节点不能为空', trigger: 'change' }],
        type: [{ required: this.actionType === 'addSign', message: '加签位置不能为空', trigger: 'change' }],
        signPicUrl: [{ required: this.actionType === 'approve' && this.todoTask && this.todoTask.signEnable, message: '签名不能为空', trigger: 'blur' }],
        nextAssignees: [{ required: this.actionType === 'approve' && this.nextAssigneesActivityNode.length > 0, message: '审批人不能为空', trigger: 'change' }]
      }
    }
  },
  beforeDestroy() {
    if (this.approvalRefreshTimer) {
      clearTimeout(this.approvalRefreshTimer)
    }
  },
  methods: {
    defaultForm() {
      return {
        reason: '',
        userId: undefined,
        userIds: [],
        deleteSignTaskId: undefined,
        targetTaskDefinitionKey: undefined,
        type: 'after',
        attachments: '',
        signPicUrl: '',
        nextAssignees: {}
      }
    },
    loadTodoTask(todoTask) {
      this.todoTask = todoTask || null
      this.approveFormApi = {}
      this.approveForm = {
        rule: [],
        option: {
          submitBtn: false,
          resetBtn: false
        },
        value: {}
      }
      this.nextApprovalRequestId += 1
      this.pendingNextNodesTask = null
      this.reasonRequire = todoTask && todoTask.reasonRequire !== undefined ? todoTask.reasonRequire : false
      this.nodeTypeName = todoTask && todoTask.nodeType === NodeType.TRANSACTOR_NODE ? '办理' : '审批'
      if (todoTask && todoTask.formId && todoTask.formConf) {
        setConfAndFields2(this.approveForm, todoTask.formConf, todoTask.formFields, todoTask.formVariables)
        this.approveForm.option = this.approveForm.option || {}
        this.$set(this.approveForm.option, 'submitBtn', false)
        this.$set(this.approveForm.option, 'resetBtn', false)
        this.$set(this.approveForm.option, 'onChange', this.handleApproveFormChange)
      }
    },
    resetFormData() {
      this.form = this.defaultForm()
      this.nextAssigneesActivityNode = []
      this.deleteSignTaskList = []
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
        if (this.$refs.nextAssigneesTimeline && this.$refs.nextAssigneesTimeline.resetCustomApproveUsers) {
          this.$refs.nextAssigneesTimeline.resetCustomApproveUsers()
        }
      })
    },
    async openAction(type) {
      if ((type === 'cancel' && !this.canCancel) || (type !== 'cancel' && !this.canHandleTask)) {
        return
      }
      this.actionType = type
      this.resetFormData()
      if (type === 'approve') {
        const valid = await this.validateNormalForm()
        if (!valid) {
          this.$message.warning('表单校验不通过，请先完善表单')
          return
        }
      }
      if (type === 'return' && this.todoTask) {
        const response = await getTaskListByReturn(this.todoTask.id)
        this.returnNodeList = response.data || []
        if (this.returnNodeList.length === 0) {
          this.$message.warning('当前没有可退回的节点')
          return
        }
      }
      if (type === 'deleteSign' && this.todoTask) {
        try {
          const response = await getChildrenTaskList(this.todoTask.id)
          const children = response.data || []
          this.deleteSignTaskList = children
          if (children.length === 0) {
            this.$message.warning('当前没有可减签的任务')
            return
          }
        } catch (e) {
          return
        }
        if (this.deleteSignTaskList.length === 0) {
          return
        }
      }
      this.dialogVisible = true
      if (type === 'approve') {
        await this.$nextTick()
        if (this.approveFormApi && this.approveFormApi.setValue && this.approveForm.value) {
          this.approveFormApi.setValue(this.approveForm.value)
        }
        if (this.approveFormApi && this.approveFormApi.btn) {
          this.approveFormApi.btn.show(false)
        }
        if (this.approveFormApi && this.approveFormApi.resetBtn) {
          this.approveFormApi.resetBtn.show(false)
        }
        await this.initNextAssigneesFormField()
      }
    },
    handleDialogClose() {
      this.nextAssigneesActivityNode = []
      this.pendingNextNodesTask = null
      if (this.approvalRefreshTimer) {
        clearTimeout(this.approvalRefreshTimer)
        this.approvalRefreshTimer = null
      }
    },
    isReasonRequired() {
      if (this.actionType === 'approve' || this.actionType === 'reject') {
        return !!this.reasonRequire
      }
      return true
    },
    /**
     * Task responses carry button settings as a map keyed by the numeric
     * OperationButtonType. Keep the old default (visible) when an older task
     * response does not contain the map, while honoring explicit false.
     */
    isShowButton(btnType) {
      const settings = this.todoTask && this.todoTask.buttonsSetting
      if (!settings) {
        return true
      }
      const setting = Array.isArray(settings)
        ? settings.find((item) => Number(item && item.id) === Number(btnType))
        : settings[btnType] || settings[String(btnType)]
      return !setting || setting.enable === undefined ? true : !!setting.enable
    },
    getButtonDisplayName(btnType) {
      const settings = this.todoTask && this.todoTask.buttonsSetting
      const defaultName = OPERATION_BUTTON_NAME.get(btnType) || ''
      const setting = Array.isArray(settings)
        ? settings.find((item) => Number(item && item.id) === Number(btnType))
        : settings && (settings[btnType] || settings[String(btnType)])
      return setting && setting.displayName ? setting.displayName : defaultName
    },
    validateNormalForm() {
      if (!this.processDefinition || Number(this.processDefinition.formType) !== Number(BpmModelFormType.NORMAL)) {
        return Promise.resolve(true)
      }
      if (!this.normalFormApi || !this.normalFormApi.validate) {
        return Promise.resolve(true)
      }
      return new Promise((resolve) => {
        try {
          const result = this.normalFormApi.validate((valid) => resolve(valid !== false))
          if (result && result.then) {
            result.then(() => resolve(true)).catch(() => resolve(false))
          }
        } catch (e) {
          resolve(false)
        }
      })
    },
    handleApproveFormChange() {
      if (this.actionType !== 'approve' || !this.dialogVisible) {
        return
      }
      if (this.approvalRefreshTimer) {
        clearTimeout(this.approvalRefreshTimer)
      }
      this.approvalRefreshTimer = setTimeout(() => {
        this.pendingNextNodesTask = this.initNextAssigneesFormField().catch(() => {})
      }, 300)
    },
    async initNextAssigneesFormField() {
      if (!this.todoTask || !this.todoTask.id || !this.processInstance || !this.processInstance.id) {
        return
      }
      const requestId = ++this.nextApprovalRequestId
      const variables = this.getUpdatedProcessInstanceVariables()
      const response = await getNextApprovalNodes({
        processInstanceId: this.processInstance.id,
        taskId: this.todoTask.id,
        processVariablesStr: JSON.stringify(variables)
      })
      if (requestId !== this.nextApprovalRequestId) {
        return
      }
      const data = response.data || []
      const customApproveUsersData = {}
      this.nextAssigneesActivityNode = []
      data.forEach((node) => {
        if (
          (isEmpty(node.tasks) &&
            isEmpty(node.candidateUsers) &&
            CandidateStrategy.START_USER_SELECT === node.candidateStrategy) ||
          (isEmpty(node.candidateUsers) &&
            CandidateStrategy.APPROVE_USER_SELECT === node.candidateStrategy)
        ) {
          this.nextAssigneesActivityNode.push(node)
        }
        if (node.candidateUsers && node.candidateUsers.length > 0) {
          customApproveUsersData[node.id] = node.candidateUsers
        }
      })
      await this.$nextTick()
      if (this.$refs.nextAssigneesTimeline && Object.keys(customApproveUsersData).length > 0) {
        this.$refs.nextAssigneesTimeline.batchSetCustomApproveUsers(customApproveUsersData)
      }
    },
    getUpdatedProcessInstanceVariables() {
      const variables = {}
      if (this.writableFields && this.writableFields.length && this.normalFormApi) {
        this.writableFields.forEach((field) => {
          if (this.normalFormApi.getValue) {
            variables[field] = this.normalFormApi.getValue(field)
          } else if (this.normalFormApi.formData) {
            const data = this.normalFormApi.formData()
            variables[field] = data && data[field]
          }
        })
      }
      if (this.approveFormApi && this.approveFormApi.formData) {
        Object.assign(variables, this.approveFormApi.formData())
      }
      return variables
    },
    selectNextAssigneesConfirm(id, userList) {
      this.$set(this.form.nextAssignees, id, (userList || []).map((item) => item.id))
      this.$nextTick(() => this.$refs.form && this.$refs.form.validateField('nextAssignees'))
    },
    handleSignFinish(url) {
      this.form.signPicUrl = url || ''
      this.$nextTick(() => this.$refs.form && this.$refs.form.validateField('signPicUrl'))
    },
    validateNextAssignees() {
      for (const node of this.nextAssigneesActivityNode) {
        if (isEmpty(node.candidateUsers) && isEmpty(this.form.nextAssignees[node.id])) {
          this.$message.warning('下一个节点的审批人不能为空')
          return false
        }
      }
      return true
    },
    getDeleteSignUserLabel(task) {
      const user = task && (task.assigneeUser || task.ownerUser)
      const deptName = user && user.deptName
      const nickname = user && (user.nickname || user.name || user.username)
      return deptName ? `${nickname || task.id}（所属部门：${deptName}）` : (nickname || task.id)
    },
    validateApproveForm() {
      if (!this.approveFormApi || !this.approveFormApi.validate) {
        return Promise.resolve(true)
      }
      return new Promise((resolve, reject) => {
        try {
          const result = this.approveFormApi.validate((valid) => valid === false ? reject(new Error('invalid')) : resolve(true))
          if (result && result.then) {
            result.then(() => resolve(true)).catch(reject)
          }
        } catch (e) {
          reject(e)
        }
      })
    },
    parseAttachments(value) {
      if (!value) return []
      if (Array.isArray(value)) return value
      return String(value).split(',').map((item) => item.trim()).filter(Boolean)
    },
    submitAction() {
      this.$refs.form.validate(async valid => {
        if (!valid) {
          return
        }
        this.formLoading = true
        try {
          const result = await this.dispatchAction()
          if (result === false) {
            return
          }
          this.dialogVisible = false
          this.$modal.msgSuccess('操作成功')
          this.$emit('success')
        } finally {
          this.formLoading = false
        }
      })
    },
    async dispatchAction() {
      const taskId = this.todoTask && this.todoTask.id
      const reason = (this.form.reason || '').trim()
      if (this.actionType === 'comment') {
        if (!reason) {
          this.$message.warning('评论内容不能为空')
          return
        }
        return createComment(taskId, reason)
      }
      if (this.actionType === 'approve') {
        if (this.pendingNextNodesTask) {
          await this.pendingNextNodesTask
        }
        if (!this.validateNextAssignees()) {
          return false
        }
        await this.validateApproveForm()
        const data = {
          id: taskId,
          reason,
          attachments: this.parseAttachments(this.form.attachments),
          variables: this.getUpdatedProcessInstanceVariables(),
          nextAssignees: this.form.nextAssignees
        }
        if (this.todoTask && this.todoTask.signEnable) {
          data.signPicUrl = this.form.signPicUrl
        }
        return approveTask(data)
      }
      if (this.actionType === 'reject') {
        return rejectTask({
          id: taskId,
          reason,
          attachments: this.parseAttachments(this.form.attachments)
        })
      }
      const map = {
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
          userIds: this.form.userIds,
          type: this.form.type
        }),
        deleteSign: () => signDeleteTask({
          id: this.form.deleteSignTaskId,
          reason
        }),
        copy: () => copyTask({
          id: taskId,
          reason,
          copyUserIds: this.form.userIds
        }),
        cancel: () => cancelProcessInstanceByStartUser(this.processInstance.id, reason)
      }
      return map[this.actionType]()
    },
    async handleWithdraw() {
      if (!this.canHandleTask) {
        return
      }
      await this.$modal.confirm('确认撤回当前任务？')
      await withdrawTask(this.todoTask.id)
      this.$modal.msgSuccess('撤回成功')
      this.$emit('success')
    },
    handleReCreate() {
      if (!this.canReCreate) {
        return
      }
      const formType = this.processDefinition && this.processDefinition.formType
      if (Number(formType) === Number(BpmModelFormType.CUSTOM) && this.processDefinition.formCustomCreatePath) {
        this.$router.push({
          path: this.processDefinition.formCustomCreatePath,
          query: {
            id: this.processInstance.businessKey
          }
        })
        return
      }
      this.$router.push({
        name: 'BpmProcessInstanceCreate',
        query: {
          processInstanceId: this.processInstance.id
        }
      })
    },
    isEndProcessStatus(status) {
      return [2, 3, 4].includes(Number(status))
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

.approve-node-form {
  padding: 0 0 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.sign-preview {
  width: 90px;
  height: 40px;
  margin-left: 8px;
  vertical-align: middle;
}
</style>
