<!-- 【微信消息 - 定位】 -->
<template>
  <div>
    <el-link
      type="primary"
      target="_blank"
      :href="mapUrl"
    >
      <el-col>
        <el-row>
          <img
            :src="staticMapUrl"
            alt="位置地图"
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
export default {
  name: 'WxLocation',
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
    },
    qqMapKey: {
      type: String,
      default: 'TVDBZ-TDILD-4ON4B-PFDZA-RNLKH-VVF6E'
    }
  },
  computed: {
    mapUrl() {
      return `https://map.qq.com/?type=marker&isopeninfowin=1&markertype=1&pointx=${this.locationY}&pointy=${this.locationX}&name=${encodeURIComponent(this.label)}&ref=yudao`
    },
    staticMapUrl() {
      return `https://apis.map.qq.com/ws/staticmap/v2/?zoom=10&markers=color:blue|label:A|${this.locationX},${this.locationY}&key=${encodeURIComponent(this.qqMapKey)}&size=250*180`
    }
  }
}
</script>
