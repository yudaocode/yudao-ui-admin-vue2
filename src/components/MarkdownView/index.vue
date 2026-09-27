<template>
  <div ref="content" class="markdown-view" v-html="renderedMarkdown" @click="handleCopy" />
</template>

<script>
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'

const md = new MarkdownIt({
  highlight(code, language) {
    if (language && hljs.getLanguage(language)) {
      try {
        const copyButton =
          '<button type="button" class="markdown-code-copy" data-code="' +
          encodeURIComponent(code) +
          '">复制</button>'
        return (
          '<pre class="markdown-code-block">' +
          copyButton +
          '<code class="hljs">' +
          hljs.highlight(language, code, true).value +
          '</code></pre>'
        )
      } catch (error) {
        return ''
      }
    }
    return ''
  }
})

export default {
  name: 'MarkdownView',
  props: {
    content: {
      type: String,
      required: true
    }
  },
  computed: {
    renderedMarkdown() {
      return md.render(this.content)
    }
  },
  methods: {
    async handleCopy(event) {
      const target = event.target
      if (!target.classList || !target.classList.contains('markdown-code-copy')) return
      const content = decodeURIComponent(target.dataset.code || '')
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = content
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      this.$message.success('复制成功!')
    }
  }
}
</script>

<style lang="scss">
.markdown-view {
  max-width: 100%;
  color: #3b3e55;
  font-family: 'PingFang SC', sans-serif;
  font-size: 0.95rem;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1.6rem;
  text-align: left;

  .markdown-code-block {
    position: relative;
  }

  .markdown-code-copy {
    position: absolute;
    z-index: 1;
    top: 5px;
    right: 10px;
    padding: 0;
    border: 0;
    color: #fff;
    background: transparent;
    cursor: pointer;
  }

  pre code.hljs {
    width: auto;
  }

  code.hljs {
    width: auto;
    padding-top: 20px;
    border-radius: 6px;

    @media screen and (min-width: 1536px) {
      width: 960px;
    }

    @media screen and (min-width: 1024px) and (max-width: 1536px) {
      width: calc(100vw - 400px - 64px - 32px * 2);
    }

    @media screen and (min-width: 768px) and (max-width: 1024px) {
      width: calc(100vw - 32px * 2);
    }

    @media screen and (max-width: 768px) {
      width: calc(100vw - 16px * 2);
    }
  }

  p,
  code.hljs {
    margin-bottom: 16px;
  }

  p {
    margin: 0 0 3px;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 24px 0 8px;
    color: #3b3e55;
    font-weight: 600;
  }

  h1 { font-size: 22px; line-height: 32px; }
  h2 { font-size: 20px; line-height: 30px; }
  h3 { font-size: 18px; line-height: 28px; }
  h4 { font-size: 16px; line-height: 26px; }
  h5,
  h6 { font-size: 16px; line-height: 24px; }

  ul,
  ol {
    padding: 0;
    margin: 0 0 8px;
    color: #3b3e55;
    font-size: 16px;
    line-height: 24px;
  }

  li {
    margin: 4px 0 1rem 20px;
  }

  ol > li {
    list-style-type: decimal;
  }

  ul > li {
    margin-right: 11px;
    color: #3b3e55;
    font-size: 16px;
    line-height: 24px;
    list-style-type: disc;
  }

  ol ul,
  ol ul > li,
  ul ul,
  ul ul li {
    margin-bottom: 1rem;
    margin-left: 6px;
    font-size: 16px;
    list-style: none;
  }

  ul ul ul,
  ul ul ul li,
  ol ol,
  ol ol > li,
  ol ul ul,
  ol ul ul > li,
  ul ol,
  ul ol > li {
    list-style: square;
  }
}
</style>
