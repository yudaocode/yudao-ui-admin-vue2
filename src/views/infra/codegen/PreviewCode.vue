<template>
  <el-dialog title="代码预览" :visible.sync="dialogVisible" width="90%" top="5vh" append-to-body class="scrollbar">
    <el-row v-loading="loading" :gutter="12">
      <el-col :span="7"><el-card shadow="hover"><el-tree :data="fileTree" :expand-on-click-node="false" default-expand-all highlight-current @node-click="handleNodeClick" /></el-card></el-col>
      <el-col :span="17"><el-card shadow="hover"><el-tabs v-model="activeName">
        <el-tab-pane v-for="item in previewCodegen" :key="item.filePath" :label="item.filePath.substring(item.filePath.lastIndexOf('/') + 1)" :name="item.filePath">
          <el-link :underline="false" icon="el-icon-document-copy" v-clipboard:copy="item.code" v-clipboard:success="clipboardSuccess" style="float:right">复制</el-link>
          <pre><code class="hljs" v-dompurify-html="highlightedCode(item)"></code></pre>
        </el-tab-pane>
      </el-tabs></el-card></el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import hljs from 'highlight.js/lib/highlight'
import 'highlight.js/styles/github-gist.css'
import { previewCodegen } from '@/api/infra/codegen'

hljs.registerLanguage('java', require('highlight.js/lib/languages/java'))
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('html', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('vue', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))
hljs.registerLanguage('sql', require('highlight.js/lib/languages/sql'))
hljs.registerLanguage('typescript', require('highlight.js/lib/languages/typescript'))

export default {
  name: 'InfraCodegenPreviewCode',
  data() { return { dialogVisible: false, loading: false, fileTree: [], previewCodegen: [], activeName: '' } },
  methods: {
    open(id) {
      this.dialogVisible = true
      this.loading = true
      this.fileTree = []
      this.previewCodegen = []
      return previewCodegen(id).then(response => {
        this.previewCodegen = response.data
        const files = this.handleFiles(this.previewCodegen)
        this.fileTree = this.handleTree(files, 'id', 'parentId', 'children', '/')
        this.activeName = this.previewCodegen.length ? this.previewCodegen[0].filePath : ''
      }).finally(() => { this.loading = false })
    },
    handleNodeClick(data, node) {
      if (!node || node.isLeaf) this.activeName = data.id
    },
    handleFiles(datas) {
      const exists = {}
      const files = []
      ;(datas || []).forEach(data => {
        let paths = String(data.filePath || '').split('/')
        let fullPath = ''
        if (paths.length && paths[paths.length - 1].indexOf('.java') >= 0) {
          const newPaths = []
          for (let i = 0; i < paths.length; i += 1) {
            const segment = paths[i]
            newPaths.push(segment)
            if (segment !== 'java') continue
            let tmp = ''
            while (i + 1 < paths.length) {
              const next = paths[i + 1]
              if (['controller', 'convert', 'dal', 'enums', 'service', 'vo', 'mysql', 'dataobject'].indexOf(next) >= 0) break
              tmp = tmp ? tmp + '.' + next : next
              i += 1
            }
            if (tmp) newPaths.push(tmp)
          }
          paths = newPaths
        }
        paths.forEach(segment => {
          const oldFullPath = fullPath
          fullPath = fullPath ? fullPath.replace(/\./g, '/') + '/' + segment : segment
          if (exists[fullPath]) return
          exists[fullPath] = true
          files.push({ id: fullPath, label: segment, parentId: oldFullPath || '/' })
        })
      })
      return files
    },
    highlightedCode(item) {
      const language = String(item.filePath || '').split('.').pop()
      if (!hljs.getLanguage(language)) {
        return String(item.code || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') || '&nbsp;'
      }
      return hljs.highlight(language, item.code || '', true).value || '&nbsp;'
    },
    clipboardSuccess() { this.$modal.msgSuccess('复制成功') }
  }
}
</script>
