<template>
  <div class="write-left">
    <div class="write-tabs">
      <div class="write-tabs__inner">
        <span
          v-for="tab in tabs"
          :key="tab.value"
          class="write-tabs__item"
          :class="{ 'is-active': tab.value === selectedTab }"
          @click="switchTab(tab.value)"
        >{{ tab.text }}</span>
      </div>
    </div>

    <div class="write-left__body">
      <template v-if="selectedTab === AiWriteTypeEnum.WRITING">
        <WriteLabel
          label="写作内容"
          hint="示例"
          @hint-click="example('write')"
        />
        <el-input
          v-model="formData.prompt"
          :maxlength="500"
          :rows="5"
          placeholder="请输入写作内容"
          show-word-limit
          type="textarea"
        />
      </template>

      <template v-else>
        <WriteLabel
          label="原文"
          hint="示例"
          @hint-click="example('reply')"
        />
        <el-input
          v-model="formData.originalContent"
          :maxlength="500"
          :rows="5"
          placeholder="请输入原文"
          show-word-limit
          type="textarea"
        />

        <WriteLabel label="回复内容" />
        <el-input
          v-model="formData.prompt"
          :maxlength="500"
          :rows="5"
          placeholder="请输入回复内容"
          show-word-limit
          type="textarea"
        />
      </template>

      <WriteLabel label="长度" />
      <Tag
        v-model="formData.length"
        :tags="lengthTags"
      />
      <WriteLabel label="格式" />
      <Tag
        v-model="formData.format"
        :tags="formatTags"
      />
      <WriteLabel label="语气" />
      <Tag
        v-model="formData.tone"
        :tags="toneTags"
      />
      <WriteLabel label="语言" />
      <Tag
        v-model="formData.language"
        :tags="languageTags"
      />

      <div class="write-left__actions">
        <el-button
          :disabled="isWriting"
          @click="reset"
        >重置</el-button>
        <el-button
          type="primary"
          :loading="isWriting"
          class="write-left__generate"
          @click="submit"
        >生成</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Tag from './Tag.vue'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { AiWriteTypeEnum } from '@/views/ai/utils/constants'

const initData = {
  type: AiWriteTypeEnum.WRITING,
  prompt: '',
  originalContent: '',
  tone: 1,
  language: 1,
  length: 1,
  format: 1
}

const examples = {
  write: {
    prompt: 'vue',
    data: 'Vue.js 是一种用于构建用户界面的渐进式 JavaScript 框架。它的核心库只关注视图层，易于上手，同时也便于与其他库或已有项目整合。\n\nVue.js 的特点包括：\n- 响应式的数据绑定：Vue.js 会自动将数据与 DOM 同步，使得状态管理变得更加简单。\n- 组件化：Vue.js 允许开发者通过小型、独立和通常可复用的组件构建大型应用。\n- 虚拟 DOM：Vue.js 使用虚拟 DOM 实现快速渲染，提高了性能。\n\n在 Vue.js 中，一个典型的应用结构可能包括：\n1. 根实例：每个 Vue 应用都需要一个根实例作为入口点。\n2. 组件系统：可以创建自定义的可复用组件。\n3. 指令：特殊的带有前缀 v- 的属性，为 DOM 元素提供特殊的行为。\n4. 插值：用于文本内容，将数据动态地插入到 HTML。\n5. 计算属性和侦听器：用于处理数据的复杂逻辑和响应数据变化。\n6. 条件渲染：根据条件决定元素的渲染。\n7. 列表渲染：用于显示列表数据。\n8. 事件处理：响应用户交互。\n9. 表单输入绑定：处理表单输入和验证。\n10. 组件生命周期钩子：在组件的不同阶段执行特定的函数。\n\nVue.js 还提供了官方的路由器 Vue Router 和状态管理库 Vuex，以支持构建复杂的单页应用（SPA）。\n\n在开发过程中，开发者通常会使用 Vue CLI，这是一个强大的命令行工具，用于快速生成 Vue 项目脚手架，集成了诸如 Babel、Webpack 等现代前端工具，以及热重载、代码检测等开发体验优化功能。\n\nVue.js 的生态系统还包括大量的第三方库和插件，如 Vuetify（UI 组件库）、Vue Test Utils（测试工具）等，这些都极大地丰富了 Vue.js 的开发生态。\n\n总的来说，Vue.js 是一个灵活、高效的前端框架，适合从小型项目到大型企业级应用的开发。它的易用性、灵活性和强大的社区支持使其成为许多开发者的首选框架之一。'
  },
  reply: {
    originalContent: '领导，我想请假',
    prompt: '不批',
    data: '您的请假申请已收悉，经核实和考虑，暂时无法批准您的请假申请。\n\n如有特殊情况或紧急事务，请及时与我联系。\n\n祝工作顺利。\n\n谢谢。'
  }
}

