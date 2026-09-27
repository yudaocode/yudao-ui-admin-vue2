import { getEmployeeBindStatus } from '@/api/hrm/portal/employee'

export const HRM_PORTAL_HOME_PATH = '/hrm/portal/home'
export const HRM_PORTAL_OPENING_GUIDE_PATH = '/hrm/portal/opening-guide'

export async function checkHrmPortalAccess(router) {
  try {
    const response = await getEmployeeBindStatus()
    if (response.data) {
      return true
    }
    await router.replace(HRM_PORTAL_OPENING_GUIDE_PATH)
    return false
  } catch (error) {
    return true
  }
}

export async function redirectBoundEmployeeFromOpeningGuide(router) {
  try {
    const response = await getEmployeeBindStatus()
    if (!response.data) {
      return false
    }
    await router.replace(HRM_PORTAL_HOME_PATH)
    return true
  } catch (error) {
    return false
  }
}
