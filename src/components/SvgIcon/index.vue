<template>
  <span v-if="!hasIcon" />
  <i v-else-if="isElementIcon" :class="elementIconClass" :style="iconStyle" v-on="$listeners" />
  <div v-else-if="isExternal" :style="styleExternalIcon" class="svg-external-icon svg-icon" v-on="$listeners" />
  <svg v-else :class="svgIconClass" :style="iconStyle" aria-hidden="true" v-on="$listeners">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script>
import { isExternal } from '@/utils/validate'

const LOCAL_ICON_NAMES = new Set([
  '404', 'bug', 'build', 'button', 'cascader', 'chart', 'checkbox', 'clipboard',
  'code', 'color', 'component', 'config', 'dashboard', 'date', 'date-range',
  'dict', 'documentation', 'download', 'drag', 'druid', 'edit', 'education',
  'email', 'example', 'excel', 'exit-fullscreen', 'eye', 'eye-open', 'form',
  'fullscreen', 'github', 'guide', 'icon', 'input', 'international', 'job',
  'language', 'link', 'list', 'lock', 'log', 'logininfor', 'map', 'merchant',
  'message', 'money', 'monitor', 'nested', 'number', 'online', 'order',
  'password', 'pay', 'pdf', 'people', 'peoples', 'percentSign', 'phone', 'post',
  'qq', 'question', 'radio', 'rate', 'redis', 'rich-text', 'row', 'search',
  'select', 'server', 'shopping', 'size', 'skill', 'slider', 'star', 'swagger',
  'switch', 'system', 'tab', 'table', 'textarea', 'theme', 'time', 'time-range',
  'tool', 'tree', 'tree-table', 'upload', 'user', 'validCode', 'wechat', 'zip'
])

const ELEMENT_ICON_NAMES = new Set([
  'add-location', 'aim', 'alarm-clock', 'apple', 'arrow-down', 'arrow-left',
  'arrow-right', 'arrow-up', 'attract', 'back', 'bangzhu', 'bank-card',
  'baseball', 'basketball', 'bell', 'bicycle', 'bottom', 'bottom-left',
  'bottom-right', 'box', 'brush', 'burger', 'c-scale-to-original', 'camera',
  'camera-solid', 'caret-bottom', 'caret-left', 'caret-right', 'caret-top',
  'chat-dot-round', 'chat-dot-square', 'chat-line-round', 'chat-line-square',
  'chat-round', 'chat-square', 'check', 'cherry', 'chicken', 'circle-check',
  'circle-close', 'circle-plus', 'circle-plus-outline', 'close',
  'close-notification', 'cloudy', 'cloudy-and-sunny', 'coffee', 'coffee-cup',
  'coin', 'cold-drink', 'collection', 'collection-tag', 'connection',
  'coordinate', 'copy-document', 'cpu', 'crop', 'd-arrow-left', 'd-arrow-right',
  'd-caret', 'data-analysis', 'data-board', 'data-line', 'date', 'delete',
  'delete-location', 'delete-solid', 'dessert', 'discount', 'discover', 'dish',
  'dish-1', 'document', 'document-add', 'document-checked', 'document-copy',
  'document-delete', 'document-remove', 'download', 'edit', 'edit-outline',
  'eleme', 'error', 'female', 'files', 'film', 'finished', 'first-aid-kit',
  'folder', 'folder-add', 'folder-checked', 'folder-delete', 'folder-opened',
  'folder-remove', 'food', 'football', 'fork-spoon', 'full-screen', 'goblet',
  'goblet-full', 'goblet-square', 'goblet-square-full', 'goods', 'grape',
  'guide', 'headset', 'heavy-rain', 'help', 'hot-water', 'house', 'ice-cream',
  'ice-cream-round', 'ice-cream-square', 'ice-drink', 'ice-tea', 'info', 'key',
  'knife-fork', 'light-rain', 'lightning', 'link', 'loading', 'location',
  'location-information', 'location-outline', 'lock', 'lollipop', 'magic-stick',
  'male', 'map-location', 'medal', 'medal-1', 'menu', 'message',
  'message-solid', 'mic', 'microphone', 'milk-tea', 'minus', 'mobile',
  'mobile-phone', 'money', 'monitor', 'moon', 'moon-night', 'more',
  'more-outline', 'mouse', 'news', 'no-smoking', 'notebook-1', 'notebook-2',
  'odometer', 'office-building', 'open', 'orange', 'paperclip', 'partly-cloudy',
  'pear', 'phone', 'phone-outline', 'picture', 'picture-outline',
  'picture-outline-round', 'pie-chart', 'place', 'platform-eleme', 'plus',
  'position', 'postcard', 'potato-strips', 'present', 'price-tag', 'printer',
  'question', 'rank', 'reading', 'receiving', 'refresh', 'refresh-left',
  'refresh-right', 'refrigerator', 'remove', 'remove-outline', 'right',
  's-check', 's-claim', 's-comment', 's-cooperation', 's-custom', 's-data',
  's-finance', 's-flag', 's-fold', 's-goods', 's-grid', 's-help', 's-home',
  's-management', 's-marketing', 's-open', 's-operation', 's-opportunity',
  's-order', 's-platform', 's-promotion', 's-release', 's-shop', 's-ticket',
  's-tools', 's-unfold', 'school', 'scissors', 'search', 'sell', 'service',
  'set-up', 'setting', 'share', 'ship', 'shopping-bag-1', 'shopping-bag-2',
  'shopping-cart-1', 'shopping-cart-2', 'shopping-cart-full', 'smoking',
  'soccer', 'sold-out', 'sort', 'sort-down', 'sort-up', 'star-off', 'star-on',
  'stopwatch', 'success', 'sugar', 'suitcase', 'suitcase-1', 'sunny',
  'sunrise', 'sunrise-1', 'sunset', 'switch-button', 'table-lamp', 'tableware',
  'takeaway-box', 'thumb', 'tickets', 'time', 'timer', 'toilet-paper', 'top',
  'top-left', 'top-right', 'trophy', 'trophy-1', 'truck', 'turn-off',
  'turn-off-microphone', 'umbrella', 'unlock', 'upload', 'upload2', 'user',
  'user-solid', 'video-camera', 'video-camera-solid', 'video-pause',
  'video-play', 'view', 'wallet', 'warning', 'warning-outline', 'watch',
  'watch-1', 'water-cup', 'watermelon', 'wind-power', 'zoom-in', 'zoom-out'
])

