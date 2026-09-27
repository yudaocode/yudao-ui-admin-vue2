<template>
  <div class="app-container">
    <doc-alert
      title="AI 对话聊天"
      url="https://doc.iocoder.cn/ai/chat/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      @submit.native.prevent
    >
      <el-form-item
        label="角色名称"
        prop="name"
      ><el-input
        v-model="queryParams.name"
        clearable
        placeholder="请输入角色名称"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="角色类别"
        prop="category"
      ><el-input
        v-model="queryParams.category"
        clearable
        placeholder="请输入角色类别"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="是否公开"
        prop="publicStatus"
      ><el-select
        v-model="queryParams.publicStatus"
        clearable
        placeholder="请选择是否公开"
      ><el-option
        v-for="item in boolDictDatas"
        :key="item.value"
        :label="item.label"
        :value="item.value === true || item.value === 'true'"
      /></el-select></el-form-item>
      <el-form-item><el-button
        type="primary"
        icon="el-icon-search"
        @click="handleQuery"
      >搜索</el-button><el-button
        icon="el-icon-refresh"
        @click="resetQuery"
      >重置</el-button><el-button
        v-hasPermi="['ai:chat-role:create']"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="openForm('create')"
      >新增</el-button></el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="角色名称"
        prop="name"
        align="center"
        min-width="130"
      /><el-table-column
        label="绑定模型"
        prop="modelName"
        align="center"
      />
      <el-table-column
        label="角色头像"
        prop="avatar"
        align="center"
      ><template #default="scope"><el-image
        v-if="scope.row.avatar"
        :src="scope.row.avatar"
        style="width:32px;height:32px"
        fit="cover"
      /></template></el-table-column>
      <el-table-column
        label="角色类别"
        prop="category"
        align="center"
      /><el-table-column
        label="角色描述"
        prop="description"
        align="center"
        min-width="180"
      /><el-table-column
        label="角色设定"
        prop="systemMessage"
        align="center"
        min-width="180"
      />
      <el-table-column
        label="知识库"
        prop="knowledgeIds"
        align="center"
      ><template #default="scope">{{ scope.row.knowledgeIds && scope.row.knowledgeIds.length ? '引用 ' + scope.row.knowledgeIds.length + ' 个' : '-' }}</template></el-table-column>
      <el-table-column
        label="工具"
        prop="toolIds"
        align="center"
      ><template #default="scope">{{ scope.row.toolIds && scope.row.toolIds.length ? '引用 ' + scope.row.toolIds.length + ' 个' : '-' }}</template></el-table-column>
      <el-table-column
        label="是否公开"
        prop="publicStatus"
        align="center"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
        :value="scope.row.publicStatus"
      /></template></el-table-column><el-table-column
        label="状态"
        prop="status"
        align="center"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.COMMON_STATUS"
        :value="scope.row.status"
      /></template></el-table-column><el-table-column
        label="角色排序"
        prop="sort"
        align="center"
        width="70"
      />
      <el-table-column
        label="操作"
        align="center"
        width="150"
      ><template #default="scope"><el-button
        v-hasPermi="['ai:chat-role:update']"
        type="text"
        size="mini"
        @click="openForm('update', scope.row.id)"
      >编辑</el-button><el-button
        v-hasPermi="['ai:chat-role:delete']"
        type="text"
        size="mini"
        @click="handleDelete(scope.row.id)"
      >删除</el-button></template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <chat-role-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { ChatRoleApi } from '@/api/ai/model/chatRole'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import ChatRoleForm from './ChatRoleForm.vue'

export default {
  name: 'AiChatRole',
  components: { ChatRoleForm },
  data() { return { DICT_TYPE, loading: true, list: [], total: 0, boolDictDatas: getDictDatas(DICT_TYPE.INFRA_BOOLEAN_STRING), queryParams: { pageNo: 1, pageSize: 10, name: undefined, category: undefined, publicStatus: true }} },
  created() { this.getList() },
  methods: {
    getList() { this.loading = true; return ChatRoleApi.getChatRolePage(this.queryParams).then(response => { this.list = response.data.list; this.total = response.data.total }).finally(() => { this.loading = false }) },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() },
    openForm(type, id) { this.$refs.form.open(type, id) },
    handleDelete(id) { this.$modal.confirm('是否删除所选中数据？').then(() => ChatRoleApi.deleteChatRole(id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {}) }
  }
}
</script>
