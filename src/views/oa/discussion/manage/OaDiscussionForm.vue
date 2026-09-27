<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="850px" @closed="resetForm">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="90px"
    >
      <!-- 讨论内容 -->
      <el-form-item label="讨论类型" prop="type">
        <el-select v-model="formData.type" :disabled="isUpdate" placeholder="请选择讨论类型" style="width: 100%">
          <el-option
            v-for="item in discussionTypeOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入讨论标题"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="正文" prop="content">
        <Editor v-model="formData.content" height="280px" />
      </el-form-item>
      <el-form-item label="附件">
        <UploadFile v-model="formData.fileUrls" />
      </el-form-item>

      <!-- 投票配置 -->
      <template v-if="formData.type === OA_DISCUSSION_TYPE.VOTE">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="允许多选" prop="voteMultiple">
              <el-switch v-model="formData.voteMultiple" :disabled="isUpdate" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开始时间" prop="voteStartTime">
              <el-date-picker
                v-model="formData.voteStartTime"
                type="datetime"
                value-format="timestamp"
                style="width: 100%"
                :disabled="isUpdate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结束时间" prop="voteEndTime">
              <el-date-picker
                v-model="formData.voteEndTime"
                type="datetime"
                value-format="timestamp"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="投票选项">
          <div class="vote-options">
            <div
              v-for="(option, index) in formData.voteOptions"
              :key="index"
              class="vote-option-row"
            >
              <el-input
                v-model="option.title"
                :placeholder="'选项 ' + (index + 1)"
                maxlength="200"
                :disabled="isUpdate"
              />
              <el-color-picker v-model="option.color" :disabled="isUpdate" />
              <el-button
                v-if="!isUpdate"
                type="text"
                class="danger-text"
                :disabled="formData.voteOptions.length <= 2"
                @click="handleDeleteVoteOption(index)"
              >删除</el-button>
            </div>
            <el-button v-if="!isUpdate" plain size="small" icon="el-icon-plus" @click="handleAddVoteOption">新增选项</el-button>
          </div>
        </el-form-item>
      </template>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as DiscussionApi from '@/api/oa/discussion'
import Dialog from '@/components/Dialog'
import Editor from '@/components/Editor'
import UploadFile from '@/components/UploadFile'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { OA_DISCUSSION_TYPE } from '../../utils/constants-collab'

/** 创建默认投票选项 */
function createDefaultVoteOptions() {
  return [
    { title: '', color: '#409EFF', sort: 0 },
    { title: '', color: '#67C23A', sort: 1 }
  ]
}

function createDefaultFormData() {
  return {
    id: undefined,
    type: OA_DISCUSSION_TYPE.DISCUSSION,
    title: '',
    content: '',
    fileUrls: [],
    voteMultiple: false,
    voteStartTime: '',
    voteEndTime: '',
    voteOptions: createDefaultVoteOptions()
  }
}

export default {
  name: 'OaDiscussionForm',
  components: { Dialog, Editor, UploadFile },
  data() {
    return {
      OA_DISCUSSION_TYPE,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      isUpdate: false,
      formData: createDefaultFormData(),
      formRules: {
        type: [{ required: true, message: '讨论类型不能为空', trigger: 'change' }],
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        voteStartTime: [{ required: true, message: '投票开始时间不能为空', trigger: 'change' }],
        voteEndTime: [{ required: true, message: '投票结束时间不能为空', trigger: 'change' }]
      },
      discussionTypeOptions: getIntDictOptions(DICT_TYPE.OA_DISCUSSION_TYPE)
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '发布讨论' : '修改讨论'
      this.isUpdate = type === 'update'
      this.resetForm()
      // 修改时，加载讨论详情
      if (id) {
        this.formLoading = true
        DiscussionApi.getDiscussion(id).then(response => {
          this.formData = response.data
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    /** 新增投票选项 */
    handleAddVoteOption() {
      this.formData.voteOptions.push({
        title: '',
        color: '#409EFF',
        sort: this.formData.voteOptions.length
      })
    },
    /** 删除投票选项 */
    handleDeleteVoteOption(index) {
      this.formData.voteOptions.splice(index, 1)
    },
    submitForm() {
      if (this.formLoading) return
      this.$refs.form.validate(valid => {
        if (!valid) return
        // 校验并整理投票选项
        if (this.formData.type === OA_DISCUSSION_TYPE.VOTE) {
          const options = this.formData.voteOptions || []
          if (options.length < 2 || options.some(item => !item.title.trim())) {
            this.$modal.msgError('请至少填写两个投票选项')
            return
          }
          if (Number(this.formData.voteEndTime) <= Number(this.formData.voteStartTime)) {
            this.$modal.msgError('投票结束时间必须晚于开始时间')
            return
          }
          options.forEach((item, index) => (item.sort = index))
        }
        this.formLoading = true
        const isVote = this.formData.type === OA_DISCUSSION_TYPE.VOTE
        const data = Object.assign({}, this.formData, {
          voteMultiple: isVote ? this.formData.voteMultiple : undefined,
          voteStartTime: isVote ? this.formData.voteStartTime : undefined,
          voteEndTime: isVote ? this.formData.voteEndTime : undefined,
          voteOptions: isVote ? this.formData.voteOptions : []
        })
        const request = !this.isUpdate
          ? DiscussionApi.createDiscussion(data)
          : DiscussionApi.updateDiscussion(data)
        request.then(() => {
          this.$modal.msgSuccess(!this.isUpdate ? '发布成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = createDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>

<style scoped>
.vote-options {
  width: 100%;
}

.vote-option-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.danger-text {
  color: #f56c6c;
}
</style>
