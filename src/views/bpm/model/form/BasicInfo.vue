<template>
  <div>
    <el-form ref="form" :model="modelData" :rules="rules" label-width="120px" class="model-step-form">
    <el-form-item label="流程标识" prop="key">
      <el-input
        v-model="modelData.key"
        :disabled="!!modelData.id && !isCopy"
        placeholder="请输入流程标识，以字母或下划线开头"
      />
    </el-form-item>
    <el-form-item label="流程名称" prop="name">
      <el-input v-model="modelData.name" placeholder="请输入流程名称" />
    </el-form-item>
    <el-form-item label="流程分类" prop="category">
      <el-select v-model="modelData.category" placeholder="请选择流程分类" clearable style="width: 100%">
        <el-option v-for="item in categoryList" :key="item.code" :label="item.name" :value="item.code" />
      </el-select>
    </el-form-item>
    <el-form-item label="流程图标" prop="icon">
      <el-input v-model="modelData.icon" placeholder="请输入流程图标地址，可为空" />
    </el-form-item>
    <el-form-item label="流程描述" prop="description">
      <el-input v-model="modelData.description" type="textarea" :rows="3" placeholder="请输入流程描述" />
    </el-form-item>
    <el-form-item label="流程类型" prop="type">
      <el-radio-group v-model="modelData.type">
        <el-radio :label="BpmModelType.BPMN">BPMN 设计器</el-radio>
        <el-radio :label="BpmModelType.SIMPLE">SIMPLE 设计器</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="是否可见" prop="visible">
      <el-radio-group v-model="modelData.visible">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="谁可以发起" prop="startUserType">
      <el-select
        v-model="modelData.startUserType"
        placeholder="请选择谁可以发起"
        style="width: 100%"
        @change="handleStartUserTypeChange"
      >
        <el-option label="全员" :value="0" />
        <el-option label="指定人员" :value="1" />
        <el-option label="指定部门" :value="2" />
      </el-select>
      <div v-if="modelData.startUserType === 1" class="selector-row">
        <el-tag
          v-for="user in selectedStartUsers"
          :key="user.id"
          closable
          class="selector-tag"
          @close="handleRemoveStartUser(user)"
        >
          {{ userName(user) }}
        </el-tag>
        <el-button type="text" icon="el-icon-plus" @click="openStartUserSelect">选择人员</el-button>
      </div>
      <div v-if="modelData.startUserType === 2" class="selector-row">
        <el-select
          v-model="modelData.startDeptIds"
          multiple
          filterable
          clearable
          placeholder="请选择部门"
          style="width: 100%"
          @change="syncSelectedStartDepts"
        >
          <el-option v-for="item in deptList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </div>
    </el-form-item>
    <el-form-item label="流程管理员" prop="managerUserIds">
      <div class="selector-row selector-row--top">
        <el-tag
          v-for="user in selectedManagerUsers"
          :key="user.id"
          closable
          class="selector-tag"
          @close="handleRemoveManagerUser(user)"
        >
          {{ userName(user) }}
        </el-tag>
        <el-button type="text" icon="el-icon-plus" @click="openManagerUserSelect">选择人员</el-button>
      </div>
    </el-form-item>
    </el-form>

    <UserSelectForm ref="userSelectForm" @confirm="handleUserSelectConfirm" />
  </div>
</template>

<script>
import { BpmModelType } from '@/utils/constants'
import UserSelectForm from '@/components/UserSelectForm'

