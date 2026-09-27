<template>
  <basic-info-form ref="inner" :info="table" />
</template>

<script>
import BasicInfoForm from '../basicInfoForm.vue'

export default {
  name: 'InfraCodegenBasicInfoForm',
  components: { BasicInfoForm },
  props: { table: { type: Object, default: null } },
  methods: {
    validate(callback) {
      const form = this.$refs.inner && this.$refs.inner.$refs.basicInfoForm
      if (!form) return Promise.resolve(true)
      if (callback) return form.validate(callback)
      return new Promise(resolve => form.validate(resolve))
    }
  }
}
</script>
