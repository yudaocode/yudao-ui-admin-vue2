<template>
  <ComponentContainerProperty v-model="formData.style">
    <el-form label-width="40px" :model="formData">
      <el-form-item label="文章" prop="id">
        <el-select
          v-model="articleId"
          placeholder="请选择文章"
          class="article-select"
          filterable
          remote
          :remote-method="queryArticleList"
          :loading="loading"
        >
          <el-option
            v-for="article in articles"
            :key="article.id"
            :label="article.title"
            :value="article.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
  </ComponentContainerProperty>
</template>

<script>
import * as ArticleApi from '@/api/mall/promotion/article/index'
import ComponentContainerProperty from '@/components/DiyEditor/components/ComponentContainerProperty.vue'

export default {
  name: 'PromotionArticleProperty',
  components: { ComponentContainerProperty },
  props: {
    value: { type: Object, required: true }
  },
  data() {
    return {
      articles: [],
      loading: false
    }
  },
  computed: {
    formData() {
      return this.value
    },
    articleId: {
      get() {
        return this.formData.id
      },
      set(value) {
        this.$set(this.formData, 'id', value)
      }
    }
  },
  mounted() {
    this.queryArticleList()
  },
  methods: {
    queryArticleList(title) {
      this.loading = true
      return ArticleApi.getArticlePage({ title, pageSize: 10 })
        .then(response => {
          this.articles = response.data.list
          this.loading = false
          return this.articles
        })
    }
  }
}
</script>

<style scoped lang="scss">
.article-select {
  width: 100%;
}
</style>
