<template>
  <section class="mail-message-list">
    <div class="mail-message-list__search">
      <el-input
        :value="keyword"
        placeholder="搜索主题/发件人"
        clearable
        @input="value => $emit('update:keyword', value)"
        @keyup.enter.native="$emit('query')"
        @clear="$emit('query')"
      >
        <el-button slot="append" icon="el-icon-search" @click="$emit('query')" />
      </el-input>
      <el-radio-group
        :value="filter"
        class="mail-message-list__filter"
        size="small"
        @input="value => { $emit('update:filter', value); $emit('query') }"
      >
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="unread">未读</el-radio-button>
        <el-radio-button label="attach">有附件</el-radio-button>
      </el-radio-group>
    </div>
    <div v-loading="loading" class="mail-message-list__body">
      <el-alert v-if="listError" :title="listError" type="error" :closable="false" />
      <el-empty v-if="!list.length && !loading" :description="emptyText" />
      <button
        v-for="mail in list"
        :key="mail.id"
        type="button"
        class="mail-message-list__item"
        :class="{ 'is-active': selectedId === mail.id, 'is-unread': !mail.readStatus }"
        :disabled="disabled"
        @click="$emit('select', mail)"
      >
        <div class="mail-message-list__row">
          <span v-if="!mail.readStatus" class="mail-message-list__dot" title="未读" />
          <span class="mail-message-list__subject">
            {{ mail.subject || '（无主题）' }}
          </span>
          <span class="mail-message-list__time">
            {{ formatDate(mail.receiveTime, 'MM-DD HH:mm') }}
          </span>
        </div>
        <div class="mail-message-list__sender">{{ mail.sender }}</div>
        <div v-if="mail.hasAttach" class="mail-message-list__attach">有附件</div>
      </button>
    </div>
    <div class="mail-message-list__pagination">
      <pagination
        :total="total"
        :page.sync="innerPageNo"
        :limit.sync="innerPageSize"
        :pager-count="5"
        layout="prev, pager, next"
        @pagination="$emit('page-change')"
      />
    </div>
  </section>
</template>

<script>
import { formatDate } from '@/utils/formatTime'

export default {
  name: 'OaMailMessageList',
  props: {
    list: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    },
    listError: {
      type: String,
      required: true
    },
    emptyText: {
      type: String,
      required: true
    },
    selectedId: {
      type: Number,
      default: undefined
    },
    disabled: {
      type: Boolean,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    keyword: {
      type: String,
      required: true
    },
    filter: {
      type: String,
      required: true
    },
    pageNo: {
      type: Number,
      required: true
    },
    pageSize: {
      type: Number,
      required: true
    }
  },
  computed: {
    innerPageNo: {
      get() {
        return this.pageNo
      },
      set(value) {
        this.$emit('update:pageNo', value)
      }
    },
    innerPageSize: {
      get() {
        return this.pageSize
      },
      set(value) {
        this.$emit('update:pageSize', value)
      }
    }
  },
  methods: {
    formatDate
  }
}
</script>

<style lang="scss" scoped>
.mail-message-list {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 340px;
  border-right: 1px solid #ebeef5;

  &__search {
    padding: 16px;
    border-bottom: 1px solid #ebeef5;

    .el-input-group {
      width: 100%;
    }
  }

  &__filter {
    margin-top: 12px;
  }

  &__body {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  &__item {
    display: block;
    width: 100%;
    padding: 8px 12px;
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-bottom: 1px solid #ebeef5;

    &:hover:not(:disabled) {
      background: #f5f7fa;
    }

    &.is-active {
      background: #f5f7fa;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    background: #f56c6c;
    border-radius: 50%;
  }

  &__subject {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .is-unread & {
      font-weight: 700;
    }
  }

  &__time {
    flex-shrink: 0;
    font-size: 12px;
    color: #909399;
  }

  &__sender {
    margin-top: 6px;
    overflow: hidden;
    font-size: 12px;
    color: #909399;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__attach {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }

  &__pagination {
    padding: 12px;
    border-top: 1px solid #ebeef5;
  }
}
</style>
