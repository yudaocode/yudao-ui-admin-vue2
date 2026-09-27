<template>
  <div
    v-if="normalizedValue"
    :aria-label="label"
    style="position: absolute; top: 0; right: 0; text-align: center"
  >
    <div style="height: 40px; line-height: 0; white-space: nowrap">
      <span
        v-for="(bar, index) in bars"
        :key="index"
        :style="barStyle(bar, index)"
      />
    </div>
    <div style="font-size: 11px; letter-spacing: 1px; line-height: 16px">
      {{ normalizedValue }}
    </div>
  </div>
</template>

<script>
// Code 39 uses nine alternating bars/spaces plus a narrow inter-character gap.
const CODE39 = {
  0: 'nnnwwnwnn', 1: 'wnnwnnnnw', 2: 'nnwwnnnnw', 3: 'wnwwnnnnn',
  4: 'nnnwwnnnw', 5: 'wnnwwnnnn', 6: 'nnwwwnnnn', 7: 'nnnwnnwnw',
  8: 'wnnwnnwnn', 9: 'nnwwnnwnn', A: 'wnnnnwnnw', B: 'nnwnnwnnw',
  C: 'wnwnnwnnn', D: 'nnnnwwnnw', E: 'wnnnwwnnn', F: 'nnwnwwnnn',
  G: 'nnnnnwwnw', H: 'wnnnnwwnn', I: 'nnwnnwwnn', J: 'nnnnwwwnn',
  K: 'wnnnnnnww', L: 'nnwnnnnww', M: 'wnwnnnnwn', N: 'nnnnwnnww',
  O: 'wnnnwnnwn', P: 'nnwnwnnwn', Q: 'nnnnnnwww', R: 'wnnnnnwwn',
  S: 'nnwnnnwwn', T: 'nnnnwnwwn', U: 'wwnnnnnnw', V: 'nwwnnnnnw',
  W: 'wwwnnnnnn', X: 'nwnnwnnnw', Y: 'wwnnwnnnn', Z: 'nwwnwnnnn',
  '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn',
  '$': 'nwnwnwnnn', '/': 'nwnwnnnwn', '+': 'nwnnnwnwn',
  '%': 'nnnwnwnwn', '*': 'nwnnwnwnn'
}

export default {
  name: 'WmsOrderBarcode',
  props: {
    value: { type: [String, Number], default: '' },
    label: { type: String, default: '单据编号条码' }
  },
  computed: {
    normalizedValue() {
      return String(this.value || '').toUpperCase()
    },
    bars() {
      if (!this.normalizedValue) return []
      const result = []
      const symbols = `*${this.normalizedValue}*`
      if (symbols.split('').some((symbol) => !CODE39[symbol])) return []
      symbols.split('').forEach((symbol, symbolIndex) => {
        const pattern = CODE39[symbol]
        pattern.split('').forEach((width, index) => {
          result.push(width === 'w' ? 2 : 1)
          if (index < pattern.length - 1) result.push(1)
        })
        if (symbolIndex < symbols.length - 1) result.push(1)
      })
      return result
    }
  },
  methods: {
    barStyle(width, index) {
      return {
        display: 'inline-block',
        width: width * 2 + 'px',
        height: '40px',
        verticalAlign: 'top',
        backgroundColor: index % 2 === 0 ? '#000' : 'transparent'
      }
    }
  }
}
</script>
