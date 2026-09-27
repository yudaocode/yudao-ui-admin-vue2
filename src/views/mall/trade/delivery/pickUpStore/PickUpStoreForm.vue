<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="60%"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="门店 logo"
            prop="logo"
          >
            <ImageUpload
              v-model="formData.logo"
              :limit="1"
              :is-show-tip="false"
            />
            <div style="padding-left: 10px; font-size: 10px">推荐 180x180 图片分辨率</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="门店状态"
            prop="status"
          >
            <el-radio-group v-model="formData.status">
              <el-radio
                v-for="dict in statusDictDatas"
                :key="dict.value"
                :label="parseInt(dict.value)"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="门店名称"
            prop="name"
          >
            <el-input
              v-model="formData.name"
              placeholder="请输入门店名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="门店手机"
            prop="phone"
          >
            <el-input
              v-model="formData.phone"
              placeholder="请输入门店手机"
              maxlength="11"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="门店简介"
        prop="introduction"
      >
        <el-input
          v-model="formData.introduction"
          :rows="3"
          type="textarea"
          placeholder="请输入门店简介"
        />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="门店所在地区"
            prop="areaId"
          >
            <el-cascader
              v-model="formData.areaId"
              :options="areaList"
              :props="areaCascaderProps"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="门店详细地址"
            prop="detailAddress"
          >
            <el-input
              v-model="formData.detailAddress"
              placeholder="请输入门店详细地址"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="营业开始时间"
            prop="openingTime"
          >
            <el-time-select
              v-model="formData.openingTime"
              :picker-options="openingTimeOptions"
              placeholder="开始时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="营业结束时间"
            prop="closingTime"
          >
            <el-time-select
              v-model="formData.closingTime"
              :picker-options="closingTimeOptions"
              placeholder="结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="经度"
            prop="longitude"
          >
            <el-input
              v-model="formData.longitude"
              placeholder="请输入门店经度"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="纬度"
            prop="latitude"
          >
            <el-input
              v-model="formData.latitude"
              placeholder="请输入门店纬度"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="获取经纬度">
        <el-button
          type="primary"
          @click="mapDialogVisible = true"
        >获取</el-button>
      </el-form-item>
    </el-form>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>

    <el-dialog
      title="获取经纬度"
      :visible.sync="mapDialogVisible"
      width="70%"
      append-to-body
    >
      <IFrame
        class="map-frame"
        :src="tencentLbsUrl"
      />
    </el-dialog>
  </el-dialog>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'
import IFrame from '@/components/iFrame/index'
import * as DeliveryPickUpStoreApi from '@/api/mall/trade/delivery/pickUpStore'
import { getTradeConfig } from '@/api/mall/trade/config'
import { getAreaTree } from '@/api/system/area'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'DeliveryPickUpStoreForm',
  components: { ImageUpload, IFrame },
  data() {
    return {
      dialogVisible: false,
      mapDialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.getDefaultFormData(),
      areaList: [],
      areaCascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children',
        emitPath: false
      },
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      tencentLbsUrl: '',
      formRules: {
        name: [{ required: true, message: '门店名称不能为空', trigger: 'blur' }],
        logo: [{ required: true, message: '门店 logo 不能为空', trigger: 'blur' }],
        phone: [
          { required: true, message: '门店手机不能为空', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        areaId: [{ required: true, message: '门店所在区域不能为空', trigger: 'blur' }],
        detailAddress: [{ required: true, message: '门店详细地址不能为空', trigger: 'blur' }],
        openingTime: [{ required: true, message: '营业开始时间不能为空', trigger: 'blur' }],
        closingTime: [{ required: true, message: '营业结束时间不能为空', trigger: 'blur' }],
        latitude: [{ required: true, message: '纬度不能为空', trigger: 'blur' }],
        longitude: [{ required: true, message: '经度不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '开启状态不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    openingTimeOptions() {
      return {
        start: '08:30',
        step: '00:15',
        end: '23:30',
        maxTime: this.formData.closingTime
      }
    },
    closingTimeOptions() {
      return {
        start: '08:30',
        step: '00:15',
        end: '23:30',
        minTime: this.formData.openingTime
      }
    }
  },
  mounted() {
    this.loadAreaTree()
    this.initTencentLbsMap()
  },
  beforeDestroy() {
    window.removeEventListener('message', this.handleMapMessage, false)
    if (window.selectAddress === this.selectAddress) {
      delete window.selectAddress
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        name: '',
        phone: '',
        logo: '',
        detailAddress: '',
        introduction: '',
        areaId: undefined,
        openingTime: undefined,
        closingTime: undefined,
        latitude: undefined,
        longitude: undefined,
        status: CommonStatusEnum.ENABLE
      }
    },
    /** 打开弹窗 */
    open(type, id) {
      this.dialogVisible = true
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改自提门店' : '新增自提门店'
      this.resetForm()
      if (id === undefined || id === null) return Promise.resolve()
      this.formLoading = true
      return DeliveryPickUpStoreApi.getDeliveryPickUpStore(id)
        .then((response) => {
          this.formData = Object.assign(this.getDefaultFormData(), response.data)
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    /** 提交表单 */
    submitForm() {
      if (!this.$refs.form) return
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? DeliveryPickUpStoreApi.createDeliveryPickUpStore(this.formData)
          : DeliveryPickUpStoreApi.updateDeliveryPickUpStore(this.formData)
        request
          .then(() => {
            this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
            this.dialogVisible = false
            this.$emit('success')
          })
          .finally(() => {
            this.formLoading = false
          })
      })
    },
    /** 重置表单 */
    resetForm() {
      this.formData = this.getDefaultFormData()
      this.mapDialogVisible = false
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    /** 加载区域树 */
    loadAreaTree() {
      return getAreaTree().then((response) => {
        this.areaList = response.data
      })
    },
    /** 选择经纬度 */
    selectAddress(loc) {
      if (loc && loc.latlng && loc.latlng.lat !== undefined) {
        this.formData.latitude = loc.latlng.lat
      }
      if (loc && loc.latlng && loc.latlng.lng !== undefined) {
        this.formData.longitude = loc.latlng.lng
      }
      this.mapDialogVisible = false
    },
    /** 接收腾讯位置选择器回传的数据 */
    handleMapMessage(event) {
      const loc = event && event.data
      if (!loc || loc.module !== 'locationPicker') return
      if (window.parent && typeof window.parent.selectAddress === 'function') {
        window.parent.selectAddress(loc)
      } else {
        this.selectAddress(loc)
      }
    },
    /** 初始化腾讯地图 */
    initTencentLbsMap() {
      window.selectAddress = this.selectAddress
      window.addEventListener('message', this.handleMapMessage, false)
      return getTradeConfig().then((response) => {
        const config = response.data
        const key = config.tencentLbsKey || ''
        this.tencentLbsUrl = 'https://apis.map.qq.com/tools/locpicker?type=1&key=' + key + '&referer=myapp'
      })
    }
  }
}
</script>

<style scoped>
.map-frame {
  display: block;
  width: 100%;
  min-height: 609px;
}
</style>
