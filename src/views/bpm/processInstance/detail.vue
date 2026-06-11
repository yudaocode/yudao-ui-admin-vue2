<template>
  <ProcessInstanceDetail />
</template>

<script>
import ProcessInstanceDetail from './detail/index.vue'

export default {
  name: 'BpmProcessInstanceDetailWrapper',
  components: {
    ProcessInstanceDetail
  }
}
</script>
