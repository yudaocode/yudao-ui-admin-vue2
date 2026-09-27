<template>
  <el-form ref="form" :model="value" :rules="rules" label-width="120px">
    <el-row>
      <el-col :span="24">
        <el-form-item label="流程标识" prop="code">
          <el-input
            :value="value.code"
            placeholder="请输入流程标识"
            @input="updateField('code', $event)"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="流程名称" prop="name">
          <el-input
            :value="value.name"
            placeholder="请输入流程名称"
            @input="updateField('name', $event)"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="状态" prop="status">
          <el-select
            :value="value.status"
            placeholder="请选择状态"
            style="width: 100%"
            @input="updateField('status', $event)"
          >
            <el-option
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="备注" prop="remark">
          <el-input
            :value="value.remark"
            :rows="2"
            type="textarea"
            placeholder="请输入备注"
            @input="updateField('remark', $event)"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'AiWorkflowBasicInfo',
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      statusOptions: getDictDatas(DICT_TYPE.COMMON_STATUS),
      rules: {
        code: [{ required: true, message: '流程标识不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '流程名称不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    updateField(field, fieldValue) {
      this.$emit('input', Object.assign({}, this.value, { [field]: fieldValue }))
    },
    validate() {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate(valid => {
          if (valid) resolve(true)
          else reject(new Error('请完善基本信息'))
        })
      })
    }
  }
}
</script>
