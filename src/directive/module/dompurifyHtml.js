import DOMPurify from 'dompurify'

function renderSafeHtml(el, binding) {
  el.innerHTML = DOMPurify.sanitize(binding.value == null ? '' : String(binding.value))
}

export default {
  bind: renderSafeHtml,
  update(el, binding) {
    if (binding.value !== binding.oldValue) renderSafeHtml(el, binding)
  },
  unbind(el) {
    el.innerHTML = ''
  }
}
