<!--
  Vue 3 keeps the editor under PrintTemplate/Index.vue.  Keep the same import
  path available to Vue 2 callers while the implementation lives in the
  Vue2 Element UI component one directory up.
-->
<script>
import PrintTemplateEditor from '../PrintTemplateEditor.vue'
export { setupWangEditorPlugin } from './setup'

export default PrintTemplateEditor
</script>
