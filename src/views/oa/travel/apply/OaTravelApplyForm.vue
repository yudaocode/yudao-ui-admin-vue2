<template>
  <dialog-component :title="dialogTitle" v-model="dialogVisible" width="1200px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="出差事由" prop="reason">
        <el-input
          v-model="formData.reason"
          type="textarea"
          :rows="2"
          placeholder="请输入出差事由"
        />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="9">
          <el-form-item label="开始日期" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择开始日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item label="结束日期" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择结束日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="出差天数">
            <el-input :value="days" placeholder="自动计算" disabled>
              <template slot="append">天</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="同行人" prop="companion">
            <el-input v-model="formData.companion" placeholder="请输入同行人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预计费用" prop="estimatedPrice">
            <el-input-number
              v-model="formData.estimatedPrice"
              placeholder="请输入预计费用"
              :min="0"
              :precision="2"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="附件" prop="fileUrls">
        <upload-file v-model="formData.fileUrls" :is-show-tip="false" />
      </el-form-item>

      <div class="item-header">
        <span class="item-title">行程明细</span>
        <el-button type="primary" plain size="mini" @click="addItem">添加行程</el-button>
      </div>
      <el-table :data="formData.items" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="出发城市" min-width="180">
          <template slot-scope="scope">
            <area-select
              v-model="scope.row.departureAreaId"
              check-strictly
              placeholder="请选择出发城市"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="到达城市" min-width="180">
          <template slot-scope="scope">
            <area-select
              v-model="scope.row.arrivalAreaId"
              check-strictly
              placeholder="请选择到达城市"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="开始日期" min-width="160">
          <template slot-scope="scope">
            <el-date-picker
              v-model="scope.row.startTime"
              type="date"
              value-format="timestamp"
              placeholder="请选择开始日期"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="结束日期" min-width="160">
          <template slot-scope="scope">
            <el-date-picker
              v-model="scope.row.endTime"
              type="date"
              value-format="timestamp"
              placeholder="请选择结束日期"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="交通方式" min-width="140">
          <template slot-scope="scope">
            <el-select v-model="scope.row.transportType" clearable placeholder="请选择交通方式">
              <el-option
                v-for="dict in transportTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="180">
          <template slot-scope="scope">
            <el-input v-model="scope.row.remark" placeholder="请输入备注" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="75" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" class="danger-text" @click="deleteItem(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button
        v-hasPermi="['oa:travel-apply:save']"
        :disabled="formLoading"
        type="primary"
        @click="submitForm"
      >保 存</el-button>
      <el-button :disabled="formLoading" @click="dialogVisible = false">取 消</el-button>
    </div>
  </dialog-component>
</template>

<script>
import dayjs from 'dayjs'
import * as TravelApi from '@/api/oa/travel/apply'
import AreaSelect from '@/views/system/area/components/AreaSelect.vue'
import DialogComponent from '@/components/Dialog'
import UploadFile from '@/components/UploadFile'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { BpmProcessInstanceStatus } from '@/utils/constants'

function createDefaultForm() {
  return {
    id: undefined,
    no: undefined,
    status: BpmProcessInstanceStatus.NOT_START,
    reason: undefined,
    startTime: undefined,
    endTime: undefined,
    companion: undefined,
    estimatedPrice: undefined,
    remark: undefined,
    items: [],
    fileUrls: []
  }
}

export default {
  name: 'OaTravelApplyForm',
  components: { AreaSelect, DialogComponent, UploadFile },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formData: createDefaultForm(),
      formRules: {
        reason: [{ required: true, message: '出差事由不能为空', trigger: 'blur' }],
        startTime: [{ required: true, message: '开始日期不能为空', trigger: 'change' }],
        endTime: [{ required: true, message: '结束日期不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    transportTypeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_TRANSPORT_TYPE)
    },
    days() {
      if (!this.formData.startTime || !this.formData.endTime) return undefined
      return Math.ceil(
        dayjs(Number(this.formData.endTime)).diff(
          dayjs(Number(this.formData.startTime)),
          'hour',
          true
        ) / 24
      )
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = (type === 'create' ? '新增' : '修改') + '出差申请'
      this.resetForm()
      if (!id) return
      this.formLoading = true
      return TravelApi.getTravelApply(id).then(response => {
        this.formData = response.data
      }).finally(() => {
        this.formLoading = false
      })
    },
    addItem() {
      this.formData.items.push({
        departureAreaId: undefined,
        arrivalAreaId: undefined,
        startTime: undefined,
        endTime: undefined,
        transportType: undefined,
        remark: undefined
      })
    },
    deleteItem(index) {
      this.formData.items.splice(index, 1)
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (!this.formData.items.length) {
          return this.$modal.msgWarning('请添加行程明细')
        }
        this.formLoading = true
        const isUpdate = !!this.formData.id
        const request = isUpdate
          ? TravelApi.updateTravelApply(this.formData)
          : TravelApi.createTravelApply(this.formData).then(response => {
            this.formData.id = response.data
          })
        request.then(() => {
          this.$modal.msgSuccess('保存成功')
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

<style scoped>
.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 12px;
}

.item-title {
  font-weight: 700;
}

.danger-text {
  color: #f56c6c;
}
</style>
