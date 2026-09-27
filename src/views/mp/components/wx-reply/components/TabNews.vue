<template>
  <div>
    <el-row>
      <div
        v-if="hasArticles"
        class="select-item"
      >
        <wx-news :articles="reply.articles" />
        <el-row class="ope-row">
          <el-button
            type="danger"
            icon="el-icon-delete"
            circle
            @click="onDelete"
          />
        </el-row>
      </div>

      <el-col
        v-else
        :span="24"
      >
        <el-row
          type="flex"
          justify="center"
          align="middle"
        >
          <el-button
            type="success"
            @click="showDialog = true"
          >
            {{ newsType === NewsType.Published ? '选择已发布图文' : '选择草稿箱图文' }}
            <i class="el-icon-circle-check el-icon--right" />
          </el-button>
        </el-row>
      </el-col>

      <el-dialog
        title="选择图文"
        :visible.sync="showDialog"
        width="90%"
        append-to-body
        destroy-on-close
      >
        <wx-material-select
          type="news"
          :account-id="reply.accountId"
          :news-type="newsType"
          @select-material="selectMaterial"
        />
      </el-dialog>
    </el-row>
  </div>
</template>

<script>
import WxNews from '@/views/mp/components/wx-news'
import WxMaterialSelect from '@/views/mp/components/wx-material-select'
import { NewsType, ReplyType, createEmptyReply } from './types'

export default {
  name: 'WxReplyTabNews',
  components: {
    WxNews,
    WxMaterialSelect
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: Object,
      default: null
    },
    newsType: {
      type: String,
      default: NewsType.Published
    }
  },
  data() {
    return {
      NewsType,
      showDialog: false,
      emptyReply: createEmptyReply({ accountId: undefined, type: ReplyType.News })
    }
  },
  computed: {
    reply() {
      return this.value || this.emptyReply
    },
    hasArticles() {
      return Array.isArray(this.reply.articles) && this.reply.articles.length > 0
    }
  },
  methods: {
    emitReply(nextReply) {
      this.$emit('input', nextReply)
    },
    updateReply(patch) {
      this.emitReply({ ...this.reply, ...patch })
    },
    selectMaterial(item) {
      this.showDialog = false
      const articles = item && item.content && item.content.newsItem
      this.updateReply({ articles: Array.isArray(articles) ? articles.slice() : [] })
    },
    onDelete() {
      this.updateReply({ articles: [] })
    }
  }
}
</script>

<style lang="scss" scoped>
.select-item {
  width: 280px;
  padding: 10px;
  margin: 0 auto 10px;
  border: 1px solid #eaeaea;
}

.ope-row {
  padding-top: 10px;
  text-align: center;
}
</style>
