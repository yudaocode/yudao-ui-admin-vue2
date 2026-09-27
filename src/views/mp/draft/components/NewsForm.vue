<template>
  <el-container class="news-form">
    <el-aside width="40%">
      <div class="select-item">
        <div
          v-for="(news, index) in newsList"
          :key="index"
        >
          <div
            v-if="index === 0"
            class="news-main father"
            :class="{ activeAddNews: activeNewsIndex === index }"
            @click="activeNewsIndex = index"
          >
            <div class="news-content">
              <img
                v-if="news.thumbUrl"
                class="material-img"
                :src="news.thumbUrl"
                alt=""
              />
              <div class="news-content-title">{{ news.title }}</div>
            </div>
            <div
              v-if="newsList.length > 1"
              class="child"
            >
              <el-button
                type="info"
                circle
                size="small"
                icon="el-icon-bottom"
                title="下移"
                @click.stop="moveDownNews(index)"
              />
              <el-button
                v-if="isCreating"
                type="danger"
                circle
                size="small"
                icon="el-icon-delete"
                title="删除"
                @click.stop="removeNews(index)"
              />
            </div>
          </div>
          <div
            v-else
            class="news-main-item father"
            :class="{ activeAddNews: activeNewsIndex === index }"
            @click="activeNewsIndex = index"
          >
            <div class="news-content-item">
              <div class="news-content-item-title">{{ news.title }}</div>
              <div class="news-content-item-img">
                <img
                  v-if="news.thumbUrl"
                  class="material-img"
                  :src="news.thumbUrl"
                  alt=""
                />
              </div>
            </div>
            <div class="child">
              <el-button
                v-if="newsList.length > index + 1"
                type="info"
                circle
                size="small"
                icon="el-icon-bottom"
                title="下移"
                @click.stop="moveDownNews(index)"
              />
              <el-button
                type="info"
                circle
                size="small"
                icon="el-icon-top"
                title="上移"
                @click.stop="moveUpNews(index)"
              />
              <el-button
                v-if="isCreating"
                type="danger"
                circle
                size="small"
                icon="el-icon-delete"
                title="删除"
                @click.stop="removeNews(index)"
              />
            </div>
          </div>
        </div>
        <el-row class="operation-row">
          <el-button
            v-if="newsList.length < 8 && isCreating"
            type="primary"
            circle
            icon="el-icon-plus"
            title="添加图文"
            @click="plusNews"
          />
        </el-row>
      </div>
    </el-aside>

    <el-main>
      <div v-if="activeNewsItem">
        <el-row :gutter="20">
          <el-input
            :value="activeNewsItem.title"
            placeholder="请输入标题（必填）"
            @input="updateActiveField('title', $event)"
          />
          <el-input
            :value="activeNewsItem.author"
            placeholder="请输入作者"
            class="field-input"
            @input="updateActiveField('author', $event)"
          />
          <el-input
            :value="activeNewsItem.contentSourceUrl"
            placeholder="请输入原文地址"
            class="field-input"
            @input="updateActiveField('contentSourceUrl', $event)"
          />
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <cover-select
              :value="activeNewsItem"
              :is-first="activeNewsIndex === 0"
              @input="updateActiveNewsItem"
            />
          </el-col>
          <el-col :span="12">
            <p>摘要:</p>
            <el-input
              :value="activeNewsItem.digest"
              :rows="8"
              type="textarea"
              placeholder="请输入摘要"
              class="digest"
              maxlength="120"
              @input="updateActiveField('digest', $event)"
            />
          </el-col>
        </el-row>

        <el-row>
          <Editor
            :key="activeNewsIndex"
            :value="activeNewsItem.content || ''"
            :editor-config="editorConfig"
            @input="updateActiveField('content', $event)"
          />
        </el-row>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import Editor from '@/components/Editor'
import { createEditorConfig } from '../editor-config'
import CoverSelect from './CoverSelect.vue'
import { createEmptyNewsItem } from './types'

const UPLOAD_URL = process.env.VUE_APP_BASE_API + '/admin-api/mp/material/upload-permanent'

