<template>
  <el-card shadow="never" class="home-card">
    <div slot="header" class="home-card__title">待办提醒</div>
    <div class="todo-grid">
      <button
        v-for="todo in todoItems"
        :key="todo.label"
        :disabled="todo.disabled"
        :class="['todo-button', { 'todo-button--clickable': !todo.disabled }]"
        type="button"
        @click="goTodo(todo.action)"
      >
        <strong>{{ todo.value }}</strong>
        <span>{{ todo.label }}</span>
        <small>{{ todo.unit }}</small>
      </button>
    </div>
  </el-card>
</template>

<script>
import { checkPermi } from '@/utils/permission'
import { HrmEmployeeStatusTab, HrmEmployeeTodoType } from '@/views/hrm/utils/constants'

export default {
  name: 'HrmHomeTodoSurvey',
  props: {
    survey: { type: Object, default: undefined }
  },
  computed: {
    canQueryEmployee() {
      return checkPermi(['hrm:employee:query'])
    },
    canQuerySalary() {
      return checkPermi(['hrm:salary:month-record:query'])
    },
    todoItems() {
      const survey = this.survey || {}
      return [
        { label: '待核算薪资', value: survey.toSalaryComputeCount || 0, unit: '条', action: 'salary', disabled: !this.canQuerySalary || !survey.toSalaryComputeCount },
        { label: '待离职', value: survey.toLeaveCount || 0, unit: '人', action: 'leave', disabled: !this.canQueryEmployee },
        { label: '合同到期', value: survey.toExpireContractCount || 0, unit: '人', action: 'contract', disabled: !this.canQueryEmployee },
        { label: '待转正', value: survey.toRegularCount || 0, unit: '人', action: 'regular', disabled: !this.canQueryEmployee },
        { label: '待入职', value: survey.toEntryCount || 0, unit: '人', action: 'entry', disabled: !this.canQueryEmployee },
        { label: '生日', value: survey.toBirthdayCount || 0, unit: '人', action: 'birthday', disabled: !this.canQueryEmployee }
      ]
    }
  },
  methods: {
    /** 打开待办对应的业务列表 */
    goTodo(action) {
      if (action === 'salary') {
        if (this.canQuerySalary) this.$router.push({ name: 'HrmSalaryMonthRecord' })
        return
      }
      if (!this.canQueryEmployee) return
      const employeeFilters = {
        leave: { todoType: HrmEmployeeTodoType.PENDING_LEAVE, statusCategory: HrmEmployeeStatusTab.PENDING_LEAVE },
        contract: { todoType: HrmEmployeeTodoType.CONTRACT_EXPIRE, statusCategory: HrmEmployeeStatusTab.ACTIVE },
        regular: { todoType: HrmEmployeeTodoType.REGULAR, statusCategory: HrmEmployeeStatusTab.ACTIVE },
        entry: { todoType: HrmEmployeeTodoType.PENDING_ENTRY, statusCategory: HrmEmployeeStatusTab.PENDING_ENTRY },
        birthday: { todoType: HrmEmployeeTodoType.BIRTHDAY, statusCategory: HrmEmployeeStatusTab.ACTIVE }
      }
      this.$router.push({ name: 'HrmEmployee', query: employeeFilters[action] })
    }
  }
}
</script>

<style scoped>
.home-card { margin-bottom: 16px; }
.home-card__title { color: #303133; font-size: 16px; font-weight: 600; }
.todo-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); row-gap: 20px; }
.todo-button { position: relative; min-height: 78px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0; border: 0; background: transparent; cursor: default; }
.todo-button strong { color: #303133; font-size: 22px; line-height: 28px; }
.todo-button span { margin-top: 6px; color: #909399; font-size: 13px; }
.todo-button small { position: absolute; top: 18px; left: calc(50% + 18px); color: #c0c4cc; }
.todo-button--clickable { cursor: pointer; }
.todo-button--clickable:hover strong, .todo-button--clickable:hover span { color: #409eff; }
</style>