const EP_ICON_ALIASES = {
  'ep:arrow-right-bold': 'right',
  'ep:arrow-left-bold': 'back',
  'ep:arrow-down-bold': 'bottom',
  'ep:arrow-up-bold': 'top',
  'ep:avatar': 'user',
  'ep:bowl': 'dish',
  'ep:calendar': 'date',
  'ep:cellphone': 'mobile-phone',
  'ep:checked': 's-check',
  'ep:circle-check-filled': 'success',
  'ep:circle-close-filled': 'error',
  'ep:circle-plus': 'circle-plus-outline',
  'ep:circle-plus-filled': 'circle-plus',
  'ep:clock': 'time',
  'ep:comment': 's-comment',
  'ep:compass': 'position',
  'ep:credit-card': 'bank-card',
  'ep:dish-dot': 'dish',
  'ep:edit-pen': 'edit',
  'ep:expand': 'full-screen',
  'ep:home-filled': 's-home',
  'ep:info-filled': 'info',
  'ep:list': 'tickets',
  'ep:management': 's-management',
  'ep:memo': 'document',
  'ep:message-box': 'message',
  'ep:mostly-cloudy': 'partly-cloudy',
  'ep:mute-notification': 'close-notification',
  'ep:notebook': 'notebook-1',
  'ep:operation': 's-operation',
  'ep:opportunity': 's-opportunity',
  'ep:picture-rounded': 'picture-outline-round',
  'ep:platform': 's-platform',
  'ep:promotion': 's-promotion',
  'ep:question-filled': 'question',
  'ep:scale-to-original': 'c-scale-to-original',
  'ep:scissor': 'scissors',
  'ep:shop': 's-shop',
  'ep:shopping-cart': 'shopping-cart-full',
  'ep:tools': 's-tools',
  'ep:trend-charts': 'data-line',
  'ep:upload': 'upload2',
  'ep:upload-filled': 'upload2',
  'ep:user-filled': 'user-solid',
  'ep:warning-filled': 'warning'
}