const WriteLabel = {
  name: 'AiWriteLabel',
  props: {
    label: { type: String, required: true },
    hint: { type: String, default: '' }
  },
  render(h) {
    const children = [h('span', this.label)]
    if (this.hint) {
      children.push(h('span', {
        class: 'write-label__hint',
        on: { click: () => this.$emit('hint-click') }
      }, [h('i', { class: 'el-icon-question' }), this.hint]))
    }
    return h('h3', { class: 'write-label' }, children)
  }
}

export default {
  name: 'AiWriteLeft',
  components: { Tag, WriteLabel },
  props: {
    isWriting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      AiWriteTypeEnum,
      selectedTab: AiWriteTypeEnum.WRITING,
      tabs: [
        { text: '撰写', value: AiWriteTypeEnum.WRITING },
        { text: '回复', value: AiWriteTypeEnum.REPLY }
      ],
      formData: Object.assign({}, initData),
      recordFormData: {}
    }
  },
  computed: {
    lengthTags() {
      return this.getIntDictOptions(DICT_TYPE.AI_WRITE_LENGTH)
    },
    formatTags() {
      return this.getIntDictOptions(DICT_TYPE.AI_WRITE_FORMAT)
    },
    toneTags() {
      return this.getIntDictOptions(DICT_TYPE.AI_WRITE_TONE)
    },
    languageTags() {
      return this.getIntDictOptions(DICT_TYPE.AI_WRITE_LANGUAGE)
    }
  },
  methods: {
    getIntDictOptions(dictType) {
      return getDictDatas(dictType).map(item => ({
        label: item.label,
        value: Number(item.value)
      }))
    },
    example(type) {
      const example = examples[type]
      this.formData = Object.assign({}, initData, {
        prompt: example.prompt || '',
        originalContent: example.originalContent || ''
      })
      this.$emit('example', { type, data: example.data })
    },
    reset() {
      this.formData = Object.assign({}, initData)
      this.$emit('reset')
    },
    switchTab(value) {
      if (value === this.selectedTab) return
      this.$set(this.recordFormData, this.selectedTab, this.formData)
      this.selectedTab = value
      this.formData = Object.assign({}, initData, this.recordFormData[value])
    },
    submit() {
      if (this.selectedTab === AiWriteTypeEnum.REPLY && !this.formData.originalContent) {
        this.$message.warning('请输入原文')
        return
      }
      if (!this.formData.prompt) {
        this.$message.warning(`请输入${this.selectedTab === AiWriteTypeEnum.WRITING ? '写作' : '回复'}内容`)
        return
      }
      const data = Object.assign({}, this.formData, { type: this.selectedTab })
      if (this.selectedTab === AiWriteTypeEnum.WRITING) delete data.originalContent
      this.$emit('submit', data)
    }
  }
}
</script>

<style scoped>
.write-left {
  display: flex;
  flex-direction: column;
  width: 380px;
  height: 100%;
  background: #f5f7f9;
}

.write-tabs {
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: 8px;
  background: #f5f7f9;
}

.write-tabs__inner {
  display: flex;
  width: 303px;
  padding: 4px;
  border-radius: 999px;
  background: #dddfe3;
}

.write-tabs__item {
  display: inline-block;
  width: 50%;
  border-radius: 999px;
  color: #5c6370;
  text-align: center;
  line-height: 30px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
}

.write-tabs__item:hover {
  color: #000;
}

.write-tabs__item.is-active {
  color: #000;
  background: #fff;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}

.write-left__body {
  box-sizing: border-box;
  flex: 1;
  width: 380px;
  padding: 0 28px 8px;
  overflow-y: auto;
}

::v-deep .write-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 12px;
  font-size: 14px;
}

::v-deep .write-label__hint {
  display: flex;
  align-items: center;
  color: #846af7;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
}

::v-deep .write-label__hint i {
  margin-right: 2px;
}

.write-left__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
}

.write-left__generate {
  border-color: #846af7;
  background-color: #846af7;
}
</style>
