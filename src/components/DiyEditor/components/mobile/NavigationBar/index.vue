<template>
  <div class="navigation-bar" :style="bgStyle">
    <div class="navigation-cells">
      <div v-for="(cell, cellIndex) in cellList" :key="cellIndex" :style="getCellStyle(cell)">
        <span v-if="cell.type === 'text'">{{ cell.text }}</span>
        <img v-else-if="cell.type === 'image'" :src="cell.imgUrl" alt="" class="cell-image" />
        <SearchBar v-else :property="getSearchProp(cell)" />
      </div>
    </div>
    <img
      v-if="property._local && property._local.previewMp"
      src="@/assets/imgs/diy/app-nav-bar-mp.svg"
      alt=""
      class="mp-capsule"
    />
  </div>
</template>

<script>
import SearchBar from '@/components/DiyEditor/components/mobile/SearchBar/index.vue'

export default {
  name: 'NavigationBar',
  components: { SearchBar },
  props: {
    property: { type: Object, required: true }
  },
  computed: {
    bgStyle() {
      const background =
        this.property.bgType === 'img' && this.property.bgImg
          ? `url(${this.property.bgImg}) no-repeat top center / 100% 100%`
          : this.property.bgColor
      return { background }
    },
    cellList() {
      return this.property._local && this.property._local.previewMp
        ? this.property.mpCells
        : this.property.otherCells
    },
    cellWidth() {
      return this.property._local && this.property._local.previewMp
        ? (375 - 80 - 86) / 6
        : (375 - 90) / 8
    }
  },
  methods: {
    getCellStyle(cell) {
      return {
        width: cell.width * this.cellWidth + (cell.width - 1) * 10 + 'px',
        left: cell.left * this.cellWidth + (cell.left + 1) * 10 + 'px',
        position: 'absolute'
      }
    },
    getSearchProp(cell) {
      return {
        height: 30,
        backgroundColor: cell.backgroundColor,
        showScan: cell.showScan,
        placeholder: cell.placeholder,
        borderRadius: cell.borderRadius,
        textColor: cell.textColor,
        placeholderPosition: cell.placeholderPosition,
        hotKeywords: []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.navigation-bar {
  position: relative;
  display: flex;
  height: 50px;
  padding: 0 6px;
  background: #fff;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.navigation-cells {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.cell-image {
  width: 100%;
  height: 100%;
}

.mp-capsule {
  width: 86px;
  height: 30px;
}
</style>
