<template>
  <div>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="640px" append-to-body>
      <el-form ref="form" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="地点名称" prop="name">
        <el-input v-model="formData.name" maxlength="50" placeholder="请输入地点名称" />
      </el-form-item>
      <el-form-item label="打卡地址" prop="address">
        <el-input v-model="formData.address" maxlength="255" placeholder="请选择或输入地址" />
      </el-form-item>
      <el-form-item label="经纬度" required>
        <div class="coordinate-row">
          <el-form-item prop="longitude" class="coordinate-item">
            <el-input-number
              v-model="formData.longitude"
              :controls="false"
              :min="-180"
              :max="180"
              :precision="6"
              class="form-control"
              placeholder="经度"
            />
          </el-form-item>
          <el-form-item prop="latitude" class="coordinate-item">
            <el-input-number
              v-model="formData.latitude"
              :controls="false"
              :min="-90"
              :max="90"
              :precision="6"
              class="form-control"
              placeholder="纬度"
            />
          </el-form-item>
          <el-button type="primary" @click="openMap">地图选点</el-button>
        </div>
      </el-form-item>
      <el-form-item label="打卡范围" prop="radius">
        <div class="radius-row">
          <el-select v-model="formData.radius" class="radius-select">
            <el-option
              v-for="radius in pointRadiusOptions"
              :key="radius"
              :label="`${radius} 米`"
              :value="radius"
            />
          </el-select>
        </div>
      </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <MapDialog ref="mapDialog" @confirm="handleMapConfirm" />
  </div>
</template>

<script>
import { MapDialog } from '@/components/Map'
import { HRM_ATTENDANCE_POINT_RADIUS_OPTIONS } from '@/views/hrm/utils/constants'

export default {
  name: 'HrmAttendanceGroupPointForm',
  components: { MapDialog },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formData: this.createDefaultPoint(),
      formRules: {
        name: [{ required: true, message: '地点名称不能为空', trigger: 'blur' }],
        address: [{ required: true, message: '打卡地址不能为空', trigger: 'blur' }],
        longitude: [{ required: true, message: '经度不能为空', trigger: 'change' }],
        latitude: [{ required: true, message: '纬度不能为空', trigger: 'change' }],
        radius: [{ required: true, message: '打卡范围不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    pointRadiusOptions() {
      return HRM_ATTENDANCE_POINT_RADIUS_OPTIONS
    }
  },
  methods: {
    /** 打开弹窗 */
    open(point) {
      this.dialogVisible = true
      this.dialogTitle = point ? '编辑打卡地址' : '新增打卡地址'
      this.resetForm()
      if (point) {
        this.formData = { ...point }
      }
    },
    /** 提交表单 */
    async submitForm() {
      await this.$refs.form.validate()
      this.$emit('confirm', { ...this.formData })
      this.dialogVisible = false
    },
    /** 打开地图坐标拾取 */
    openMap() {
      const longitude = Number.isFinite(this.formData.longitude)
        ? this.formData.longitude
        : undefined
      const latitude = Number.isFinite(this.formData.latitude) ? this.formData.latitude : undefined
      if (this.$refs.mapDialog) {
        this.$refs.mapDialog.open(longitude, latitude)
      }
    },
    /** 回填地图坐标和地址 */
    handleMapConfirm(data) {
      this.formData.longitude = Number(data.longitude)
      this.formData.latitude = Number(data.latitude)
      if (data.address) {
        this.formData.address = data.address
      }
    },
    /** 重置表单 */
    resetForm() {
      this.formData = this.createDefaultPoint()
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    /** 创建默认打卡地点 */
    createDefaultPoint() {
      return {
        name: '',
        address: '',
        latitude: undefined,
        longitude: undefined,
        radius: 300
      }
    }
  }
}
</script>

<style scoped>
.coordinate-row {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
}

.coordinate-item {
  flex: 1;
  margin-bottom: 0;
}

.form-control {
  width: 100%;
}

.radius-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.radius-select {
  width: 240px;
}
</style>
