<template>
  <div>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1120px" append-to-body>
      <el-form
        ref="form"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <div class="section-title">基本信息</div>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="考勤组名称" prop="name">
              <el-input v-model="formData.name" maxlength="50" placeholder="请输入考勤组名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="适用部门" prop="deptIds">
              <DeptSelect
                v-model="formData.deptIds"
                multiple
                placeholder="请选择部门"
                class="form-control"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="适用员工" prop="employeeIds">
              <HrmEmployeeSelect
                v-model="formData.employeeIds"
                class="form-control"
                multiple
                placeholder="请选择员工"
                title="选择考勤组员工"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">考勤规则</div>
        <el-form-item label="规则类型">
          <el-radio :value="1" :label="1">早晚打卡</el-radio>
        </el-form-item>
        <el-form-item label="班次">
          <div class="form-control">
            <div class="table-toolbar">
              <el-button @click="openShiftForm()">
                <i class="el-icon-plus" /> 新增班次
              </el-button>
            </div>
            <el-table :data="formData.shifts" border>
              <el-table-column label="工作日" min-width="220">
                <template slot-scope="scope">
                  {{ formatWeeks(scope.row.weeks) }}
                </template>
              </el-table-column>
              <el-table-column label="上下班时间" min-width="180">
                <template slot-scope="scope">
                  {{ scope.row.startTime }} - {{ scope.row.endTime }}
                </template>
              </el-table-column>
              <el-table-column label="打卡时间段" min-width="310">
                <template slot-scope="scope">
                  {{ scope.row.clockInStartTime }} - {{ scope.row.clockInEndTime }} /
                  {{ scope.row.clockOutStartTime }} - {{ scope.row.clockOutEndTime }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center">
                <template slot-scope="scope">
                  <el-button type="text" @click="openShiftForm(scope.$index)">编辑</el-button>
                  <el-button type="text" class="danger-button" @click="removeShift(scope.$index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
        <el-form-item label="节假日">
          <el-checkbox v-model="formData.rest">法定节假日休息</el-checkbox>
        </el-form-item>
        <el-form-item label="特殊日期">
          <div class="form-control">
            <div class="table-toolbar">
              <el-button @click="openSpecialDateForm()">
                <i class="el-icon-plus" /> 添加日期
              </el-button>
            </div>
            <el-table :data="formData.specialDates" border>
              <el-table-column label="日期" min-width="180">
                <template slot-scope="scope">
                  {{ formatDate(scope.row.date) }}
                </template>
              </el-table-column>
              <el-table-column label="上下班时间" min-width="220">
                <template slot-scope="scope">
                  {{ formatSpecialDate(scope.row, formData.shifts) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center">
                <template slot-scope="scope">
                  <el-button type="text" @click="openSpecialDateForm(scope.$index)">
                    编辑
                  </el-button>
                  <el-button
                    type="text"
                    class="danger-button"
                    @click="removeSpecialDate(scope.$index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>

        <div class="section-title">打卡方式</div>
        <el-form-item label="定位打卡">
          <div class="form-control">
            <div class="card-toolbar">
              <el-checkbox v-model="formData.openPointCard">关联打卡地址</el-checkbox>
              <el-button :disabled="!formData.openPointCard" @click="openPointForm()">
                <i class="el-icon-plus" /> 新增打卡地址
              </el-button>
            </div>
            <el-table v-if="formData.openPointCard" :data="formData.points" border>
              <el-table-column prop="name" label="地点名称" min-width="150" />
              <el-table-column
                prop="address"
                label="打卡地址"
                min-width="260"
                show-overflow-tooltip
              />
              <el-table-column label="经纬度" min-width="220">
                <template slot-scope="scope">
                  {{ formatPointCoordinate(scope.row) }}
                </template>
              </el-table-column>
              <el-table-column prop="radius" label="范围(米)" width="110" />
              <el-table-column label="操作" width="120" align="center">
                <template slot-scope="scope">
                  <el-button type="text" @click="openPointForm(scope.$index)">编辑</el-button>
                  <el-button type="text" class="danger-button" @click="removePoint(scope.$index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
        <el-form-item label="WiFi 打卡">
          <div class="form-control">
            <div class="card-toolbar">
              <el-checkbox v-model="formData.openWifiCard">关联打卡 WiFi</el-checkbox>
              <el-button :disabled="!formData.openWifiCard" @click="openWifiForm()">
                <i class="el-icon-plus" /> 新增打卡 WiFi
              </el-button>
            </div>
            <el-table v-if="formData.openWifiCard" :data="formData.wifis" border>
              <el-table-column prop="ssid" label="WiFi 名称" min-width="220" />
              <el-table-column prop="mac" label="MAC 地址" min-width="220" />
              <el-table-column label="操作" width="120" align="center">
                <template slot-scope="scope">
                  <el-button type="text" @click="openWifiForm(scope.$index)">编辑</el-button>
                  <el-button type="text" class="danger-button" @click="removeWifi(scope.$index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>

        <div class="section-title">扣款规则</div>
        <el-alert
          class="deduct-alert"
          :closable="false"
          type="info"
          show-icon
          title="扣款金额右侧单位随规则变化：按分钟为元/分钟，按次数为元/次，每月固定为元/月，旷工按元/天。"
        />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="迟到规则" prop="deductRule.lateMethod">
              <el-select v-model="formData.deductRule.lateMethod" class="form-control">
                <el-option
                  v-for="item in lateEarlyDeductOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="迟到计算方式" prop="deductRule.lateDeductMoney">
              <div class="deduct-money-row">
                <el-input-number
                  v-model="formData.deductRule.lateDeductMoney"
                  :controls="false"
                  :min="0"
                  :precision="2"
                  class="deduct-money-input"
                />
                <span>元/{{ formatDeductUnit(formData.deductRule.lateMethod) }}</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="早退规则" prop="deductRule.earlyMethod">
              <el-select v-model="formData.deductRule.earlyMethod" class="form-control">
                <el-option
                  v-for="item in lateEarlyDeductOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="早退计算方式" prop="deductRule.earlyDeductMoney">
              <div class="deduct-money-row">
                <el-input-number
                  v-model="formData.deductRule.earlyDeductMoney"
                  :controls="false"
                  :min="0"
                  :precision="2"
                  class="deduct-money-input"
                />
                <span>元/{{ formatDeductUnit(formData.deductRule.earlyMethod) }}</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="旷工规则" prop="deductRule.absenteeismMethod">
              <el-select v-model="formData.deductRule.absenteeismMethod" class="form-control">
                <el-option
                  v-for="item in absenteeismDeductOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="旷工计算方式" prop="deductRule.absenteeismDeductMoney">
              <div class="deduct-money-row">
                <el-input-number
                  v-model="formData.deductRule.absenteeismDeductMoney"
                  :controls="false"
                  :min="0"
                  :precision="2"
                  class="deduct-money-input"
                />
                <span>元/天</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="缺卡规则" prop="deductRule.misscardMethod">
              <el-select v-model="formData.deductRule.misscardMethod" class="form-control">
                <el-option
                  v-for="item in misscardDeductOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="缺卡计算方式" prop="deductRule.misscardDeductMoney">
              <div class="deduct-money-row">
                <el-input-number
                  v-model="formData.deductRule.misscardDeductMoney"
                  :controls="false"
                  :min="0"
                  :precision="2"
                  class="deduct-money-input"
                />
                <span>元/次</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <AttendanceGroupShiftForm ref="shiftForm" @confirm="handleShiftConfirm" />
    <AttendanceGroupSpecialDateForm ref="specialDateForm" @confirm="handleSpecialDateConfirm" />
    <AttendanceGroupPointForm ref="pointForm" @confirm="handlePointConfirm" />
    <AttendanceGroupWifiForm ref="wifiForm" @confirm="handleWifiConfirm" />
  </div>
</template>

<script>
import {
  createAttendanceGroup,
  getAttendanceGroup,
  updateAttendanceGroup
} from '@/api/hrm/attendance/group'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import HrmEmployeeSelect from '@/views/hrm/employee/components/HrmEmployeeSelect.vue'
import {
  HrmAttendanceAbsenteeismDeductMethod,
  HrmAttendanceLateEarlyDeductMethod,
  HrmAttendanceMisscardDeductMethod,
  HRM_ATTENDANCE_POINT_RADIUS_OPTIONS
} from '@/views/hrm/utils/constants'
import {
  formatHrmAttendanceDeductUnit,
  formatHrmAttendanceSpecialDate,
  formatHrmAttendanceWeeks,
  formatHrmDate
} from '@/views/hrm/utils/format'
import AttendanceGroupPointForm from './AttendanceGroupPointForm.vue'
import AttendanceGroupShiftForm from './AttendanceGroupShiftForm.vue'
import AttendanceGroupSpecialDateForm from './AttendanceGroupSpecialDateForm.vue'
import AttendanceGroupWifiForm from './AttendanceGroupWifiForm.vue'

export default {
  name: 'HrmAttendanceGroupForm',
  components: {
    AttendanceGroupPointForm,
    AttendanceGroupShiftForm,
    AttendanceGroupSpecialDateForm,
    AttendanceGroupWifiForm,
    DeptSelect,
    HrmEmployeeSelect
  },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.createDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '考勤组名称不能为空', trigger: 'blur' }],
        deptIds: [{ validator: this.validateScope, trigger: 'change' }],
        employeeIds: [{ validator: this.validateScope, trigger: 'change' }],
        'deductRule.lateMethod': [
          { required: true, message: '请选择迟到规则', trigger: 'change' }
        ],
        'deductRule.lateDeductMoney': [
          { required: true, message: '请输入迟到扣款金额', trigger: 'blur' }
        ],
        'deductRule.earlyMethod': [
          { required: true, message: '请选择早退规则', trigger: 'change' }
        ],
        'deductRule.earlyDeductMoney': [
          { required: true, message: '请输入早退扣款金额', trigger: 'blur' }
        ],
        'deductRule.absenteeismMethod': [
          { required: true, message: '请选择旷工规则', trigger: 'change' }
        ],
        'deductRule.absenteeismDeductMoney': [
          { required: true, message: '请输入旷工扣款金额', trigger: 'blur' }
        ],
        'deductRule.misscardMethod': [
          { required: true, message: '请选择缺卡规则', trigger: 'change' }
        ],
        'deductRule.misscardDeductMoney': [
          { required: true, message: '请输入缺卡扣款金额', trigger: 'blur' }
        ]
      },
      currentShiftIndex: undefined,
      currentSpecialDateIndex: undefined,
      currentPointIndex: undefined,
      currentWifiIndex: undefined
    }
  },
  computed: {
    lateEarlyDeductOptions() {
      return this.getIntDictOptions(DICT_TYPE.HRM_ATTENDANCE_LATE_EARLY_DEDUCT_METHOD)
    },
    absenteeismDeductOptions() {
      return this.getIntDictOptions(DICT_TYPE.HRM_ATTENDANCE_ABSENTEEISM_DEDUCT_METHOD)
    },
    misscardDeductOptions() {
      return this.getIntDictOptions(DICT_TYPE.HRM_ATTENDANCE_MISSCARD_DEDUCT_METHOD)
    }
  },
  methods: {
    formatWeeks: formatHrmAttendanceWeeks,
    formatSpecialDate: formatHrmAttendanceSpecialDate,
    formatDeductUnit: formatHrmAttendanceDeductUnit,
    formatDate: formatHrmDate,
    getIntDictOptions(type) {
      return getDictDatas(type).map(item => ({ ...item, value: Number(item.value) }))
    },
    /** 打开弹窗 */
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.formType = type
      this.resetForm()
      if (!id) {
        return
      }
      this.formLoading = true
      try {
        const response = await getAttendanceGroup(id)
        this.formData = {
          ...this.createDefaultFormData(),
          ...response.data
        }
      } finally {
        this.formLoading = false
      }
    },
    /** 提交表单 */
    async submitForm() {
      await this.$refs.form.validate()
      if (!this.formData.shifts || !this.formData.shifts.length) {
        this.$modal.msgWarning('请至少新增一个班次')
        return
      }
      if (!this.validateCardSettings()) {
        return
      }
      this.formLoading = true
      try {
        const data = {
          ...this.formData,
          points: this.formData.openPointCard ? this.formData.points : [],
          wifis: this.formData.openWifiCard ? this.formData.wifis : []
        }
        if (this.formType === 'create') {
          await createAttendanceGroup(data)
          this.$modal.msgSuccess('新增成功')
        } else {
          await updateAttendanceGroup(data)
          this.$modal.msgSuccess('修改成功')
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    /** 打开班次表单 */
    openShiftForm(index) {
      this.currentShiftIndex = index
      const shift = index === undefined ? undefined : this.formData.shifts && this.formData.shifts[index]
      if (this.$refs.shiftForm) {
        this.$refs.shiftForm.open(shift)
      }
    },
    /** 保存班次 */
    handleShiftConfirm(shift) {
      const duplicatedWeek = (this.formData.shifts || []).some(
        (item, index) =>
          index !== this.currentShiftIndex && item.weeks.some(week => shift.weeks.includes(week))
      )
      if (duplicatedWeek) {
        this.$modal.msgWarning('同一个工作日只能配置一个班次')
        return
      }
      if (this.currentShiftIndex === undefined) {
        if (this.formData.shifts) {
          this.formData.shifts.push(shift)
        }
      } else if (this.formData.shifts) {
        this.formData.shifts.splice(this.currentShiftIndex, 1, shift)
      }
    },
    /** 删除班次 */
    removeShift(index) {
      if (this.formData.shifts) {
        this.formData.shifts.splice(index, 1)
      }
    },
    /** 打开特殊日期表单 */
    openSpecialDateForm(index) {
      this.currentSpecialDateIndex = index
      const specialDate =
        index === undefined
          ? undefined
          : this.formData.specialDates && this.formData.specialDates[index]
      if (this.$refs.specialDateForm) {
        this.$refs.specialDateForm.open(specialDate)
      }
    },
    /** 保存特殊日期 */
    handleSpecialDateConfirm(specialDate) {
      const duplicatedDate = (this.formData.specialDates || []).some(
        (item, index) =>
          index !== this.currentSpecialDateIndex && Number(item.date) === Number(specialDate.date)
      )
      if (duplicatedDate) {
        this.$modal.msgWarning('特殊日期不能重复')
        return
      }
      if (this.currentSpecialDateIndex === undefined) {
        if (this.formData.specialDates) {
          this.formData.specialDates.push(specialDate)
        }
      } else if (this.formData.specialDates) {
        this.formData.specialDates.splice(this.currentSpecialDateIndex, 1, specialDate)
      }
    },
    /** 删除特殊日期 */
    removeSpecialDate(index) {
      if (this.formData.specialDates) {
        this.formData.specialDates.splice(index, 1)
      }
    },
    /** 格式化打卡地点经纬度 */
    formatPointCoordinate(point) {
      if (point.longitude === undefined || point.latitude === undefined) {
        return '-'
      }
      return `${point.longitude}, ${point.latitude}`
    },
    /** 打开打卡地点表单 */
    openPointForm(index) {
      this.currentPointIndex = index
      const point = index === undefined ? undefined : this.formData.points && this.formData.points[index]
      if (this.$refs.pointForm) {
        this.$refs.pointForm.open(point)
      }
    },
    /** 保存打卡地点 */
    handlePointConfirm(point) {
      if (this.currentPointIndex === undefined) {
        if (this.formData.points) {
          this.formData.points.push(point)
        }
      } else if (this.formData.points) {
        this.formData.points.splice(this.currentPointIndex, 1, point)
      }
    },
    /** 删除定位地点 */
    removePoint(index) {
      if (this.formData.points) {
        this.formData.points.splice(index, 1)
      }
    },
    /** 打开打卡 WiFi 表单 */
    openWifiForm(index) {
      this.currentWifiIndex = index
      const wifi = index === undefined ? undefined : this.formData.wifis && this.formData.wifis[index]
      if (this.$refs.wifiForm) {
        this.$refs.wifiForm.open(wifi)
      }
    },
    /** 保存打卡 WiFi */
    handleWifiConfirm(wifi) {
      if (this.currentWifiIndex === undefined) {
        if (this.formData.wifis) {
          this.formData.wifis.push(wifi)
        }
      } else if (this.formData.wifis) {
        this.formData.wifis.splice(this.currentWifiIndex, 1, wifi)
      }
    },
    /** 删除 WiFi */
    removeWifi(index) {
      if (this.formData.wifis) {
        this.formData.wifis.splice(index, 1)
      }
    },
    /** 校验考勤组适用范围 */
    validateScope(_, __, callback) {
      callback(
        (this.formData.deptIds && this.formData.deptIds.length) ||
          (this.formData.employeeIds && this.formData.employeeIds.length)
          ? undefined
          : new Error('至少选择一个适用部门或员工')
      )
    },
    /** 校验已开启打卡方式的配置是否完整 */
    validateCardSettings() {
      if (!this.formData.openPointCard && !this.formData.openWifiCard) {
        this.$modal.msgWarning('请至少启用定位打卡或 WiFi 打卡')
        return false
      }
      if (this.formData.openPointCard) {
        const points = this.formData.points || []
        const invalidPoint =
          points.length === 0 ||
          points.some(
            point =>
              !point.name ||
              !point.name.trim() ||
              !point.address ||
              !point.address.trim() ||
              point.latitude === undefined ||
              point.longitude === undefined ||
              !Number.isFinite(point.latitude) ||
              point.latitude < -90 ||
              point.latitude > 90 ||
              !Number.isFinite(point.longitude) ||
              point.longitude < -180 ||
              point.longitude > 180 ||
              !point.radius ||
              !HRM_ATTENDANCE_POINT_RADIUS_OPTIONS.some(radius => radius === point.radius)
          )
        if (invalidPoint) {
          this.$modal.msgWarning('请完整填写定位地点、地址、有效经纬度和打卡范围')
          return false
        }
      }
      if (this.formData.openWifiCard) {
        const wifis = this.formData.wifis || []
        const macPattern = /^((([0-9a-f]{2}:){5})|(([0-9a-f]{2}-){5}))[0-9a-f]{2}$/i
        if (
          wifis.length === 0 ||
          wifis.some(
            wifi => !wifi.ssid || !wifi.ssid.trim() || !wifi.mac || !macPattern.test(wifi.mac)
          )
        ) {
          this.$modal.msgWarning('请完整填写 WiFi 名称和正确的 MAC 地址')
          return false
        }
      }
      return true
    },
    /** 重置表单 */
    resetForm() {
      this.formData = this.createDefaultFormData()
      this.currentShiftIndex = undefined
      this.currentSpecialDateIndex = undefined
      this.currentPointIndex = undefined
      this.currentWifiIndex = undefined
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    /** 创建默认考勤组表单数据 */
    createDefaultFormData() {
      return {
        id: undefined,
        name: '',
        openPointCard: false,
        openWifiCard: false,
        rest: true,
        deptIds: [],
        employeeIds: [],
        shifts: [
          {
            weeks: [1, 2, 3, 4, 5],
            startTime: '09:00',
            endTime: '18:00',
            clockInStartTime: '05:00',
            clockInEndTime: '17:59',
            clockOutStartTime: '09:01',
            clockOutEndTime: '04:59',
            restStartTime: '12:00',
            restEndTime: '13:00',
            excludeRestTime: false
          }
        ],
        specialDates: [],
        points: [],
        wifis: [],
        deductRule: this.createDefaultDeductRule()
      }
    },
    /** 创建默认扣款规则 */
    createDefaultDeductRule() {
      return {
        lateMethod: HrmAttendanceLateEarlyDeductMethod.FIXED_MONTH,
        lateDeductMoney: 0,
        earlyMethod: HrmAttendanceLateEarlyDeductMethod.FIXED_MONTH,
        earlyDeductMoney: 0,
        absenteeismMethod: HrmAttendanceAbsenteeismDeductMethod.BY_DAY,
        absenteeismDeductMoney: 0,
        misscardMethod: HrmAttendanceMisscardDeductMethod.BY_COUNT,
        misscardDeductMoney: 0
      }
    }
  }
}
</script>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  margin: 8px 0 20px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.section-title::before {
  width: 4px;
  height: 18px;
  margin-right: 10px;
  background: #409eff;
  border-radius: 2px;
  content: '';
}

.form-control,
.card-toolbar,
.deduct-money-row {
  width: 100%;
}

.table-toolbar {
  margin-bottom: 12px;
  text-align: right;
}

.card-toolbar,
.deduct-money-row {
  display: flex;
  align-items: center;
}

.card-toolbar {
  gap: 16px;
  margin-bottom: 12px;
}

.deduct-money-row {
  gap: 10px;
}

.deduct-money-input {
  flex: 1;
}

.deduct-alert {
  margin-bottom: 16px;
}

.danger-button {
  color: #f56c6c;
}
</style>
