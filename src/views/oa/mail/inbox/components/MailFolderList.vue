<template>
  <aside class="mail-folder">
    <mail-account-select
      :value="accountId"
      :accounts="accounts"
      :disabled="syncing || composing"
      @input="handleAccountInput"
      @change="handleAccountChange"
    />
    <el-button
      type="primary"
      class="mail-folder__compose"
      size="small"
      :disabled="!accountId || composing"
      @click="$emit('compose')"
    >
      写信
    </el-button>
    <nav class="mail-folder__list">
      <button
        v-for="folder in folders"
        :key="folder.key"
        type="button"
        class="mail-folder__item"
        :class="{ 'is-active': folderKey === folder.key }"
        :disabled="composing || operating"
        @click="$emit('folder-change', folder.key)"
      >
        <span class="mail-folder__name" :title="folder.name">{{ folder.name }}</span>
        <span
          v-if="folder.unreadCount > 0"
          class="mail-folder__unread"
          :title="folder.unreadCount + ' 封未读邮件'"
        >
          {{ folder.unreadCount }}
        </span>
      </button>
    </nav>
    <div class="mail-folder__footer">
      <el-button size="small" :loading="syncing" :disabled="!accountId || composing" @click="$emit('sync')">
        同步
      </el-button>
      <el-button size="small" @click="$emit('settings')">账号设置</el-button>
    </div>
  </aside>
</template>

<script>
import MailAccountSelect from '../../account/components/MailAccountSelect.vue'

export default {
  name: 'OaMailFolderList',
  components: { MailAccountSelect },
  props: {
    accountId: {
      type: Number,
      default: undefined
    },
    accounts: {
      type: Array,
      required: true
    },
    folders: {
      type: Array,
      required: true
    },
    folderKey: {
      type: String,
      required: true
    },
    syncing: {
      type: Boolean,
      required: true
    },
    composing: {
      type: Boolean,
      required: true
    },
    operating: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    handleAccountInput(value) {
      this.$emit('update:accountId', value)
    },
    handleAccountChange() {
      this.$emit('account-change')
    }
  }
}
</script>

<style lang="scss" scoped>
.mail-folder {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 220px;
  padding: 12px;
  border-right: 1px solid #ebeef5;

  &__compose {
    margin-top: 8px;
    margin-left: 0;
  }

  &__list {
    flex: 1;
    min-height: 0;
    margin-top: 12px;
    overflow: auto;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    height: 36px;
    padding: 0 12px;
    margin-bottom: 4px;
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 4px;

    &:hover:not(:disabled) {
      background: #f5f7fa;
    }

    &.is-active {
      font-weight: 700;
      color: #409eff;
      background: #f5f7fa;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__unread {
    flex-shrink: 0;
    font-size: 12px;
    color: #409eff;
  }

  &__footer {
    padding-top: 16px;
    margin-top: auto;
  }
}
</style>
