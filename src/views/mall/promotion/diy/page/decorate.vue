<template>
  <DiyEditor
    v-if="formData && !formLoading"
    v-model="formData.property"
    :title="formData.name"
    :libs="PAGE_LIBS"
    @save="submitForm"
  />
</template>

<script>
import * as DiyPageApi from '@/api/mall/promotion/diy/page'
import DiyEditor from '@/components/DiyEditor/index.vue'
import { PAGE_LIBS } from '@/components/DiyEditor/util'

export default {
  name: 'DiyPageDecorate',
  components: { DiyEditor },
  data() {
    return {
      PAGE_LIBS,
      formLoading: false,
      formData: undefined
    }
  },
  created() {
    this.resetForm()
    const id = this.$route && this.$route.params ? this.$route.params.id : undefined
    if (id === undefined || id === null || id === '') {
      this.$modal.msgWarning('参数错误，页面编号不能为空！')
      if (this.$store) this.$store.dispatch('tagsView/delView', this.$route)
      return
    }
    this.getPageDetail(id)
  },
  methods: {
    getPageDetail(id) {
      this.formLoading = true
      return DiyPageApi.getDiyPageProperty(id)
        .then((response) => {
          this.formData = response.data
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    submitForm() {
      this.formLoading = true
      return DiyPageApi.updateDiyPageProperty(this.formData)
        .then(() => {
          this.$modal.msgSuccess('保存成功')
          return true
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    resetForm() {
      this.formData = {
        id: undefined,
        templateId: undefined,
        name: '',
        remark: '',
        previewPicUrls: [],
        property: ''
      }
    }
  }
}
</script>
