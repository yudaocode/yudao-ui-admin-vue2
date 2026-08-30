<template>
  <el-dialog
    title="编辑请求头"
    width="600px"
    append-to-body
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="header-editor">
      <div class="header-list">
        <div v-for="(item, index) in headerList" :key="index" class="header-item">
          <el-input v-model="item.key" class="header-key" clearable placeholder="请输入参数名" />
          <span class="separator">:</span>
          <el-input
            v-model="item.value"
            class="header-value"
            clearable
            placeholder="请输入参数值（支持 ${变量名}）"
          />
          <el-button
            type="danger"
            icon="el-icon-delete"
            circle
            size="mini"
            title="移除请求头"
            @click="removeHeader(index)"
          />
        </div>
      </div>
      <el-button type="primary" icon="el-icon-plus" class="add-button" @click="addHeader">
        添加请求头
      </el-button>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'HttpHeaderEditor',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    headers: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      headerList: []
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(value) {
        this.dialogVisible = value
        if (value) this.headerList = this.parseHeaders(this.headers)
      }
    },
    dialogVisible(value) {
      if (value !== this.visible) this.$emit('update:visible', value)
    }
  },
  methods: {
    parseHeaders(headers) {
      if (!headers || !String(headers).trim()) return [{ key: '', value: '' }]
      const parsed = String(headers)
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line) => {
          const index = line.indexOf(':')
          if (index > 0) {
            return {
              key: line.slice(0, index).trim(),
              value: line.slice(index + 1).trim()
            }
          }
          return { key: line.trim(), value: '' }
        })
      return parsed.length ? parsed : [{ key: '', value: '' }]
    },
    stringifyHeaders(headers) {
      return headers
        .filter((item) => item && String(item.key || '').trim())
        .map((item) => `${String(item.key).trim()}: ${String(item.value === undefined || item.value === null ? '' : item.value).trim()}`)
        .join('\n')
    },
    addHeader() {
      this.headerList.push({ key: '', value: '' })
    },
    removeHeader(index) {
      if (this.headerList.length <= 1) {
        this.headerList = [{ key: '', value: '' }]
      } else {
        this.headerList.splice(index, 1)
      }
    },
    handleSave() {
      this.$emit('save', this.stringifyHeaders(this.headerList))
      this.dialogVisible = false
    },
    handleClose() {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.header-editor {
  .header-list {
    max-height: 400px;
    margin-bottom: 16px;
    overflow-y: auto;
  }

  .header-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    gap: 8px;

    .header-key {
      flex: 0 0 180px;
    }

    .header-value {
      flex: 1;
      min-width: 0;
    }
  }

  .separator {
    color: #606266;
    font-weight: 500;
  }

  .add-button {
    width: 100%;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
