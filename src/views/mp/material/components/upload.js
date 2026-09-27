import { getRefreshToken } from '@/utils/auth'
import { UploadType, useBeforeUpload } from '@/views/mp/hooks/useUpload'

const HEADERS = { Authorization: 'Bearer ' + getRefreshToken() }
const UPLOAD_URL = process.env.VUE_APP_BASE_API + '/admin-api/mp/material/upload-permanent'

const beforeImageUpload = (rawFile, notify) =>
  useBeforeUpload(UploadType.Image, 2, notify)(rawFile)

const beforeVoiceUpload = (rawFile, notify) =>
  useBeforeUpload(UploadType.Voice, 2, notify)(rawFile)

const beforeVideoUpload = (rawFile, notify) =>
  useBeforeUpload(UploadType.Video, 10, notify)(rawFile)

export {
  HEADERS,
  UPLOAD_URL,
  UploadType,
  beforeImageUpload,
  beforeVoiceUpload,
  beforeVideoUpload
}
