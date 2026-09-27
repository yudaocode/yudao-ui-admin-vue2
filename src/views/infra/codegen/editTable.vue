<template>
  <el-card v-loading="formLoading">
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="basicInfo">
        <basic-info-form ref="basicInfoRef" :table="formData.table" />
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="colum">
        <colum-info-form ref="columInfoRef" :columns="formData.columns" :dict-options="dictOptions" />
      </el-tab-pane>
      <el-tab-pane label="生成信息" name="generateInfo">
        <generate-info-form
          ref="generateInfoRef"
          :table="formData.table"
          :columns="formData.columns"
          :menus="menus"
        />
      </el-tab-pane>
    </el-tabs>
    <el-form>
      <el-form-item class="edit-actions">
        <el-button type="primary" :loading="formLoading" @click="submitForm">保存</el-button>
        <el-button @click="close">返回</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { getCodegenTable, updateCodegenTable } from '@/api/infra/codegen'
import { getSimpleDictTypeList } from '@/api/system/dict/type'
import { getSimpleMenusList } from '@/api/system/menu'
import { BasicInfoForm, ColumInfoForm, GenerateInfoForm } from './components'

export default {
  name: 'InfraCodegenEditTable',
  components: { BasicInfoForm, ColumInfoForm, GenerateInfoForm },
  data() {
    return {
      formLoading: false,
      activeName: 'colum',
      formData: {
        table: {},
        columns: []
      },
      dictOptions: [],
      menus: []
    }
  },
  created() {
    this.getDetail()
    this.getDictOptions()
    this.getMenus()
  },
  methods: {
    getDetail() {
      const route = this.$route || {}
      const id = (route.query && route.query.id) || (route.params && route.params.tableId)
      if (!id) return
      this.formLoading = true
      return getCodegenTable(id).then(response => {
        const data = response.data
        if (data) {
          this.formData = Object.assign({ table: {}, columns: [] }, data)
          this.formData.table = this.formData.table || {}
          this.formData.columns = this.formData.columns || []
        }
      }).finally(() => {
        this.formLoading = false
      })
    },
    getMenus() {
      return getSimpleMenusList().then(response => {
        const data = response.data
        this.menus = this.handleTree(data, 'id')
      })
    },
    getDictOptions() {
      return getSimpleDictTypeList().then(response => {
        this.dictOptions = response.data
      })
    },
    submitForm() {
      const basicForm = this.$refs.basicInfoRef
      const generateForm = this.$refs.generateInfoRef
      Promise.all([
        basicForm ? basicForm.validate() : Promise.resolve(true),
        generateForm ? generateForm.validate() : Promise.resolve(true)
      ]).then(results => {
        if (!results.every(Boolean)) {
          this.$modal.msgError('表单校验未通过，请重新检查提交内容')
          return
        }
        this.formLoading = true
        return updateCodegenTable(this.formData).then(() => {
          this.$modal.msgSuccess('修改成功')
          this.close()
        }).finally(() => {
          this.formLoading = false
        })
      }).catch(() => {})
    },
    close() {
      if (this.$tab && this.$tab.closeOpenPage) {
        this.$tab.closeOpenPage({ path: '/infra/codegen' })
      } else {
        this.$router.push('/infra/codegen')
      }
    }
  }
}
</script>

<style scoped>
.edit-actions {
  text-align: right;
  margin-bottom: 0;
}
</style>
