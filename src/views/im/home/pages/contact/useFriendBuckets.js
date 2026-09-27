import { computed } from 'vue'

const getSortKey = friend => friend.displayNamePinyin || friend.nicknamePinyin || (friend.displayName || friend.nickname || '').toLowerCase()
const getBucketLetter = friend => {
  const first = getSortKey(friend).charAt(0)
  return /^[a-zA-Z]$/.test(first) ? first.toUpperCase() : '#'
}
const pinyinInitials = pinyin => (pinyin || '').split(' ').map(word => word.charAt(0)).join('')

export function useFriendBuckets(friends, keyword) {
  const filtered = computed(() => {
    const text = keyword.value.trim().toLowerCase()
    if (!text) return friends.value
    return friends.value.filter(friend => {
      const nicknamePinyin = friend.nicknamePinyin || ''
      const displayNamePinyin = friend.displayNamePinyin || ''
      return (friend.nickname || '').toLowerCase().includes(text) ||
        (friend.displayName || '').toLowerCase().includes(text) ||
        nicknamePinyin.replace(/\s/g, '').includes(text) ||
        displayNamePinyin.replace(/\s/g, '').includes(text) ||
        pinyinInitials(nicknamePinyin).includes(text) ||
        pinyinInitials(displayNamePinyin).includes(text)
    })
  })
  const buckets = computed(() => {
    const map = new Map()
    filtered.value.forEach(friend => {
      const letter = getBucketLetter(friend)
      if (!map.has(letter)) map.set(letter, [])
      map.get(letter).push(friend)
    })
    return Array.from(map.keys()).sort((a, b) => a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)).map(letter => ({
      letter,
      list: map.get(letter).sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)))
    }))
  })
  return { filtered, buckets }
}
