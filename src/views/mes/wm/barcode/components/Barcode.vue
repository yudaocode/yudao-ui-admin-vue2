<!-- MES 二维码/一维码渲染 -->
<template><div
  v-loading="loading"
  class="barcode-wrap"
  :style="wrapStyle"
><qrcode-vue
  v-if="content && isQRCode"
  ref="qrcode"
  :value="content"
  :size="width"
  level="M"
  render-as="canvas"
/><canvas
  v-else-if="content"
  ref="linear"
  class="linear"
/><span v-else /></div></template>
<script>
/* eslint-disable vue/multi-word-component-names */
import QrcodeVue from 'qrcode.vue'
import { BarcodeFormatEnum } from '@/views/mes/utils/constants'

const EAN_L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
const EAN_G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111']
const EAN_R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100']
const EAN_PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL']
const CODE39 = {
  '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn', '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw', '8': 'wnnwnnwnn', '9': 'nnwwnnwnn',
  A: 'wnnnnwnnw', B: 'nnwnnwnnw', C: 'wnwnnwnnn', D: 'nnnnwwnnw', E: 'wnnnwwnnn', F: 'nnwnwwnnn', G: 'nnnnnwwnw', H: 'wnnnnwwnn', I: 'nnwnnwwnn', J: 'nnnnwwwnn',
  K: 'wnnnnnnww', L: 'nnwnnnnww', M: 'wnwnnnnwn', N: 'nnnnwnnww', O: 'wnnnwnnwn', P: 'nnwnwnnwn', Q: 'nnnnnnwww', R: 'wnnnnnwwn', S: 'nnwnnnwwn', T: 'nnnnwnwwn',
  U: 'wwnnnnnnw', V: 'nwwnnnnnw', W: 'wwwnnnnnn', X: 'nwnnwnnnw', Y: 'wwnnwnnnn', Z: 'nwwnwnnnn', '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '$': 'nwnwnwnnn', '/': 'nwnwnnnwn', '+': 'nwnnnwnwn', '%': 'nnnwnwnwn', '*': 'nwnnwnwnn'
}

export default {
  name: 'Barcode', components: { QrcodeVue },
  props: { content: { type: String, default: '' }, format: { type: Number, default: BarcodeFormatEnum.QR_CODE }, width: { type: Number, default: 200 }, height: { type: Number, default: 100 }, displayValue: { type: Boolean, default: true }},
  data() { return { loading: false } },
  computed: {
    isQRCode() { return this.format === BarcodeFormatEnum.QR_CODE },
    wrapStyle() { return { width: this.width + 'px', minHeight: (this.isQRCode ? this.width : this.height) + 'px' } }
  },
  watch: { content() { this.generateBarcode() }, format() { this.generateBarcode() }, width() { this.generateBarcode() }, height() { this.generateBarcode() } },
  mounted() { this.generateBarcode() },
  methods: {
    calculateChecksum(digits) { let sum = 0; for (let index = 0; index < digits.length; index += 1) sum += Number(digits[index]) * (index % 2 === 0 ? 1 : 3); return String((10 - sum % 10) % 10) },
    eanBits(source, upc) {
      let digits = String(source).replace(/\D/g, '')
      if (upc) digits = '0' + digits
      if (digits.length === 12) digits += this.calculateChecksum(digits)
      if (digits.length !== 13) throw new Error('EAN13/UPC-A 条码必须为 12 或 13 位数字')
      const parity = EAN_PARITY[Number(digits[0])]
      let bits = '101'
      for (let index = 1; index <= 6; index += 1) bits += parity[index - 1] === 'L' ? EAN_L[Number(digits[index])] : EAN_G[Number(digits[index])]
      bits += '01010'
      for (let index = 7; index <= 12; index += 1) bits += EAN_R[Number(digits[index])]
      return { bits: bits + '101', text: upc ? digits.slice(1) : digits }
    },
    code39Bits(source) {
      const text = String(source).toUpperCase()
      const encoded = '*' + text + '*'
      let bits = ''
      for (const character of encoded) {
        const pattern = CODE39[character]
        if (!pattern) throw new Error('CODE39 包含不支持的字符: ' + character)
        for (let index = 0; index < pattern.length; index += 1) bits += (index % 2 === 0 ? '1' : '0').repeat(pattern[index] === 'w' ? 3 : 1)
        bits += '0'
      }
      return { bits, text }
    },
    drawLinear() {
      const canvas = this.$refs.linear
      if (!canvas) return
      const encoded = this.format === BarcodeFormatEnum.CODE39 ? this.code39Bits(this.content) : this.eanBits(this.content, this.format === BarcodeFormatEnum.UPC_A)
      const ratio = window.devicePixelRatio || 1
      canvas.width = this.width * ratio
      canvas.height = this.height * ratio
      canvas.style.width = this.width + 'px'
      canvas.style.height = this.height + 'px'
      const context = canvas.getContext('2d')
      context.scale(ratio, ratio)
      context.fillStyle = '#fff'
      context.fillRect(0, 0, this.width, this.height)
      const margin = 10
      const textHeight = this.displayValue ? 20 : 0
      const barHeight = this.height - margin * 2 - textHeight
      const moduleWidth = (this.width - margin * 2) / encoded.bits.length
      context.fillStyle = '#000'
      for (let index = 0; index < encoded.bits.length; index += 1) if (encoded.bits[index] === '1') context.fillRect(margin + index * moduleWidth, margin, Math.max(moduleWidth, 1), barHeight)
      if (this.displayValue) { context.font = '14px Arial'; context.textAlign = 'center'; context.fillText(encoded.text, this.width / 2, this.height - 4) }
    },
    generateBarcode() {
      if (!this.content) return
      this.loading = true
      this.$nextTick(() => {
        try { if (!this.isQRCode) this.drawLinear(); const value = this.getImageBase64(); if (value) this.$emit('done', value) } catch (error) { console.error('生成条码失败:', error) } finally { this.loading = false }
      })
    },
    getImageBase64() {
      if (!this.isQRCode) return this.$refs.linear && this.$refs.linear.toDataURL ? this.$refs.linear.toDataURL() : ''
      const root = this.$refs.qrcode && this.$refs.qrcode.$el
      const canvas = root && root.tagName === 'CANVAS' ? root : root && root.querySelector && root.querySelector('canvas')
      return canvas && canvas.toDataURL ? canvas.toDataURL() : ''
    }
  }
}
</script>
<style scoped>.barcode-wrap { display: inline-block; text-align: center; }.linear { display: block; max-width: 100%; }</style>
