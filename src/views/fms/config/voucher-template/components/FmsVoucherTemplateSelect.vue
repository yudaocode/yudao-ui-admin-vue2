<template>
  <el-dialog :visible.sync="dialogVisible" append-to-body title="凭证模板库" width="680px">
    <el-form :inline="true">
      <el-form-item label="模板分类">
        <el-select v-model="categoryId" clearable placeholder="全部分类" style="width: 200px">
          <el-option
            v-for="item in categories"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="filteredList"
      border
      highlight-current-row
      stripe
      @row-dblclick="selectTemplate"
    >
      <el-table-column label="分类" min-width="180" prop="categoryName" show-overflow-tooltip />
      <el-table-column label="模板名称" min-width="260" prop="name" show-overflow-tooltip />
      <el-table-column align="center" label="分录数" width="90">
        <template slot-scope="scope">{{ (scope.row.entries || []).length }}</template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="130">
        <template slot-scope="scope">
          <el-button type="text" @click="selectTemplate(scope.row)">套用</el-button>
          <el-button
            v-if="isWritable"
            v-hasPermi="['fms:config:voucher-template:delete']"
            class="danger-text"
            type="text"
            @click="deleteTemplate(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="template-tip">双击模板可直接套用到当前凭证</div>
  </el-dialog>
</template>

<script>
import { FmsVoucherTemplateApi } from '@/api/fms/config/voucher-template'
import { FmsVoucherTemplateCategoryApi } from '@/api/fms/config/voucher-template-category'
import { FMS_ACCOUNT_SET_CACHE_KEY } from '@/views/fms/utils/context'

export default {
  name: 'FmsVoucherTemplateSelect',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      isWritable: false,
      accountSetId: undefined,
      categoryId: undefined,
      categories: [],
      list: [],
      requestSequence: 0
    }
  },
  computed: {
    filteredList() {
      if (!this.categoryId) return this.list
      return this.list.filter(item => Number(item.categoryId) === Number(this.categoryId))
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    open(id) {
      this.accountSetId = Number(id) || undefined
      this.categoryId = undefined
      this.isWritable = this.readWritableStatus()
      this.dialogVisible = true
      return this.getList()
    },
    readWritableStatus() {
      try {
        const current = JSON.parse(localStorage.getItem(FMS_ACCOUNT_SET_CACHE_KEY) || 'null')
        return Boolean(current && Number(current.id) === Number(this.accountSetId) &&
          [1, 3].includes(Number(current.level)))
      } catch (error) {
        return false
      }
    },
    getList() {
      const accountSetId = Number(this.accountSetId) || 0
      const sequence = ++this.requestSequence
      if (!accountSetId) {
        this.categories = []
        this.list = []
        return Promise.resolve()
      }
      this.loading = true
      return Promise.all([
        FmsVoucherTemplateCategoryApi.getVoucherTemplateCategorySimpleList(accountSetId),
        FmsVoucherTemplateApi.getVoucherTemplateSimpleList(accountSetId)
      ]).then(responses => {
        if (sequence !== this.requestSequence || accountSetId !== Number(this.accountSetId)) return
        const categories = responses[0].data
        const templates = responses[1].data
        this.categories = categories
        this.list = templates
      }).finally(() => {
        if (sequence === this.requestSequence) this.loading = false
      })
    },
    selectTemplate(row) {
      this.$emit('select', row)
      this.dialogVisible = false
    },
    deleteTemplate(row) {
      if (!this.accountSetId || !this.isWritable) return
      this.$modal.confirm('确认删除凭证模板“' + row.name + '”吗？').then(() => {
        return FmsVoucherTemplateApi.deleteVoucherTemplate(Number(this.accountSetId), row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.template-tip { margin-top: 10px; color: #909399; font-size: 12px; }
.danger-text { color: #f56c6c; }
</style>
