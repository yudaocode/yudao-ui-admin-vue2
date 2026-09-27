<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="1000px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="会议室" prop="roomId">
        <el-input
          v-model="formData.roomName"
          placeholder="请选择会议室"
          readonly
          class="cursor-pointer"
          @click="$refs.roomSelect.open(formData.roomId)"
        >
          <i slot="suffix" class="el-input__icon el-icon-search" />
        </el-input>
      </el-form-item>
      <el-form-item label="会议室位置">
        <el-input v-model="formData.roomLocation" disabled placeholder="选择会议室后显示" />
      </el-form-item>
      <el-form-item label="会议主题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入会议主题" maxlength="200" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="会议开始时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              type="datetime"
              placeholder="请选择开始时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="会议结束时间" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              type="datetime"
              placeholder="请选择结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="主持人" prop="moderatorUserId">
            <user-select-v2 v-model="formData.moderatorUserId" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="会议提醒" prop="reminderType">
            <el-select v-model="formData.reminderType" placeholder="请选择提醒方式" style="width: 100%">
              <el-option
                v-for="dict in reminderTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="参会人员" prop="attendeeUserIds">
        <user-select-v2 v-model="formData.attendeeUserIds" :multiple="true" />
      </el-form-item>
      <el-form-item label="会议说明" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入会议内容"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="申请备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="附件" prop="fileUrls">
        <upload-file v-model="formData.fileUrls" :limit="5" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
    <oa-meeting-room-select-dialog ref="roomSelect" @select="handleRoomSelect" />
  </Dialog>
</template>

<script>
import dayjs from 'dayjs'
import * as MeetingRoomBookingApi from '@/api/oa/meetingroom/booking'
import Dialog from '@/components/Dialog'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import OaMeetingRoomSelectDialog from '../room/components/OaMeetingRoomSelectDialog.vue'
import { OaMeetingRoomReminderType } from '@/views/oa/utils/constants'

function createDefaultForm() {
  return {
    id: undefined,
    roomId: undefined,
    roomName: undefined,
    roomLocation: undefined,
    title: undefined,
    startTime: undefined,
    endTime: undefined,
    moderatorUserId: undefined,
    attendeeUserIds: [],
    reminderType: OaMeetingRoomReminderType.NONE,
    description: undefined,
    remark: undefined,
    fileUrls: []
  }
}

export default {
  name: 'OaMeetingRoomBookingForm',
  components: { Dialog, UserSelectV2, OaMeetingRoomSelectDialog },
  data() {
    const validateEndTime = (rule, value, callback) => {
      if (value && this.formData.startTime && Number(value) <= Number(this.formData.startTime)) {
        callback(new Error('结束时间必须晚于开始时间'))
      } else {
        callback()
      }
    }
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: createDefaultForm(),
      formRules: {
        roomId: [{ required: true, message: '会议室不能为空', trigger: 'change' }],
        title: [{ required: true, message: '会议主题不能为空', trigger: 'blur' }],
        startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
        endTime: [
          { required: true, message: '结束时间不能为空', trigger: 'change' },
          { validator: validateEndTime, trigger: 'change' }
        ],
        moderatorUserId: [{ required: true, message: '主持人不能为空', trigger: 'change' }],
        reminderType: [{ required: true, message: '提醒方式不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    reminderTypeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_MEETING_ROOM_REMINDER_TYPE)
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增会议室预定' : '修改会议室预定'
      this.formType = type
      this.resetForm()
      this.formLoading = true
      if (id) {
        MeetingRoomBookingApi.getMeetingRoomBooking(id).then(response => {
          this.formData = Object.assign(createDefaultForm(), response.data)
        }).finally(() => {
          this.formLoading = false
        })
      } else {
        this.formLoading = false
      }
    },
    // 选择会议室，回显名称和位置
    handleRoomSelect(room) {
      this.formData.roomId = room.id
      this.formData.roomLocation = room.location
      this.formData.roomName = room.name
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.formLoading = true
        // 时间统一转为毫秒时间戳
        const data = Object.assign({}, this.formData, {
          startTime: this.formData.startTime ? dayjs(this.formData.startTime).valueOf() : undefined,
          endTime: this.formData.endTime ? dayjs(this.formData.endTime).valueOf() : undefined
        })
        const api = this.formType === 'create'
          ? MeetingRoomBookingApi.createMeetingRoomBooking
          : MeetingRoomBookingApi.updateMeetingRoomBooking
        api(data).then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
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
        this.$refs.form && this.$refs.form.resetFields()
      })
    }
  }
}
</script>

<style scoped>
.cursor-pointer >>> input {
  cursor: pointer;
}
</style>
