<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="820px" @closed="resetForm">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="90px"
    >
      <!-- 公告基本信息 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="公告类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择公告类型" style="width: 100%">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="formData.priority" placeholder="请选择优先级" style="width: 100%">
              <el-option
                v-for="item in priorityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="置顶" prop="top">
            <el-switch v-model="formData.top" />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 公告内容 -->
      <el-form-item label="公告标题" prop="title">
        <el-input
          v-model="formData.title"
          maxlength="255"
          show-word-limit
          placeholder="请输入公告标题"
        />
      </el-form-item>
      <el-form-item label="相关链接" prop="url">
        <el-input v-model="formData.url" maxlength="512" placeholder="请输入相关链接（可选）" />
      </el-form-item>
      <el-form-item label="公告内容" prop="content">
        <Editor v-model="formData.content" height="300px" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as AnnouncementApi from '@/api/oa/announcement'
import Dialog from '@/components/Dialog'
import Editor from '@/components/Editor'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { OA_ANNOUNCEMENT_TYPE, OA_PRIORITY } from '@/views/oa/utils/constants-collab'

function createDefaultForm() {
  return {
    id: undefined,
    type: OA_ANNOUNCEMENT_TYPE.ANNOUNCEMENT,
    priority: OA_PRIORITY.NORMAL,
    title: '',
    content: '',
    url: '',
    top: false
  }
}

export default {
  name: 'OaAnnouncementForm',
  components: { Dialog, Editor },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      formData: createDefaultForm(),
      formRules: {
        type: [{ required: true, message: '公告类型不能为空', trigger: 'change' }],
        priority: [{ required: true, message: '优先级不能为空', trigger: 'change' }],
        title: [
          { required: true, message: '公告标题不能为空', trigger: 'blur' },
          { max: 255, message: '公告标题不能超过 255 个字符', trigger: 'blur' }
        ],
        url: [{ max: 512, message: '相关链接不能超过 512 个字符', trigger: 'blur' }]
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_ANNOUNCEMENT_TYPE)
    },
    priorityOptions() {
      return getIntDictOptions(DICT_TYPE.OA_PRIORITY)
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '添加公告' : '修改公告'
      this.formType = type
      this.resetForm()
      // 修改时，加载公告详情
      if (id) {
        this.formLoading = true
        AnnouncementApi.getAnnouncement(id).then(response => {
          this.formData = response.data
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? AnnouncementApi.createAnnouncement(this.formData)
          : AnnouncementApi.updateAnnouncement(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '添加成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = createDefaultForm()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
