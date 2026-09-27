<!--
  - Copyright (C) 2018-2019
  - All rights reserved, Designed By www.joolun.com
  芋道源码：使用 Element UI 展示微信素材选择器。
-->
<template>
  <div class="wx-material-select">
    <!-- 类型：image -->
    <div v-if="resolvedType === MaterialType.Image">
      <div
        v-loading="loading"
        class="waterfall"
      >
        <div
          v-for="item in list"
          :key="item.mediaId"
          class="waterfall-item"
        >
          <img
            class="material-img"
            :src="item.url"
            alt=""
          />
          <p class="item-name">{{ item.name }}</p>
          <el-row class="ope-row">
            <el-button
              size="mini"
              type="success"
              @click="selectMaterialFun(item)"
            >
              选择<i class="el-icon-circle-check el-icon--right" />
            </el-button>
          </el-row>
        </div>
      </div>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getPage"
      />
    </div>

    <!-- 类型：voice -->
    <div v-else-if="resolvedType === MaterialType.Voice">
      <el-table
        v-loading="loading"
        :data="list"
      >
        <el-table-column
          label="编号"
          align="center"
          prop="mediaId"
        />
        <el-table-column
          label="文件名"
          align="center"
          prop="name"
        />
        <el-table-column
          label="语音"
          align="center"
        >
          <template #default="scope">
            <wx-voice-player :url="scope.row.url" />
          </template>
        </el-table-column>
        <el-table-column
          label="上传时间"
          align="center"
          prop="createTime"
          width="180"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          fixed="right"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-circle-plus"
              @click="selectMaterialFun(scope.row)"
            >选择</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getPage"
      />
    </div>

    <!-- 类型：video -->
    <div v-else-if="resolvedType === MaterialType.Video">
      <el-table
        v-loading="loading"
        :data="list"
      >
        <el-table-column
          label="编号"
          align="center"
          prop="mediaId"
        />
        <el-table-column
          label="文件名"
          align="center"
          prop="name"
        />
        <el-table-column
          label="标题"
          align="center"
          prop="title"
        />
        <el-table-column
          label="介绍"
          align="center"
          prop="introduction"
        />
        <el-table-column
          label="视频"
          align="center"
        >
          <template #default="scope">
            <wx-video-player :url="scope.row.url" />
          </template>
        </el-table-column>
        <el-table-column
          label="上传时间"
          align="center"
          prop="createTime"
          width="180"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          fixed="right"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-circle-plus"
              @click="selectMaterialFun(scope.row)"
            >选择</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getPage"
      />
    </div>

    <!-- 类型：news -->
    <div v-else-if="resolvedType === MaterialType.News">
      <div
        v-loading="loading"
        class="waterfall"
      >
        <div
          v-for="item in list"
          :key="item.mediaId"
          class="waterfall-item"
        >
          <template v-if="item.content && item.content.newsItem">
            <wx-news :articles="item.content.newsItem" />
            <el-row class="ope-row">
              <el-button
                size="mini"
                type="success"
                @click="selectMaterialFun(item)"
              >
                选择<i class="el-icon-circle-check el-icon--right" />
              </el-button>
            </el-row>
          </template>
        </div>
      </div>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getPage"
      />
    </div>
  </div>
</template>

<script>
import WxNews from '@/views/mp/components/wx-news'
import WxVoicePlayer from '@/views/mp/components/wx-voice-play'
import WxVideoPlayer from '@/views/mp/components/wx-video-play'
import * as MpMaterialApi from '@/api/mp/material'
import * as MpFreePublishApi from '@/api/mp/freePublish'
import * as MpDraftApi from '@/api/mp/draft'
import { MaterialType, NewsType } from './types'

export default {
  name: 'WxMaterialSelect',
  components: {
    WxNews,
    WxVoicePlayer,
    WxVideoPlayer
  },
  props: {
    type: {
      type: String,
      default: ''
    },
    accountId: {
      type: Number,
      default: undefined
    },
    newsType: {
      type: String,
      default: NewsType.Published
    }
  },
  data() {
    return {
      MaterialType,
      loading: false,
      reloadScheduled: false,
      requestSequence: 0,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        accountId: undefined
      }
    }
  },
  computed: {
    resolvedType() {
      return this.type
    },
    resolvedAccountId() {
      return this.accountId
    }
  },
  watch: {
    resolvedType(value, oldValue) {
      if (value !== oldValue) {
        this.queryParams.pageNo = 1
        this.scheduleReload()
      }
    },
    resolvedAccountId(value, oldValue) {
      this.queryParams.accountId = value
      if (value !== oldValue) {
        this.queryParams.pageNo = 1
        this.scheduleReload()
      }
    },
    newsType(value, oldValue) {
      if (value !== oldValue && this.resolvedType === MaterialType.News) {
        this.queryParams.pageNo = 1
        this.scheduleReload()
      }
    }
  },
  created() {
    this.queryParams.accountId = this.resolvedAccountId
    this.getPage()
  },
  methods: {
    scheduleReload() {
      if (this.reloadScheduled) return
      this.reloadScheduled = true
      this.$nextTick(() => {
        this.reloadScheduled = false
        this.getPage()
      })
    },
    selectMaterialFun(item) {
      this.$emit('select-material', item)
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getPage()
    },
    async getPage() {
      const requestId = ++this.requestSequence
      if (!this.resolvedType) {
        this.list = []
        this.total = 0
        this.loading = false
        return
      }
      this.loading = true
      try {
        let page
        if (this.resolvedType === MaterialType.News && this.newsType === NewsType.Published) {
          page = await this.getFreePublishPageFun()
        } else if (this.resolvedType === MaterialType.News && this.newsType === NewsType.Draft) {
          page = await this.getDraftPageFun()
        } else {
          page = await this.getMaterialPageFun()
        }
        if (requestId === this.requestSequence) {
          this.list = page.list
          this.total = page.total
        }
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    async getMaterialPageFun() {
      const response = await MpMaterialApi.getMaterialPage({
        ...this.queryParams,
        type: this.resolvedType
      })
      const data = response.data
      return { list: data.list, total: data.total }
    },
    getMaterialPage() {
      return this.getPage()
    },
    normalizeNews(list) {
      list.forEach(item => {
        const articles = item.content.newsItem
        articles.forEach(article => {
          article.picUrl = article.thumbUrl
        })
      })
      return list
    },
    async getFreePublishPageFun() {
      const response = await MpFreePublishApi.getFreePublishPage(this.queryParams)
      const data = response.data
      return { list: this.normalizeNews(data.list), total: data.total }
    },
    getFreePublishPage() {
      return this.getFreePublishPageFun()
    },
    async getDraftPageFun() {
      const response = await MpDraftApi.getDraftPage(this.queryParams)
      const data = response.data
      return { list: this.normalizeNews(data.list), total: data.total }
    },
    getDraftPage() {
      return this.getDraftPageFun()
    }
  }
}
</script>

<style lang="scss" scoped>
.waterfall {
  width: 100%;
  column-gap: 10px;
  column-count: 5;
  margin: 0 auto;
}

.waterfall-item {
  padding: 10px;
  margin-bottom: 10px;
  break-inside: avoid;
  border: 1px solid #eaeaea;
}

.material-img {
  width: 100%;
}

p {
  line-height: 30px;
}

@media (min-width: 992px) and (max-width: 1300px) {
  .waterfall {
    column-count: 3;
  }

  p {
    color: red;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .waterfall {
    column-count: 2;
  }

  p {
    color: orange;
  }
}

@media (max-width: 767px) {
  .waterfall {
    column-count: 1;
  }
}
</style>
