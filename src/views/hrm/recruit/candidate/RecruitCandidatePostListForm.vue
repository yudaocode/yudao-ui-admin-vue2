<template>
  <el-dialog
    title="批量修改应聘职位"
    :visible.sync="dialogVisible"
    width="520px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="96px"
    >
      <el-form-item label="候选人数"><el-input
        :value="`${candidateIds.length} 人`"
        disabled
      /></el-form-item>
      <el-form-item
        label="应聘职位"
        prop="postId"
      ><recruit-post-select
        v-model="formData.postId"
        :clearable="false"
        class="full-width"
        placeholder="请选择应聘职位"
      /></el-form-item>
    </el-form>
    <span slot="footer"><el-button
      :disabled="formLoading"
      type="primary"
      @click="submitForm"
    >保存</el-button><el-button @click="dialogVisible = false">取消</el-button></span>
  </el-dialog>
</template>
<script>
import { updateRecruitCandidatePost } from '@/api/hrm/recruit/candidate'
import RecruitPostSelect from '@/views/hrm/recruit/post/components/RecruitPostSelect.vue'
import { executeHrmBatch } from '@/views/hrm/utils/batch'
export default {
  name: 'HrmRecruitCandidatePostListForm', components: { RecruitPostSelect },
  data() { return { dialogVisible: false, formLoading: false, candidateIds: [], formData: { postId: undefined }, formRules: { postId: [{ required: true, message: '应聘职位不能为空', trigger: 'change' }] }} },
  methods: {
    open(ids) { this.candidateIds = [...ids]; this.resetForm(); this.dialogVisible = true },
    async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { const success = await executeHrmBatch(this, this.candidateIds.map(id => updateRecruitCandidatePost({ id, postId: this.formData.postId }))); if (!success) return; this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } },
    resetForm() { this.formData.postId = undefined; this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) }
  }
}
</script>
<style scoped>.full-width { width: 100%; }</style>
