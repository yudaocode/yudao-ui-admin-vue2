<template>
  <el-dialog
    title="添加明细"
    :visible.sync="visible"
    width="520px"
    append-to-body
  >
    <el-form ref="form" :model="formData" :rules="formRules" label-width="110px">
      <el-form-item label="科目">
        <el-input :value="subjectLabel" disabled />
      </el-form-item>
      <el-divider content-position="left">辅助核算</el-divider>
      <el-form-item
        v-for="config in auxiliaryConfigs"
        :key="config.auxiliaryTypeId"
        :label="config.name"
        :prop="'items.' + config.auxiliaryTypeId"
      >
        <fms-auxiliary-item-select
          v-model="formData.items[config.auxiliaryTypeId]"
          :account-set-id="accountSetId"
          :auxiliary-type-id="config.auxiliaryTypeId"
          :placeholder="'请选择' + config.name"
          multiple
          @change="handleItemsChange(config.auxiliaryTypeId, $event)"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确定</el-button>
      <el-button @click="visible = false">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import FmsAuxiliaryItemSelect from '@/views/fms/config/auxiliary/components/FmsAuxiliaryItemSelect.vue'

export default {
  name: 'FmsInitialAssistForm',
  components: { FmsAuxiliaryItemSelect },
  data() {
    return {
      visible: false,
      accountSetId: 0,
      subject: null,
      formData: { items: {}},
      selectedItems: {}
    }
  },
  computed: {
    subjectLabel() {
      if (!this.subject) return ''
      return String(this.subject.subjectCode || '') + ' ' + String(this.subject.subjectName || '')
    },
    auxiliaryConfigs() {
      return this.subject && Array.isArray(this.subject.auxiliaryConfigs)
        ? this.subject.auxiliaryConfigs
        : []
    },
    formRules() {
      return this.auxiliaryConfigs.reduce((rules, config) => {
        rules['items.' + config.auxiliaryTypeId] = [
          { required: true, type: 'array', min: 1, message: '请选择' + config.name, trigger: 'change' }
        ]
        return rules
      }, {})
    }
  },
  methods: {
    open(row, accountSetId) {
      this.subject = row || null
      this.accountSetId = Number(accountSetId) || 0
      this.resetForm()
      this.auxiliaryConfigs.forEach(config => {
        this.$set(this.formData.items, config.auxiliaryTypeId, [])
        this.$set(this.selectedItems, config.auxiliaryTypeId, [])
      })
      this.visible = true
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    handleItemsChange(auxiliaryTypeId, items) {
      const selected = Array.isArray(items) ? items : (items ? [items] : [])
      this.$set(this.selectedItems, auxiliaryTypeId, selected)
    },
    submitForm() {
      if (!this.$refs.form || !this.subject) return
      this.$refs.form.validate(valid => {
        if (!valid) return
        const itemGroups = this.auxiliaryConfigs.map(config => this.selectedItems[config.auxiliaryTypeId] || [])
        this.$emit('success', this.buildCombinations(itemGroups))
        this.visible = false
      })
    },
    buildCombinations(itemGroups) {
      return itemGroups.reduce((combinations, items) => {
        const next = []
        combinations.forEach(combination => {
          items.forEach(item => next.push(combination.concat(item)))
        })
        return next
      }, [[]])
    },
    resetForm() {
      this.formData = { items: {}}
      this.selectedItems = {}
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>

<style scoped>
.dialog-footer { text-align: right; }
</style>
