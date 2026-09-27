import { Boot } from '@wangeditor-next/editor'
import mentionModule from '@wangeditor-next/plugin-mention'
import processRecordModule from './module'

let registered = false
export function setupWangEditorPlugin() {
  if (registered) return
  Boot.registerModule(processRecordModule)
  Boot.registerModule(mentionModule)
  registered = true
}