export default {
  name: 'BpmModelBasicInfo',
  components: {
    UserSelectForm
  },
  props: {
    value: {
      type: Object,
      required: true
    },
    categoryList: {
      type: Array,
      default: () => []
    },
    userList: {
      type: Array,
      default: () => []
    },
    deptList: {
      type: Array,
      default: () => []
    },
    isCopy: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      BpmModelType,
      currentSelectType: 'start',
      selectedStartUsers: [],
      selectedStartDepts: [],
      selectedManagerUsers: [],
      rules: {
        key: [
          { required: true, message: '流程标识不能为空', trigger: 'blur' },
          { validator: this.validateKey, trigger: 'blur' }
        ],
        name: [{ required: true, message: '流程名称不能为空', trigger: 'blur' }],
        category: [{ required: true, message: '流程分类不能为空', trigger: 'change' }],
        type: [{ required: true, message: '流程类型不能为空', trigger: 'change' }],
        visible: [{ required: true, message: '是否可见不能为空', trigger: 'change' }],
        startUserType: [{ required: true, message: '谁可以发起不能为空', trigger: 'change' }],
        managerUserIds: [{ required: true, message: '流程管理员不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    modelData: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  watch: {
    modelData: {
      handler() {
        this.syncSelectedUsers()
        this.syncSelectedStartDepts()
      },
      immediate: true,
      deep: true
    },
    userList() {
      this.syncSelectedUsers()
    },
    deptList() {
      this.syncSelectedStartDepts()
    }
  },
  methods: {
    validate() {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate((valid) => {
          valid ? resolve() : reject(new Error('请完善基本信息'))
        })
      })
    },
    validateKey(rule, value, callback) {
      if (!value || /^[a-zA-Z_][\-.0-9_a-zA-Z$]*$/.test(value)) {
        callback()
        return
      }
      callback(new Error('只能包含字母、数字、下划线、连字符和点号，且必须以字母或下划线开头'))
    },
    syncSelectedUsers() {
      const startUserIds = Array.isArray(this.modelData.startUserIds) ? this.modelData.startUserIds : []
      const managerUserIds = Array.isArray(this.modelData.managerUserIds) ? this.modelData.managerUserIds : []
      this.selectedStartUsers = this.userList.filter((user) => startUserIds.includes(user.id))
      this.selectedManagerUsers = this.userList.filter((user) => managerUserIds.includes(user.id))
    },
    syncSelectedStartDepts() {
      const startDeptIds = Array.isArray(this.modelData.startDeptIds) ? this.modelData.startDeptIds : []
      this.selectedStartDepts = this.deptList.filter((dept) => startDeptIds.includes(dept.id))
    },
    openStartUserSelect() {
      this.currentSelectType = 'start'
      this.$refs.userSelectForm.open(0, this.selectedStartUsers)
    },
    openManagerUserSelect() {
      this.currentSelectType = 'manager'
      this.$refs.userSelectForm.open(0, this.selectedManagerUsers)
    },
    handleUserSelectConfirm(_, users) {
      const ids = (users || []).map((user) => user.id)
      if (this.currentSelectType === 'start') {
        this.$set(this.modelData, 'startUserIds', ids)
      } else {
        this.$set(this.modelData, 'managerUserIds', ids)
      }
      this.syncSelectedUsers()
    },
    handleStartUserTypeChange(value) {
      if (value === 0) {
        this.$set(this.modelData, 'startUserIds', [])
        this.$set(this.modelData, 'startDeptIds', [])
      } else if (value === 1) {
        this.$set(this.modelData, 'startDeptIds', [])
      } else if (value === 2) {
        this.$set(this.modelData, 'startUserIds', [])
      }
      this.syncSelectedUsers()
      this.syncSelectedStartDepts()
    },
    handleRemoveStartUser(user) {
      this.$set(
        this.modelData,
        'startUserIds',
        (this.modelData.startUserIds || []).filter((id) => id !== user.id)
      )
      this.syncSelectedUsers()
    },
    handleRemoveManagerUser(user) {
      this.$set(
        this.modelData,
        'managerUserIds',
        (this.modelData.managerUserIds || []).filter((id) => id !== user.id)
      )
      this.syncSelectedUsers()
    },
    userName(user) {
      return user ? (user.nickname || user.name || user.username || user.id || '-') : '-'
    }
  }
}
</script>

<style scoped>
.model-step-form {
  max-width: 720px;
  margin: 20px auto;
}

.selector-row {
  margin-top: 8px;
}

.selector-row--top {
  margin-top: 0;
}

.selector-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