const ICONIFY_NAME_ALIASES = {
  abacus: 'data-analysis',
  'address-book-o': 'notebook-1',
  'address-card': 'postcard',
  'align-center': 's-data',
  'apple-alt': 'apple',
  archive: 'box',
  'area-chart': 'data-analysis',
  'assistive-listening-systems': 'headset',
  asterisk: 'star-on',
  award: 'medal',
  bandcamp: 'connection',
  barcode: 'tickets',
  bars: 'menu',
  'battery-3': 'cpu',
  blog: 'document',
  bone: 'food',
  book: 'reading',
  'book-reader': 'reading',
  'bookmark-o': 'collection-tag',
  'border-all': 's-grid',
  bus: 'truck',
  buysellads: 'sell',
  'cc-paypal': 'money',
  certificate: 'medal',
  'charging-station': 'lightning',
  civicrm: 's-custom',
  cogs: 'setting',
  connectdevelop: 'connection',
  dashcube: 'data-board',
  dedent: 'document',
  delicious: 'platform-eleme',
  disease: 'first-aid-kit',
  dragon: 'guide',
  erpnext: 's-platform',
  eye: 'view',
  'fighter-jet': 'position',
  'file-image-o': 'picture',
  'file-signature': 'document-checked',
  'first-order': 'sort',
  gopuram: 'office-building',
  'grin-stars': 'user',
  group: 'user',
  'hand-grab-o': 'position',
  hdd: 'box',
  'hdd-o': 'box',
  'house-user': 's-home',
  'layer-group': 's-grid',
  leaf: 'magic-stick',
  leanpub: 'reading',
  'level-up': 'top',
  'mail-bulk': 'message',
  'map-marker': 'location',
  medium: 'message',
  mobile: 'mobile-phone',
  music: 'bell',
  'notes-medical': 'first-aid-kit',
  'object-ungroup': 's-grid',
  pagelines: 'guide',
  paypal: 'money',
  'power-off': 'switch-button',
  'product-hunt': 'goods',
  'project-diagram': 's-operation',
  qrcode: 'tickets',
  'record-vinyl': 'video-play',
  registered: 'finished',
  republican: 's-flag',
  road: 'guide',
  rocket: 's-promotion',
  sellsy: 'sell',
  sitemap: 's-operation',
  slack: 'message',
  soundcloud: 'cloudy',
  square: 'menu',
  'stack-exchange': 'connection',
  superpowers: 'magic-stick',
  tag: 'price-tag',
  tasks: 's-order',
  tools: 's-tools',
  'transgender-alt': 'user',
  'universal-access': 'user',
  'user-alt': 'user',
  'user-secret': 'user',
  'user-tie': 's-custom',
  'window-restore': 'copy-document',
  wpexplorer: 'search',
  wpforms: 'document',
  'y-combinator': 'connection',
  ai: 'cpu',
  'page-edit': 'edit'
}

const ICONIFY_KEYWORD_ALIASES = [
  [/user|avatar|group|address/, 'user'],
  [/book|blog|memo|document|file|wpforms|page/, 'document'],
  [/chart|analysis|abacus|data/, 'data-analysis'],
  [/money|pay|credit|card|wallet/, 'money'],
  [/map|location|road|place/, 'map-location'],
  [/tree|sitemap|diagram|layer|grid|border/, 's-operation'],
  [/shop|goods|product|sell|tag/, 'goods'],
  [/message|mail|slack|medium/, 'message'],
  [/tool|cog|setting/, 'setting'],
  [/home|house/, 's-home'],
  [/truck|bus/, 'truck'],
  [/ai|cpu|hdd|battery/, 'cpu'],
  [/edit|brush/, 'edit'],
  [/search|explorer/, 'search']
]

function toElementIcon(iconName) {
  return `el-icon-${iconName}`
}

function isIconifyName(icon) {
  return /^[a-z0-9-]+:.+/.test(icon)
}

