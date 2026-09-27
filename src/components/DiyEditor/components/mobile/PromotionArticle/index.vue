<template>
  <div class="article-content" v-html="article && article.content"></div>
</template>

<script>
import * as ArticleApi from '@/api/mall/promotion/article/index'

export default {
  name: 'PromotionArticle',
  props: {
    property: { type: Object, required: true }
  },
  data() {
    return {
      article: undefined
    }
  },
  watch: {
    'property.id': {
      immediate: true,
      handler(id) {
        if (id) {
          return ArticleApi.getArticle(id).then(response => {
            this.article = response.data
            return this.article
          })
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.article-content {
  min-height: 30px;
}
</style>

