/* Small DOM helpers shared by optional print-template integrations. */
export function isElement(value) {
  return Boolean(value && typeof value === 'object' && value.nodeType === 1)
}

export function getDataType(element) {
  return isElement(element) && element.getAttribute
    ? element.getAttribute('data-w-e-type')
    : undefined
}

export const DOMNode = typeof Node === 'undefined' ? undefined : Node
export const DOMComment = typeof Comment === 'undefined' ? undefined : Comment
export const DOMElement = typeof Element === 'undefined' ? undefined : Element
export const DOMText = typeof Text === 'undefined' ? undefined : Text
export const DOMRange = typeof Range === 'undefined' ? undefined : Range
export const DOMSelection = typeof Selection === 'undefined' ? undefined : Selection
export const DOMStaticRange = typeof StaticRange === 'undefined' ? undefined : StaticRange

export default {
  isElement,
  getDataType
}
