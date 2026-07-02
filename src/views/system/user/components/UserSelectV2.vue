<template>
  <div class="user-select-v2" :class="{ 'is-disabled': disabled }" @click="handleClick" @mouseenter="hovering = true" @mouseleave="hovering = false">
    <el-tooltip :disabled="selectedItems.length === 0" placement="top" :open-delay="500">
      <div slot="content">
        <div v-for="item in selectedItems" :key="item.id" class="user-tooltip-item">
          <div>用户名称：{{ item.username || '-' }}</div>
          <div>用户昵称：{{ item.nickname || '-' }}</div>
          <div>部门：{{ item.deptName || (item.dept && item.dept.name) || '-' }}</div>
          <div>手机号码：{{ item.mobile || '-' }}</div>
        </div>
      </div>
      <el-input
        :value="displayLabel"
        :placeholder="placeholder"
        :disabled="disabled"
        readonly
        :suffix-icon="suffixIcon"
      />
    </el-tooltip>
    <UserSelectDialogV2 ref="dialog" :multiple="multiple" :dept-id="deptId" @selected="handleSelected" />
  </div>
</template>

<script>
import { getUserList, getSimpleUser } from '@/api/system/user'
import UserSelectDialogV2 from './UserSelectDialogV2.vue'

export default {
  name: 'UserSelectV2',
  components: { UserSelectDialogV2 },
  props: {
    value: {
      type: [Number, String, Array],
      default: undefined
    },
    defaultCurrentUser: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    disabledIds: {
      type: Array,
      default: () => []
    },
    clearable: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: '请选择用户'
    },
    deptId: {
      type: Number,
      default: undefined
    }
  },
  data() {
    return {
      hovering: false,
      selectedItems: []
    }
  },
  computed: {
    displayLabel() {
      return this.selectedItems.map((item) => item.nickname || item.username).join('、')
    },
    showClear() {
      return this.clearable && !this.disabled && this.hovering && this.value !== undefined && this.value !== null && this.value !== ''
    },
    suffixIcon() {
      return this.showClear ? 'el-icon-circle-close' : 'el-icon-search'
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(value) {
        this.resolveItemById(value)
      }
    }
  },
  mounted() {
    if (this.defaultCurrentUser && (this.value === undefined || this.value === null || this.value === '')) {
      const id = this.$store && this.$store.getters && this.$store.getters.userId
      if (id) {
        this.$emit('input', this.multiple ? [id] : id)
        this.resolveItemById(this.multiple ? [id] : id)
      }
    }
  },
  methods: {
    async resolveItemById(value) {
      if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
        this.selectedItems = []
        return
      }
      const ids = Array.isArray(value) ? value : [value]
      try {
        const response = ids.length === 1 ? await getSimpleUser(ids[0]) : await getUserList(ids)
        const data = response.data
        this.selectedItems = Array.isArray(data) ? data : (data ? [data] : [])
      } catch (e) {
        this.selectedItems = []
      }
    },
    handleClick(event) {
      if (this.disabled) return
      const target = event.target
      if (this.showClear && target && target.closest && target.closest('.el-input__suffix')) {
        event.stopPropagation()
        this.selectedItems = []
        this.$emit('input', this.multiple ? [] : undefined)
        this.$emit('change', this.multiple ? [] : undefined)
        return
      }
      const selectedIds = this.multiple
        ? (Array.isArray(this.value) ? this.value : [])
        : (this.value !== undefined && this.value !== null ? [this.value] : [])
      this.$refs.dialog.open(selectedIds, this.disabledIds)
    },
    handleSelected(rows) {
      if (!rows || rows.length === 0) return
      this.selectedItems = rows
      if (this.multiple) {
        const ids = rows.map((item) => item.id)
        this.$emit('input', ids)
        this.$emit('change', rows)
      } else {
        this.$emit('input', rows[0].id)
        this.$emit('change', rows[0])
      }
    }
  }
}
</script>

<style scoped>
.user-select-v2 {
  width: 100%;
  cursor: pointer;
}

.user-select-v2.is-disabled {
  cursor: not-allowed;
}

.user-tooltip-item + .user-tooltip-item {
  margin-top: 8px;
}
</style>