function normalizeIconName(icon) {
  const iconName = String(icon || '').trim()
  if (!iconName || iconName === '#') {
    return ''
  }
  if (/^ep-[a-z0-9-]+$/.test(iconName)) {
    return iconName.replace('ep-', 'ep:')
  }
  return iconName
}

function getIconifyName(icon) {
  return icon.slice(icon.indexOf(':') + 1)
}

function resolveElementIconName(name, fallback = 'menu') {
  if (ELEMENT_ICON_NAMES.has(name)) {
    return name
  }
  if (ICONIFY_NAME_ALIASES[name]) {
    return ICONIFY_NAME_ALIASES[name]
  }
  const normalized = name.replace(/-o$/, '').replace(/-alt$/, '').replace(/-filled$/, '')
  if (ELEMENT_ICON_NAMES.has(normalized)) {
    return normalized
  }
  if (ICONIFY_NAME_ALIASES[normalized]) {
    return ICONIFY_NAME_ALIASES[normalized]
  }
  const keyword = ICONIFY_KEYWORD_ALIASES.find((item) => item[0].test(name))
  return keyword ? keyword[1] : fallback
}

export default {
  name: 'SvgIcon',
  props: {
    iconClass: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    className: {
      type: String,
      default: ''
    },
    svgClass: {
      type: String,
      default: ''
    },
    size: {
      type: [Number, String],
      default: ''
    },
    color: {
      type: String,
      default: ''
    }
  },
  computed: {
    normalizedIcon() {
      return normalizeIconName(this.icon || this.iconClass)
    },
    hasIcon() {
      return Boolean(this.normalizedIcon)
    },
    isExternal() {
      return isExternal(this.normalizedIcon)
    },
    isElementIcon() {
      return Boolean(this.resolveElementIcon(this.normalizedIcon))
    },
    elementIconClass() {
      const classNames = ['svg-icon', 'element-icon', this.resolveElementIcon(this.normalizedIcon)]
      if (this.customClassName) {
        classNames.push(this.customClassName)
      }
      return classNames.filter(Boolean).join(' ')
    },
    localIconName() {
      return this.normalizedIcon.startsWith('svg-icon:')
        ? this.normalizedIcon.slice('svg-icon:'.length)
        : this.normalizedIcon
    },
    iconName() {
      return `#icon-${this.localIconName}`
    },
    svgIconClass() {
      if (this.customClassName) {
        return 'svg-icon ' + this.customClassName
      } else {
        return 'svg-icon'
      }
    },
    styleExternalIcon() {
      return Object.assign({
        mask: `url(${this.normalizedIcon}) no-repeat 50% 50%`,
        '-webkit-mask': `url(${this.normalizedIcon}) no-repeat 50% 50%`
      }, this.iconStyle)
    },
    iconStyle() {
      const style = {}
      if (this.size) {
        const size = typeof this.size === 'number' ? `${this.size}px` : this.size
        style.fontSize = size
        style.width = size
        style.height = size
      }
      if (this.color) {
        style.color = this.color
      }
      return style
    },
    customClassName() {
      return [this.className, this.svgClass].filter(Boolean).join(' ')
    }
  },
  methods: {
    resolveElementIcon(icon) {
      if (!icon) {
        return ''
      }
      if (icon.startsWith('el-icon-')) {
        return icon
      }
      if (!isIconifyName(icon) && !LOCAL_ICON_NAMES.has(icon) && ELEMENT_ICON_NAMES.has(icon)) {
        return toElementIcon(icon)
      }
      if (EP_ICON_ALIASES[icon]) {
        return toElementIcon(EP_ICON_ALIASES[icon])
      }
      if (icon.startsWith('ep:')) {
        return toElementIcon(resolveElementIconName(getIconifyName(icon)))
      }
      if (isIconifyName(icon)) {
        return toElementIcon(resolveElementIconName(getIconifyName(icon)))
      }
      return ''
    }
  }
}
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.svg-external-icon {
  background-color: currentColor;
  mask-size: cover!important;
  display: inline-block;
}

.element-icon {
  display: inline-block;
  text-align: center;
}
</style>
