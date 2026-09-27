<template>
  <el-card class="mindmap-card">
    <div slot="header" class="card-header">
      <h3>思维导图预览</h3>
      <el-button v-show="isEnd" size="mini" type="primary" icon="el-icon-download" @click="downloadImage">
        下载图片
      </el-button>
    </div>

    <div ref="content" class="content-area">
      <div
        v-if="isGenerating"
        ref="markdownContainer"
        class="stream-content"
        v-html="html"
      />

      <div v-show="!isGenerating" ref="mindMap" class="mindmap-stage">
        <svg ref="svg" class="mindmap-svg" :style="{ height: contentAreaHeight + 'px' }" />
        <div ref="toolbar" class="toolbar" />
      </div>
    </div>
  </el-card>
</template>

<script>
import { Markmap } from 'markmap-view'
import { Transformer } from 'markmap-lib'
import { Toolbar } from 'markmap-toolbar'
import MarkdownIt from 'markdown-it'
import 'markmap-toolbar/dist/style.css'

const md = new MarkdownIt()

export default {
  name: 'AiMindMapRight',
  props: {
    generatedContent: {
      type: String,
      default: ''
    },
    isEnd: {
      type: Boolean,
      required: true
    },
    isGenerating: {
      type: Boolean,
      required: true
    },
    isStart: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      html: '',
      contentAreaHeight: 0
    }
  },
  watch: {
    generatedContent(value) {
      if (this.isGenerating) {
        this.html = md.render(value)
        this.$nextTick(this.scrollBottom)
      }
      if (this.isEnd) this.$nextTick(this.update)
    },
    isGenerating(value) {
      if (value) this.html = md.render(this.generatedContent)
    },
    isStart(value) {
      if (value) this.html = ''
    },
    isEnd(value) {
      if (value) this.$nextTick(this.update)
    }
  },
  created() {
    this.markMap = null
    this.transformer = new Transformer()
  },
  mounted() {
    this.contentAreaHeight = this.$refs.content.clientHeight || 520
    try {
      this.markMap = Markmap.create(this.$refs.svg)
      const toolbar = Toolbar.create(this.markMap)
      this.$refs.toolbar.appendChild(toolbar.el)
      this.$nextTick(this.update)
    } catch (error) {
      this.$message.error('思维导图初始化失败')
    }
  },
  methods: {
    update() {
      if (!this.markMap) return
      try {
        const result = this.transformer.transform(this.processContent(this.generatedContent))
        this.markMap.setData(result.root)
        this.markMap.fit()
      } catch (error) {
        console.error(error)
      }
    },
    processContent(text) {
      const lines = text.split('\n')
      const result = []
      lines.forEach(line => {
        if (line.indexOf('```') !== -1) return
        result.push(line.replace(/([*_~`>])|(\d+\.)\s/g, ''))
      })
      return result.join('\n')
    },
    scrollBottom() {
      const container = this.$refs.markdownContainer
      if (container) container.scrollTo(0, container.scrollHeight)
    },
    downloadImage() {
      const svgElement = this.$refs.svg
      const mindMapElement = this.$refs.mindMap
      if (!svgElement || !mindMapElement) return
      const serializer = new XMLSerializer()
      const source =
        '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svgElement)
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = mindMapElement.offsetWidth
        canvas.height = mindMapElement.offsetHeight
        const context = canvas.getContext('2d')
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, 0, 0)
        const anchor = document.createElement('a')
        anchor.href = canvas.toDataURL('image/png')
        anchor.download = 'image.png'
        anchor.click()
      }
      image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)
    }
  }
}
</script>

<style lang="scss" scoped>
.mindmap-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
  }
}

.content-area,
.mindmap-stage {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 520px;
}

.content-area {
  overflow: hidden;
}

.mindmap-stage {
  overflow: auto;
}

.stream-content {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 520px;
  padding: 24px;
  overflow-y: auto;
  color: #303133;
  line-height: 1.7;
}

.mindmap-svg {
  display: block;
  width: 100%;
  min-height: 520px;
}

.toolbar {
  position: absolute;
  right: 20px;
  bottom: 10px;
}

::v-deep .markmap {
  width: 100%;
}

::v-deep .mm-toolbar-brand {
  display: none;
}

::v-deep .mm-toolbar {
  display: flex;
  flex-direction: row;
}

::v-deep .el-card__header {
  flex-shrink: 0;
}

::v-deep .el-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  box-sizing: border-box;
  padding: 0;
  overflow: hidden;
}
</style>
