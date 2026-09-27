<template>
  <div v-if="webSearchPages && webSearchPages.length" class="message-web-search">
    <button type="button" class="message-web-search__header" @click="isExpanded = !isExpanded">
      <span><i class="el-icon-search" /> 联网搜索结果（{{ webSearchPages.length }} 条）</span>
      <i :class="isExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
    </button>
    <div v-show="isExpanded" class="message-web-search__list">
      <button
        v-for="(result, index) in webSearchPages"
        :key="result.url || index"
        type="button"
        class="web-search-result"
        @click="openDetail(result)"
      >
        <img v-if="result.icon" :src="result.icon" :alt="result.name" @error="hideImage">
        <i v-else class="el-icon-link" />
        <span class="web-search-result__body">
          <small>{{ result.name }}</small>
          <strong>{{ result.title }}</strong>
          <span>{{ result.snippet }}</span>
          <em>{{ result.url }}</em>
        </span>
      </button>
    </div>

    <el-dialog
      title="联网搜索详情"
      :visible.sync="dialogVisible"
      width="600px"
      append-to-body
    >
      <div v-if="selectedResult" class="web-search-detail">
        <h3>{{ selectedResult.title }}</h3>
        <div class="web-search-detail__source">{{ selectedResult.name }}</div>
        <div class="web-search-detail__url">{{ selectedResult.url }}</div>
        <h4>简短描述</h4>
        <p>{{ selectedResult.snippet }}</p>
        <template v-if="selectedResult.summary">
          <h4>内容摘要</h4>
          <p>{{ selectedResult.summary }}</p>
        </template>
      </div>
      <span slot="footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="openUrl(selectedResult && selectedResult.url)">访问原文</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MessageWebSearch',
  props: {
    webSearchPages: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return { isExpanded: false, selectedResult: null, dialogVisible: false }
  },
  methods: {
    openDetail(result) {
      this.selectedResult = result
      this.dialogVisible = true
    },
    hideImage(event) {
      event.target.style.display = 'none'
    },
    openUrl(url) {
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
    }
  }
}
</script>

<style lang="scss" scoped>
.message-web-search {
  margin-top: 10px;
  padding: 10px;
  border-radius: 8px;
  background: #f5f7fa;
}

.message-web-search__header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  border: 0;
  color: #606266;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
}

.message-web-search__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 9px;
}

.web-search-result {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  padding: 10px;
  border: 0;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  text-align: left;

  &:hover { background: #e6f4ff; }

  > img {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }
}

.web-search-result__body {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;

  small { color: #909399; }
  strong { color: #1a73e8; font-size: 14px; }
  span { color: #606266; font-size: 13px; line-height: 1.4; }
  em { overflow: hidden; color: #28812b; font-size: 12px; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
}

.web-search-detail {
  max-height: 60vh;
  overflow-y: auto;

  h3 { margin: 0 0 6px; }
  h4 { margin: 16px 0 6px; }
  p { margin: 0; padding: 10px; border-radius: 6px; background: #f8f9fa; line-height: 1.6; white-space: pre-wrap; }
}

.web-search-detail__source { color: #909399; font-size: 12px; }
.web-search-detail__url { margin-top: 4px; color: #28812b; font-size: 12px; word-break: break-all; }
</style>
