<template>
  <div class="app-container process-create-page">
    <doc-alert title="流程发起、取消、重新发起" url="https://doc.iocoder.cn/bpm/process-instance/" />

    <template v-if="!selectProcessDefinition">
      <el-input
        v-model="searchName"
        placeholder="请输入流程名称"
        clearable
        class="search-input"
        prefix-icon="el-icon-search"
        @input="handleQuery"
        @clear="handleQuery"
      />
      <el-row :gutter="16">
        <el-col :span="5">
          <el-card shadow="never" class="category-card">
            <div
              v-for="category in availableCategories"
              :key="category.code"
              class="category-item"
              :class="{ active: activeCategory && activeCategory.code === category.code }"
              @click="activeCategory = category"
            >
              {{ category.name }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="19">
          <el-card shadow="never" v-loading="loading" class="definition-card">
            <el-empty v-if="filteredDefinitions.length === 0" description="没有找到可发起的流程" />
            <div v-else class="definition-grid">
              <el-card
                v-for="definition in filteredDefinitions"
                :key="definition.id"
                shadow="hover"
                class="definition-item"
                @click.native="handleSelect(definition)"
              >
                <div class="definition-item__icon">
                  <img v-if="definition.icon" :src="definition.icon" alt="" />
                  <span v-else>{{ (definition.name || '').slice(0, 2) }}</span>
                </div>
                <div class="definition-item__main">
                  <div class="definition-item__title">{{ definition.name }}</div>
                  <div class="definition-item__desc">{{ definition.description || '暂无描述' }}</div>
                </div>
              </el-card>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <ProcessDefinitionDetail
      v-else
      ref="processDefinitionDetail"
      :select-process-definition="selectProcessDefinition"
      @cancel="selectProcessDefinition = null"
    />
  </div>
</template>

<script>
import { getCategorySimpleList } from '@/api/bpm/category'
import { getProcessDefinitionList } from '@/api/bpm/definition'
import { getProcessInstance } from '@/api/bpm/processInstance'
import ProcessDefinitionDetail from './ProcessDefinitionDetail.vue'

export default {
  name: 'BpmProcessInstanceCreate',
  components: {
    ProcessDefinitionDetail
  },
  data() {
    return {
      loading: false,
      searchName: '',
      categoryList: [],
      activeCategory: null,
      processDefinitionList: [],
      filteredProcessDefinitionList: [],
      selectProcessDefinition: null
    }
  },
  computed: {
    availableCategories() {
      return this.categoryList.filter((category) => {
        return this.filteredProcessDefinitionList.some((definition) => definition.category === category.code)
      })
    },
    filteredDefinitions() {
      const list = this.filteredProcessDefinitionList
      if (!this.activeCategory) {
        return list
      }
      return list.filter((definition) => definition.category === this.activeCategory.code)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const categoryResp = await getCategorySimpleList()
        this.categoryList = categoryResp.data || []
        const definitionResp = await getProcessDefinitionList({ suspensionState: 1 })
        this.processDefinitionList = definitionResp.data || []
        this.handleQuery()
        if (this.availableCategories.length > 0) {
          this.activeCategory = this.availableCategories[0]
        }
        await this.tryReCreate()
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      const keyword = (this.searchName || '').toLowerCase()
      this.filteredProcessDefinitionList = keyword
        ? this.processDefinitionList.filter((item) => (item.name || '').toLowerCase().includes(keyword))
        : this.processDefinitionList
      if (this.activeCategory && !this.availableCategories.some((item) => item.code === this.activeCategory.code)) {
        this.activeCategory = this.availableCategories[0] || null
      }
    },
    async tryReCreate() {
      const processInstanceId = this.$route.query.processInstanceId
      if (!processInstanceId) {
        return
      }
      const response = await getProcessInstance(processInstanceId)
      const processInstance = response.data
      if (!processInstance || !processInstance.processDefinition) {
        this.$message.error('重新发起流程失败，流程实例不存在')
        return
      }
      const definition = this.processDefinitionList.find((item) => item.key === processInstance.processDefinition.key)
      if (!definition) {
        this.$message.error('重新发起流程失败，流程定义不存在')
        return
      }
      this.handleSelect(definition, processInstance.formVariables)
    },
    async handleSelect(definition, formVariables) {
      this.selectProcessDefinition = definition
      await this.$nextTick()
      this.$refs.processDefinitionDetail.initProcessInfo(definition, formVariables)
    }
  }
}
</script>

<style scoped>
.search-input {
  width: 420px;
  margin-bottom: 16px;
}

.category-card,
.definition-card {
  min-height: 680px;
}

.category-item {
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
}

.category-item.active {
  color: #3473ff;
  background: #e8eeff;
}

.definition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.definition-item {
  cursor: pointer;
}

.definition-item /deep/ .el-card__body {
  display: flex;
  gap: 12px;
  align-items: center;
}

.definition-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #fff;
  background: #3473ff;
  border-radius: 4px;
  flex-shrink: 0;
}

.definition-item__icon img {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 4px;
}

.definition-item__title {
  font-weight: 600;
  color: #303133;
}

.definition-item__desc {
  margin-top: 4px;
  overflow: hidden;
  color: #909399;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
