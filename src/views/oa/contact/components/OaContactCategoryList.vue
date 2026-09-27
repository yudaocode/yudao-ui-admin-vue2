<template>
  <div>
    <!-- 联系人分类列表 -->
    <Dialog v-model="dialogVisible" title="管理联系人分类" width="640px">
      <div class="category-toolbar">
        <el-button type="primary" icon="el-icon-plus" size="small" @click="openForm('create')">
          新增分类
        </el-button>
      </div>
      <el-table v-loading="loading" :data="list">
        <el-table-column label="分类名称" prop="name" min-width="180" />
        <el-table-column label="排序" prop="sort" width="100" />
        <el-table-column label="操作" align="center" width="140">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openForm('update', scope.row.id)">
              修改
            </el-button>
            <el-button type="text" size="mini" class="danger-text" @click="handleDelete(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </Dialog>

    <!-- 独立分类表单 -->
    <oa-contact-category-form ref="form" @success="handleSuccess" />
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import * as ContactCategoryApi from '@/api/oa/contact/category'
import OaContactCategoryForm from './OaContactCategoryForm.vue'

export default {
  name: 'OaContactCategoryList',
  components: { Dialog, OaContactCategoryForm },
  data() {
    return {
      dialogVisible: false, // 列表弹窗是否展示
      loading: false, // 列表加载中
      list: [] // 分类列表
    }
  },
  methods: {
    /** 打开分类管理 */
    open() {
      this.dialogVisible = true
      this.getList()
    },
    /** 查询分类列表 */
    getList() {
      this.loading = true
      return ContactCategoryApi.getContactCategoryList().then(response => {
        this.list = response.data
      }).finally(() => {
        this.loading = false
      })
    },
    /** 添加/修改操作 */
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    /** 分类保存成功 */
    handleSuccess() {
      return this.getList().then(() => {
        this.$emit('success')
      })
    },
    /** 删除按钮操作 */
    handleDelete(id) {
      return this.$modal.confirm('删除分类后，原分类下的联系人将变为未分类，是否继续？').then(() => {
        return ContactCategoryApi.deleteContactCategory(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.handleSuccess()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.category-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
.danger-text {
  color: #f56c6c;
}
</style>
