<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="1050px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="130px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="会议室名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入名称" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="会议室类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
              <el-option
                v-for="dict in typeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="会议室位置" prop="location">
            <el-input v-model="formData.location" placeholder="请输入位置" maxlength="255" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="负责人" prop="managerUserId">
            <user-select-v2 v-model="formData.managerUserId" @change="handleManagerChange" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责人联系方式">
            <el-input v-model="formData.managerPhone" placeholder="选择负责人后显示" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="可用状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.value"
              >{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="会议室图片" prop="picUrl">
            <upload-img v-model="formData.picUrl" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="坐席数" prop="seatCount">
            <el-input-number v-model="formData.seatCount" :min="1" :precision="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="会议室设备" prop="equipments">
            <el-select
              v-model="formData.equipments"
              placeholder="请选择设备"
              multiple
              style="width: 100%"
            >
              <el-option
                v-for="dict in equipmentOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="允许预定" prop="allowBooking">
            <el-switch v-model="formData.allowBooking" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预定需审批" prop="needApproval">
            <el-switch v-model="formData.needApproval" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="可用范围" prop="bookingScope">
            <el-radio-group v-model="formData.bookingScope">
              <el-radio
                v-for="dict in bookingScopeOptions"
                :key="dict.value"
                :label="dict.value"
              >{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示顺序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" :precision="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item
            v-if="formData.bookingScope === OaMeetingRoomBookingScope.SPECIFIED"
            label="指定成员"
            prop="bookingUserIds"
          >
            <user-select-v2 v-model="formData.bookingUserIds" :multiple="true" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="附件" prop="fileUrls">
            <upload-file v-model="formData.fileUrls" :limit="10" :file-size="10" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as MeetingRoomApi from '@/api/oa/meetingroom/room'
import Dialog from '@/components/Dialog'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import { OaMeetingRoomStatus, OaMeetingRoomBookingScope } from '@/views/oa/utils/constants'

function createDefaultForm() {
  return {
    id: undefined,
    name: undefined,
    location: undefined,
    type: undefined,
    managerUserId: undefined,
    managerName: undefined,
    managerPhone: undefined,
    status: OaMeetingRoomStatus.NORMAL,
    picUrl: undefined,
    seatCount: undefined,
    equipments: [],
    allowBooking: true,
    needApproval: false,
    bookingScope: OaMeetingRoomBookingScope.ALL,
    bookingUserIds: [],
    sort: 0,
    fileUrls: [],
    remark: undefined
  }
}

export default {
  name: 'OaMeetingRoomForm',
  components: { Dialog, UserSelectV2 },
  data() {
    return {
      OaMeetingRoomBookingScope,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: createDefaultForm(),
      formRules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        location: [{ required: true, message: '位置不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
        managerUserId: [{ required: true, message: '负责人不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
        bookingScope: [{ required: true, message: '预定范围不能为空', trigger: 'change' }],
        bookingUserIds: [
          { required: true, type: 'array', min: 1, message: '请选择可预定成员', trigger: 'change' }
        ],
        sort: [{ required: true, message: '排序不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_MEETING_ROOM_TYPE)
    },
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.OA_MEETING_ROOM_STATUS)
    },
    equipmentOptions() {
      return getIntDictOptions(DICT_TYPE.OA_MEETING_ROOM_EQUIPMENT)
    },
    bookingScopeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_MEETING_ROOM_BOOKING_SCOPE)
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增会议室' : '修改会议室'
      this.formType = type
      this.resetForm()
      this.formLoading = true
      if (id) {
        MeetingRoomApi.getMeetingRoom(id).then(response => {
          this.formData = Object.assign(createDefaultForm(), response.data)
        }).finally(() => {
          this.formLoading = false
        })
      } else {
        this.formLoading = false
      }
    },
    handleManagerChange(user) {
      this.formData.managerPhone = user && !Array.isArray(user) ? user.mobile : undefined
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.formLoading = true
        const api = this.formType === 'create'
          ? MeetingRoomApi.createMeetingRoom
          : MeetingRoomApi.updateMeetingRoom
        api(this.formData).then(() => {
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
