<template>
  <div>
    <el-form
      ref="formRef"
      :model="value"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item
        v-if="msgType === MsgType.Message"
        label="消息类型"
        prop="requestMessageType"
      >
        <el-select
          :value="value.requestMessageType"
          placeholder="请选择"
          @input="updateField('requestMessageType', $event)"
        >
          <el-option
            v-for="dict in requestMessageTypeOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        v-if="msgType === MsgType.Keyword"
        label="匹配类型"
        prop="requestMatch"
      >
        <el-select
          :value="value.requestMatch"
          placeholder="请选择匹配类型"
          clearable
          @input="updateField('requestMatch', $event)"
        >
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.MP_AUTO_REPLY_REQUEST_MATCH)"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        v-if="msgType === MsgType.Keyword"
        label="关键词"
        prop="requestKeyword"
      >
        <el-input
          :value="value.requestKeyword"
          placeholder="请输入内容"
          clearable
          @input="updateField('requestKeyword', $event)"
        />
      </el-form-item>

      <el-form-item label="回复消息">
        <wx-reply-select
          :value="reply"
          @input="updateReply"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import WxReplySelect from '@/views/mp/components/wx-reply/main.vue'
import { MsgType } from './types'

const REQUEST_MESSAGE_TYPES = ['text', 'image', 'voice', 'video', 'shortvideo', 'location', 'link']

export default {
  name: 'ReplyForm',
  components: { WxReplySelect },
  props: {
    value: {
      type: Object,
      required: true
    },
    reply: {
      type: Object,
      required: true
    },
    msgType: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      MsgType,
      rules: {
        requestKeyword: [{ required: true, message: '请求的关键字不能为空', trigger: 'blur' }],
        requestMatch: [{ required: true, message: '请求的关键字的匹配不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    requestMessageTypeOptions() {
      return this.getDictDatas(this.DICT_TYPE.MP_MESSAGE_TYPE)
        .filter(item => REQUEST_MESSAGE_TYPES.includes(item.value))
    }
  },
  methods: {
    updateField(field, fieldValue) {
      this.$emit('input', Object.assign({}, this.value, { [field]: fieldValue }))
    },
    updateReply(reply) {
      this.$emit('update:reply', Object.assign({}, reply))
    },
    validate(callback) {
      return this.$refs.formRef.validate(callback)
    },
    resetFields() {
      if (this.$refs.formRef) this.$refs.formRef.resetFields()
    }
  }
}
</script>
