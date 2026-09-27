<template>
  <el-carousel
    :height="carouselHeight + 'px'"
    :autoplay="false"
    arrow="hover"
    indicator-position="outside"
  >
    <el-carousel-item v-for="(page, pageIndex) in pages" :key="pageIndex">
      <div class="menu-page">
        <div
          v-for="(item, index) in page"
          :key="index"
          class="menu-item"
          :style="{ width: columnWidth, height: rowHeight + 'px' }"
        >
          <div class="menu-icon-wrap">
            <span
              v-if="item.badge && item.badge.show"
              class="menu-badge"
              :style="{ color: item.badge.textColor, backgroundColor: item.badge.bgColor }"
            >
              {{ item.badge.text }}
            </span>
            <el-image v-if="item.iconUrl" :src="item.iconUrl" class="menu-icon" />
          </div>
          <span
            v-if="property.layout === 'iconText'"
            class="menu-title"
            :style="{ color: item.titleColor, height: titleHeight + 'px', lineHeight: titleHeight + 'px' }"
          >
            {{ item.title }}
          </span>
        </div>
      </div>
    </el-carousel-item>
  </el-carousel>
</template>

<script>
const TITLE_HEIGHT = 20
const ICON_SIZE = 32
const SPACE_Y = 16

export default {
  name: 'MenuSwiper',
  props: {
    property: { type: Object, required: true }
  },
  data() {
    return {
      titleHeight: TITLE_HEIGHT,
      pages: [],
      carouselHeight: 0,
      rowHeight: 0,
      columnWidth: ''
    }
  },
  watch: {
    property: {
      handler() {
        this.columnWidth = `${100 * (1 / this.property.column)}%`
        this.rowHeight =
          (this.property.layout === 'iconText' ? ICON_SIZE + TITLE_HEIGHT : ICON_SIZE) + SPACE_Y * 2
        this.carouselHeight = this.property.row * this.rowHeight

        const pageSize = this.property.row * this.property.column
        const pages = []
        let pageItems = []
        this.property.list.forEach(item => {
          if (pageItems.length === pageSize) pageItems = []
          if (pageItems.length === 0) pages.push(pageItems)
          pageItems.push(item)
        })
        this.pages = pages
      },
      immediate: true,
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-page {
  display: flex;
  flex-flow: row wrap;
}

.menu-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.menu-icon-wrap {
  position: relative;
  width: 32px;
  height: 32px;
}

.menu-icon {
  width: 100%;
  height: 100%;
}

.menu-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 1;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
}

.menu-title {
  font-size: 12px;
}

::v-deep .el-carousel__indicator {
  padding-top: 0;
  padding-bottom: 0;
}

::v-deep .el-carousel__indicator .el-carousel__button {
  width: 6px;
  height: 6px;
  border-radius: 6px;
}

::v-deep .el-carousel__indicator.is-active .el-carousel__button {
  width: 12px;
}
</style>
