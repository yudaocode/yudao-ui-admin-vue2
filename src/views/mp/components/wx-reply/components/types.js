const ReplyType = Object.freeze({
  News: 'news',
  Image: 'image',
  Voice: 'voice',
  Video: 'video',
  Music: 'music',
  Text: 'text'
})

const NewsType = Object.freeze({
  Published: '1',
  Draft: '2'
})

/** Keep only account/type when clearing the active reply tab. */
function createEmptyReply(old) {
  const source = old && Object.prototype.hasOwnProperty.call(old, 'value') ? old.value : old || {}
  return {
    accountId: source.accountId,
    type: source.type || ReplyType.Text,
    name: null,
    content: null,
    mediaId: null,
    url: null,
    title: null,
    description: null,
    thumbMediaId: null,
    thumbMediaUrl: null,
    musicUrl: null,
    hqMusicUrl: null,
    introduction: null,
    articles: []
  }
}

export { NewsType, ReplyType, createEmptyReply }
