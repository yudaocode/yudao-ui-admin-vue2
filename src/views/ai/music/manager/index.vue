<template>
  <div class="app-container ai-music-manager">
    <doc-alert title="AI 音乐创作" url="https://doc.iocoder.cn/ai/music/" />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="用户编号" prop="userId">
        <el-select v-model="queryParams.userId" clearable placeholder="请输入用户编号">
          <el-option
            v-for="item in userList"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="音乐名称" prop="title">
        <el-input
          v-model="queryParams.title"
          clearable
          placeholder="请输入音乐名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="音乐状态" prop="status">
        <el-select v-model="queryParams.status" clearable placeholder="请选择音乐状态">
          <el-option
            v-for="item in statusDictDatas"
            :key="item.value"
            :label="item.label"
            :value="Number(item.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="生成模式" prop="generateMode">
        <el-select v-model="queryParams.generateMode" clearable placeholder="请选择生成模式">
          <el-option
            v-for="item in generateModeDictDatas"
            :key="item.value"
            :label="item.label"
            :value="Number(item.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          clearable
        />
      </el-form-item>
      <el-form-item label="是否发布" prop="publicStatus">
        <el-select v-model="queryParams.publicStatus" clearable placeholder="请选择是否发布">
          <el-option
            v-for="item in boolDictDatas"
            :key="item.value"
            :label="item.label"
            :value="item.value === true || item.value === 'true'"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="编号" prop="id" align="center" width="180" fixed="left" show-overflow-tooltip />
      <el-table-column label="音乐名称" prop="title" align="center" width="180" fixed="left" show-overflow-tooltip />
      <el-table-column label="用户" prop="userId" align="center" width="180" show-overflow-tooltip>
        <template v-slot="scope">{{ userNames[scope.row.userId] }}</template>
      </el-table-column>
      <el-table-column label="音乐状态" prop="status" align="center" width="100" show-overflow-tooltip>
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.AI_MUSIC_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="模型" prop="model" align="center" width="180" show-overflow-tooltip />
      <el-table-column label="内容" align="center" width="180" show-overflow-tooltip>
        <template v-slot="scope">
          <el-link
            v-if="scope.row.audioUrl && scope.row.audioUrl.length > 0"
            type="primary"
            :href="scope.row.audioUrl"
            target="_blank"
          >音乐</el-link>
          <el-link
            v-if="scope.row.videoUrl && scope.row.videoUrl.length > 0"
            type="primary"
            :href="scope.row.videoUrl"
            target="_blank"
            class="ai-music-manager__content-link"
          >视频</el-link>
          <el-link
            v-if="scope.row.imageUrl && scope.row.imageUrl.length > 0"
            type="primary"
            :href="scope.row.imageUrl"
            target="_blank"
            class="ai-music-manager__content-link"
          >封面</el-link>
        </template>
      </el-table-column>
      <el-table-column label="时长（秒）" prop="duration" align="center" width="100" show-overflow-tooltip />
      <el-table-column label="提示词" prop="prompt" align="center" width="180" show-overflow-tooltip />
      <el-table-column label="歌词" prop="lyric" align="center" width="180" show-overflow-tooltip />
      <el-table-column label="描述" prop="gptDescriptionPrompt" align="center" width="180" show-overflow-tooltip />
      <el-table-column label="生成模式" prop="generateMode" align="center" width="100" show-overflow-tooltip>
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.AI_GENERATE_MODE" :value="scope.row.generateMode" />
        </template>
      </el-table-column>
      <el-table-column label="风格标签" prop="tags" align="center" width="180" show-overflow-tooltip>
        <template v-slot="scope">
          <el-tag
            v-for="tag in scope.row.tags"
            :key="tag"
            round
            class="ai-music-manager__tag"
          >{{ tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否发布" prop="publicStatus" align="center" show-overflow-tooltip>
        <template v-slot="scope">
          <el-switch
            v-model="scope.row.publicStatus"
            :active-value="true"
            :inactive-value="false"
            :disabled="scope.row.status !== AiMusicStatusEnum.SUCCESS"
            @change="handleUpdatePublicStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="任务编号" prop="taskId" align="center" width="180" show-overflow-tooltip />
      <el-table-column label="错误信息" prop="errorMessage" align="center" show-overflow-tooltip />
      <el-table-column label="创建时间" prop="createTime" align="center" width="180" show-overflow-tooltip>
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="100" fixed="right">
        <template v-slot="scope">
          <el-button
            type="text"
            size="mini"
            v-hasPermi="['ai:music:delete']"
            class="ai-music-manager__delete"
            @click="handleDelete(scope.row.id)"
          >删除</el-button>
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
  </div>
</template>

<script>
import { MusicApi } from '@/api/ai/music/index'
import { getSimpleUserList } from '@/api/system/user'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { AiMusicStatusEnum } from '@/views/ai/utils/constants'

export default {
  name: 'AiMusicManager',
  data() {
    return {
      DICT_TYPE,
      AiMusicStatusEnum,
      loading: true,
      list: [],
      total: 0,
      userList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: undefined,
        title: undefined,
        status: undefined,
        generateMode: undefined,
        createTime: [],
        publicStatus: undefined
      }
    }
  },
  computed: {
    statusDictDatas() {
      return getDictDatas(DICT_TYPE.AI_MUSIC_STATUS)
    },
    generateModeDictDatas() {
      return getDictDatas(DICT_TYPE.AI_GENERATE_MODE)
    },
    boolDictDatas() {
      return getDictDatas(DICT_TYPE.INFRA_BOOLEAN_STRING)
    },
    userNames() {
      return this.userList.reduce((result, user) => {
        result[user.id] = user.nickname
        return result
      }, {})
    }
  },
  created() {
    this.getList()
    this.loadUsers()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const response = await MusicApi.getMusicPage(this.queryParams)
        const data = response.data
        this.list = data.list
        this.total = data.total
      } finally {
        this.loading = false
      }
    },
    async loadUsers() {
      const response = await getSimpleUserList()
      this.userList = response.data
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否删除所选中数据？')
        await MusicApi.deleteMusic(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消删除时不提示错误
      }
    },
    async handleUpdatePublicStatusChange(row) {
      try {
        const text = row.publicStatus ? '公开' : '私有'
        await this.$modal.confirm('确认要"' + text + '"该音乐吗?')
        await MusicApi.updateMusic({ id: row.id, publicStatus: row.publicStatus })
        await this.getList()
      } catch (error) {
        row.publicStatus = !row.publicStatus
      }
    }
  }
}
</script>

<style scoped>
.ai-music-manager .el-input,
.ai-music-manager .el-select {
  width: 240px;
}

.ai-music-manager__content-link {
  padding-left: 5px;
}

.ai-music-manager__tag + .ai-music-manager__tag {
  margin-left: 2px;
}

.ai-music-manager__tag {
  border-radius: 999px;
}

.ai-music-manager__delete {
  color: #f56c6c;
}

.ai-music-manager__delete:hover,
.ai-music-manager__delete:focus {
  color: #f78989;
}
</style>
