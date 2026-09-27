class ProcessRecordMenu {
  constructor() {
    this.title = '流程记录'
    this.tag = 'button'
  }

  getValue(_editor) {
    return ''
  }

  isActive(_editor) {
    return false
  }

  isDisabled(_editor) {
    return false
  }

  exec(editor, _value) {
    if (this.isDisabled(editor)) return
    const processRecordElem = {
      type: 'process-record',
      children: [{ text: '' }]
    }
    editor.insertNode(processRecordElem)
    editor.move(1)
  }
}

const ProcessRecordMenuConf = {
  key: 'ProcessRecordMenu',
  factory() {
    return new ProcessRecordMenu()
  }
}

export default ProcessRecordMenuConf