export default {
  name: 'NewsForm',
  components: {
    CoverSelect,
    Editor
  },
  inject: {
    mpAccountContext: {
      default: () => ({ value: -1 })
    }
  },
  props: {
    isCreating: {
      type: Boolean,
      default: true
    },
    value: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      activeNewsIndex: 0
    }
  },
  computed: {
    newsList() {
      return this.value === null ? [createEmptyNewsItem()] : this.value
    },
    activeNewsItem() {
      return this.newsList[this.activeNewsIndex] || null
    },
    editorConfig() {
      return createEditorConfig(
        UPLOAD_URL,
        Number(this.mpAccountContext.value),
        message => this.$message.error(message)
      )
    }
  },
  watch: {
    newsList: {
      handler(list) {
        if (this.activeNewsIndex >= list.length) {
          this.activeNewsIndex = Math.max(0, list.length - 1)
        }
      },
      immediate: true
    }
  },
  methods: {
    emitList(list) {
      this.$emit('input', list)
    },
    updateActiveNewsItem(item) {
      const list = this.newsList.slice()
      list.splice(this.activeNewsIndex, 1, item)
      this.emitList(list)
    },
    updateActiveField(field, value) {
      this.updateActiveNewsItem({
        ...this.activeNewsItem,
        [field]: value
      })
    },
    moveDownNews(index) {
      if (index >= this.newsList.length - 1) return
      const list = this.newsList.slice()
      const current = list[index]
      list.splice(index, 1, list[index + 1])
      list.splice(index + 1, 1, current)
      this.activeNewsIndex = index + 1
      this.emitList(list)
    },
    moveUpNews(index) {
      if (index <= 0) return
      const list = this.newsList.slice()
      const current = list[index]
      list.splice(index, 1, list[index - 1])
      list.splice(index - 1, 1, current)
      this.activeNewsIndex = index - 1
      this.emitList(list)
    },
    async removeNews(index) {
      try {
        await this.$modal.confirm('确定删除该图文吗?')
        const list = this.newsList.slice()
        list.splice(index, 1)
        if (this.activeNewsIndex >= list.length || this.activeNewsIndex === index) {
          this.activeNewsIndex = Math.max(0, list.length - 1)
        }
        this.emitList(list)
      } catch (error) {
        // 用户取消删除
      }
    },
    plusNews() {
      const list = this.newsList.concat(createEmptyNewsItem())
      this.activeNewsIndex = list.length - 1
      this.emitList(list)
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-row {
  padding-top: 5px;
  margin-top: 5px;
  text-align: center;
  border-top: 1px solid #eaeaea;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.field-input {
  margin-top: 5px;
}

.digest {
  display: inline-block;
  width: 100%;
  vertical-align: top;
}

.news-main {
  width: 100%;
  height: 120px;
  margin: auto;
  background-color: #fff;
}

.news-content {
  position: relative;
  width: 100%;
  height: 120px;
  background-color: #acadae;
}

.news-content-title {
  position: absolute;
  bottom: 0;
  left: 0;
  display: inline-block;
  box-sizing: border-box;
  width: 100%;
  height: 25px;
  padding: 1%;
  overflow: hidden;
  font-size: 15px;
  color: #fff;
  text-overflow: ellipsis;
  white-space: nowrap;
  background-color: #000;
  opacity: 0.65;
}

.news-main-item {
  width: 100%;
  padding: 5px 0;
  margin: auto;
  background-color: #fff;
  border-top: 1px solid #eaeaea;
}

.news-content-item {
  position: relative;
  margin-left: -3px;
}

.news-content-item-title {
  display: inline-block;
  width: 70%;
  font-size: 12px;
}

.news-content-item-img {
  display: inline-block;
  width: 25%;
  background-color: #acadae;
}

.select-item {
  width: 60%;
  padding: 10px;
  margin: 0 auto 10px;
  border: 1px solid #eaeaea;
}

.activeAddNews {
  border: 5px solid #2bb673;
}

.father .child {
  position: relative;
  bottom: 25px;
  display: none;
  text-align: center;
}

.father:hover .child {
  display: block;
}

.material-img {
  width: 100%;
  height: 100%;
}
</style>
