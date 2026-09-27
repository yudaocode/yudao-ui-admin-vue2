<template>
  <div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="20%"
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
          <el-col :span="24">
            <el-form-item
              label="门店名称"
              prop="name"
            >
              <el-input
                v-model="formData.name"
                placeholder="请输入门店名称"
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="门店店员"
              prop="verifyUserIds"
            >
              <el-button
                type="primary"
                @click="openStoreStaffSelect"
              >选择店员</el-button>
            </el-form-item>
            <!-- 店员列表 -->
            <div
              v-if="formData.verifyUsers && formData.verifyUsers.length > 0"
              class="staff-table-wrap"
            >
              <el-table :data="formData.verifyUsers">
                <el-table-column
                  label="编号"
                  align="center"
                  prop="id"
                />
                <el-table-column
                  label="用户昵称"
                  align="center"
                  prop="nickname"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  label="状态"
                  align="center"
                  prop="status"
                >
                  <template v-slot="scope">
                    <dict-tag
                      :type="DICT_TYPE.COMMON_STATUS"
                      :value="scope.row.status"
                    />
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  align="center"
                >
                  <template v-slot="scope">
                    <el-button
                      v-hasPermi="['trade:delivery:pick-up-store:delete']"
                      type="text"
                      size="mini"
                      icon="el-icon-delete"
                      @click="handleDelete(scope.row.id)"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
        </el-row>
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
    </el-dialog>

    <!-- 选择员工弹窗 -->
    <StoreStaffTableSelect
      ref="storeStaffTableSelect"
      @change="handleSelect"
    />
  </div>
</template>

<script>
import * as DeliveryPickUpStoreApi from '@/api/mall/trade/delivery/pickUpStore'
import { DICT_TYPE } from '@/utils/dict'
import StoreStaffTableSelect from './components/StoreStaffTableSelect.vue'

export default {
  name: 'DeliveryPickUpStoreBindForm',
  components: { StoreStaffTableSelect },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formData: this.getDefaultFormData(),
      formRules: {}
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        name: '',
        verifyUsers: []
      }
    },
    /** 打开弹窗 */
    open(id) {
      this.dialogVisible = true
      this.dialogTitle = '绑定自提门店员工'
      this.resetForm()
      this.formLoading = true
      return DeliveryPickUpStoreApi.getDeliveryPickUpStore(id)
        .then((response) => {
          const data = response.data
          this.formData = {
            id: data.id,
            name: data.name || '',
            verifyUsers: Array.isArray(data.verifyUsers) ? data.verifyUsers.slice() : []
          }
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    /** 打开店员选择弹窗，并同步当前已绑定店员 */
    openStoreStaffSelect() {
      this.$refs.storeStaffTableSelect.open(this.formData.verifyUsers)
    },
    /** 提交表单 */
    submitForm() {
      if (!this.$refs.form) return
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.formLoading = true
        const data = {
          id: this.formData.id,
          verifyUserIds: this.formData.verifyUsers.map((item) => item.id)
        }
        DeliveryPickUpStoreApi.bindStoreStaffId(data)
          .then(() => {
            this.$modal.msgSuccess('绑定成功')
            this.dialogVisible = false
          })
          .finally(() => {
            this.formLoading = false
          })
      })
    },
    /** 处理选择员工操作 */
    handleSelect(checkedUsers) {
      this.formData.verifyUsers = Array.isArray(checkedUsers) ? checkedUsers.slice() : []
    },
    /** 删除已选店员 */
    handleDelete(id) {
      const index = this.formData.verifyUsers.findIndex((item) => item.id === id)
      if (index > -1) this.formData.verifyUsers.splice(index, 1)
    },
    /** 重置表单 */
    resetForm() {
      this.formData = this.getDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>

<style scoped>
.staff-table-wrap {
  margin-bottom: 18px;
}
</style>
