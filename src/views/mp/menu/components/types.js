export const MENU_NOT_SELECTED = '__MENU_NOT_SELECTED__'

export const MenuLevel = Object.freeze({
  Undefined: '0',
  Parent: '1',
  Child: '2'
})

/**
 * @typedef {Object} MpMenuReply
 * @property {string} [type]
 * @property {number|string} [accountId]
 * @property {string} [content]
 * @property {string} [mediaId]
 * @property {string} [url]
 * @property {Array<Object>} [articles]
 */

/**
 * @typedef {Object} MpMenu
 * @property {number|string} [id]
 * @property {string} [name]
 * @property {string} [type]
 * @property {MpMenuReply} [reply]
 * @property {MpMenu[]} [children]
 */

export function createMenu(name, accountId, withChildren) {
  const menu = {
    name,
    reply: {
      type: 'text',
      accountId
    }
  }
  if (withChildren) menu.children = []
  return menu
}
