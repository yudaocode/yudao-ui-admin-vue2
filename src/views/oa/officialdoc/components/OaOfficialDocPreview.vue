<template>
  <article class="oa-official-doc-preview">
    <h1 class="preview-header" :style="{ fontSize: (template && template.fontSize || 36) + 'px' }">
      {{ template && template.authorityName }}
    </h1>
    <p
      class="preview-no"
      v-text="
        (document.noPrefix || '') +
          (document.year ? '〔' + document.year + '〕' : '') +
          (document.sequence == null ? '' : document.sequence + '号')
      "
    ></p>
    <hr
      class="preview-separator"
      :class="
        template && template.separatorType === OaOfficialDocSeparatorType.DOUBLE
          ? 'preview-separator--double'
          : 'preview-separator--single'
      "
    />
    <h2 class="preview-title">{{ document.title }}</h2>
    <div v-html="document.content || ''" class="preview-content"></div>
    <div class="preview-footer">
      <img
        v-if="template && template.sealPicUrl"
        :src="template.sealPicUrl"
        alt="印章"
        class="preview-seal"
      />
      <p>{{ template && template.authorityName }}</p>
      <p>{{ document.issueTime ? formatDate(document.issueTime, 'YYYY年MM月DD日') : '' }}</p>
    </div>
  </article>
</template>

<script>
import { formatDate } from '@/utils/formatTime'
import { OaOfficialDocSeparatorType } from '@/views/oa/utils/constants'

export default {
  name: 'OaOfficialDocPreview',
  props: {
    document: {
      type: Object,
      default: () => ({})
    },
    template: {
      type: Object,
      default: undefined
    }
  },
  data() {
    return {
      OaOfficialDocSeparatorType
    }
  },
  methods: {
    formatDate
  }
}
</script>

<style scoped lang="scss">
.oa-official-doc-preview {
  padding: 32px 40px;
  color: #000;
  background: #fff;

  .preview-header {
    margin-bottom: 24px;
    font-weight: bold;
    color: #f56c6c;
    text-align: center;
  }

  .preview-no {
    text-align: center;
  }

  .preview-separator {
    margin: 24px 0;
    border-color: #f56c6c;

    &--single {
      border-top: 1px solid #f56c6c;
    }

    &--double {
      border-top: 4px double #f56c6c;
    }
  }

  .preview-title {
    margin-bottom: 24px;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
  }

  .preview-content {
    min-height: 280px;
    font-size: 18px;
    line-height: 2.25;
  }

  .preview-footer {
    margin-top: 24px;
    text-align: right;

    .preview-seal {
      width: 120px;
      margin-left: auto;
    }
  }
}
</style>
