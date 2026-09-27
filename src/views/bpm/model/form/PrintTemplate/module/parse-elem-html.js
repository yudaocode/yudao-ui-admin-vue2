function parseHtml(_domElem, _children, _editor) {
  const processRecord = {
    type: 'process-record',
    children: [{ text: '' }]
  }

  return processRecord
}

const parseHtmlConf = {
  selector: 'span[data-w-e-type="process-record"]',
  parseElemHtml: parseHtml
}

export default parseHtmlConf
