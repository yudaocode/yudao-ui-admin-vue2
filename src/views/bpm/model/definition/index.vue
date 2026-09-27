<template>
  <div class="app-container">
    <doc-alert title="工作流手册" url="https://doc.iocoder.cn/bpm/" />

    <el-table v-loading="loading" :data="list">
      <el-table-column label="定义编号" align="center" prop="id" min-width="250" show-overflow-tooltip />
      <el-table-column label="流程名称" align="center" prop="name" min-width="150" />
      <el-table-column label="流程图标" align="center" min-width="50">
        <template v-slot="scope">
          <el-image v-if="scope.row.icon" :src="scope.row.icon" class="definition-icon" />
        </template>
      </el-table-column>
      <el-table-column label="可见范围" prop="startUserIds" min-width="100">
        <template v-slot="scope">
          {{ visibleScopeText(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column label="流程类型" prop="modelType" min-width="120">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.BPM_MODEL_TYPE" :value="scope.row.modelType" />
        </template>
      </el-table-column>
      <el-table-column label="表单信息" prop="formType" min-width="150">
        <template v-slot="scope">
          <el-button v-if="Number(scope.row.formType) === Number(BpmModelFormType.NORMAL)" type="text" @click="handleFormDetail(scope.row)">
            {{ scope.row.formName }}
          </el-button>
          <el-button v-else-if="Number(scope.row.formType) === Number(BpmModelFormType.CUSTOM)" type="text" @click="handleFormDetail(scope.row)">
            {{ scope.row.formCustomCreatePath }}
          </el-button>
          <span v-else>暂无表单</span>
        </template>
      </el-table-column>
      <el-table-column label="流程版本" align="center" prop="version" min-width="80">
        <template v-slot="scope">
          <el-tag>v{{ scope.row.version }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="部署时间" align="center" prop="deploymentTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.deploymentTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template v-slot="scope">
          <el-button type="text" @click="handleRestore(scope.row)"
                     v-hasPermi="['bpm:model:update']">恢复</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <Dialog title="表单详情" v-model="formDetailVisible" width="800px">
      <form-create :rule="formDetail.rule" :option="formDetail.option" />
    </Dialog>

    <el-dialog title="流程图" :visible.sync="bpmnVisible" width="80%" append-to-body>
      <my-process-viewer v-if="bpmnXML" key="definition-viewer" v-model="bpmnXML" :prefix="'flowable'" />
    </el-dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import { getProcessDefinition, getProcessDefinitionPage } from '@/api/bpm/definition'
import { setConfAndFields2 } from '@/utils/formCreate'
import { BpmModelFormType } from '@/utils/constants'

export default {
  name: 'BpmProcessDefinition',
  components: { Dialog },
  data() {
    return {
      loading: false,
      BpmModelFormType,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        key: this.$route.query.key
      },
      formDetailVisible: false,
      formDetail: {
        rule: [],
        option: {}
      },
      bpmnVisible: false,
      bpmnXML: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const response = await getProcessDefinitionPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleFormDetail(row) {
      if (row.formType === BpmModelFormType.NORMAL) {
        setConfAndFields2(this.formDetail, row.formConf, row.formFields)
        this.formDetailVisible = true
      } else {
        this.$router.push({ path: row.formCustomCreatePath })
      }
    },
    visibleScopeText(row) {
      const users = Array.isArray(row.startUsers) ? row.startUsers : []
      if (users.length === 0) return '全部可见'
      if (users.length === 1) {
        return users[0].nickname || users[0].name
      }
      return `${users[0].nickname || users[0].name}等 ${users.length} 人可见`
    },
    async handleBpmnDetail(row) {
      try {
        const response = await getProcessDefinition(row.id)
        this.bpmnXML = response.data.bpmnXml
        this.bpmnVisible = true
      } catch (e) {
        this.bpmnXML = ''
        this.$message.error('流程图加载失败')
      }
    },
    handleRestore(row) {
      this.$router.push({
        name: 'BpmModelUpdate',
        params: {
          type: 'definition',
          id: row.id
        }
      })
    },
    handleReport(row) {
      this.$router.push({
        name: 'BpmProcessInstanceReport',
        query: {
          processDefinitionId: row.id,
          processDefinitionKey: row.key
        }
      })
    }
  }
}
</script>

<style scoped>
.definition-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}
</style>
