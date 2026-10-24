<!-- 【微信消息 - 定位】 -->
<template>
  <div>
    <el-link
      type="primary"
      target="_blank"
      rel="noopener noreferrer"
      :href="mapUrl"
    >
      <el-col>
        <el-row v-if="point">
          <MapView
            :longitude="point.longitude"
            :latitude="point.latitude"
            style="width: 250px; height: 180px; pointer-events: none"
          />
        </el-row>
        <el-row>
          <i class="el-icon-map-location" />{{ label }}
        </el-row>
      </el-col>
    </el-link>
  </div>
</template>

<script>
import { gcj02ToBd09, MapView, toMapCoordinate } from '@/components/Map'

export default {
  name: 'WxLocation',
  components: { MapView },
  props: {
    locationX: {
      required: true,
      type: Number
    },
    locationY: {
      required: true,
      type: Number
    },
    label: {
      required: true,
      type: String
    }
  },
  computed: {
    point() {
      const coordinate = toMapCoordinate(this.locationY, this.locationX)
      return coordinate ? gcj02ToBd09(coordinate.longitude, coordinate.latitude) : undefined
    },
    mapUrl() {
      if (!this.point) return undefined
      const params = new URLSearchParams({
        location: `${this.point.latitude},${this.point.longitude}`,
        title: this.label || '位置',
        content: this.label || '',
        output: 'html',
        coord_type: 'bd09ll',
        src: 'webapp.yudao.admin'
      })
      return `https://api.map.baidu.com/marker?${params.toString()}`
    }
  }
}
</script>
