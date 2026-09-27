<template>
  <div
    v-loading="loading"
    class="waterfall"
  >
    <template v-for="(item, index) in list">
      <div
        v-if="item.content && item.content.newsItem"
        :key="item.mediaId || index"
        class="waterfall-item"
      >
        <wx-news :articles="item.content.newsItem" />
        <el-row class="operation-row">
          <el-button
            v-hasPermi="['mp:free-publish:submit']"
            type="success"
            icon="el-icon-upload2"
            circle
            title="发布"
            @click="$emit('publish', item)"
          />
          <el-button
            v-hasPermi="['mp:draft:update']"
            type="primary"
            icon="el-icon-edit"
            circle
            title="修改"
            @click="$emit('update', item)"
          />
          <el-button
            v-hasPermi="['mp:draft:delete']"
            type="danger"
            icon="el-icon-delete"
            circle
            title="删除"
            @click="$emit('delete', item)"
          />
        </el-row>
      </div>
    </template>
  </div>
</template>

<script>
import WxNews from '@/views/mp/components/wx-news'

export default {
  name: 'DraftTable',
  components: { WxNews },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.waterfall {
  width: 100%;
  margin: 0 auto;
  column-gap: 10px;
  column-count: 5;
}

.waterfall-item {
  padding: 10px;
  margin-bottom: 10px;
  break-inside: avoid;
  border: 1px solid #eaeaea;
}

.operation-row {
  padding-top: 5px;
  margin-top: 5px;
  text-align: center;
  border-top: 1px solid #eaeaea;
}

@media (min-width: 992px) and (max-width: 1300px) {
  .waterfall {
    column-count: 3;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .waterfall {
    column-count: 2;
  }
}

@media (max-width: 767px) {
  .waterfall {
    column-count: 1;
  }
}
</style>
