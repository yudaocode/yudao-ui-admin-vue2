<template>
  <div>
    <!-- 笔记目录列表 -->
    <Dialog title="管理笔记目录" v-model="dialogVisible" width="640px">
      <div class="toolbar">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="openForm('create')">新增目录</el-button>
      </div>
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column label="目录名称" prop="name" min-width="180" />
        <el-table-column label="排序" prop="sort" align="center" width="100" />
        <el-table-column label="操作" align="center" width="140">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openForm('update', scope.row.id)">修改</el-button>
            <el-button type="text" size="mini" class="danger-text" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </Dialog>

    <!-- 独立目录表单 -->
    <oa-note-category-form ref="formRef" @success="handleSuccess" />
  </div>
</template>

<script>
import * as NoteCategoryApi from '@/api/oa/note/category'
import Dialog from '@/components/Dialog'
import OaNoteCategoryForm from './OaNoteCategoryForm.vue'

export default {
  name: 'OaNoteCategoryList',
  components: { Dialog, OaNoteCategoryForm },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      list: []
    }
  },
  methods: {
    /** 打开目录管理 */
    open() {
      this.dialogVisible = true
      this.getList()
    },
    getList() {
      this.loading = true
      return NoteCategoryApi.getNoteCategoryList().then(response => {
        this.list = response.data
      }).finally(() => {
        this.loading = false
      })
    },
    openForm(type, id) {
      this.$refs.formRef.open(type, id)
    },
    /** 目录保存成功 */
    handleSuccess() {
      return this.getList().then(() => {
        this.$emit('success')
      })
    },
    handleDelete(id) {
      return this.$modal.confirm(
        '删除目录会同时删除目录内的笔记，所有共享接收人也将无法查看，是否继续？'
      ).then(() => {
        return NoteCategoryApi.deleteNoteCategory(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        // 刷新目录列表并通知父组件
        return this.getList()
      }).then(() => {
        this.$emit('success')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.danger-text {
  color: #f56c6c;
}
</style>
