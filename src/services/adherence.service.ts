import {
  AdherenceWeeklyReport,
  EventStreamAdherenceReport,
} from '@typedefs/types'
import Utility from '../helpers/utility'
import constants from '../types/constants'
import ParticipantService from './participants.service'

export const COMPLIANCE_THRESHOLD = 50

async function getAdherenceForWeekForUsers(
  studyId: string,
  userIds: string[],
  token: string
): Promise<AdherenceWeeklyReport[]> {
  const weeklyPromises = userIds.map(userId => {
    const endpoint = constants.endpoints.adherenceUserWeekly
      .replace(':studyId', studyId)
      .replace(':userId', userId)
    return Utility.callEndpoint<any>(endpoint, 'GET', {}, token)
  })

  const result = (await Promise.all(weeklyPromises)).map(result => result.data)

  return result
}

async function getAdherenceForWeek(
  studyId: string,

  token: string
): Promise<AdherenceWeeklyReport[]> {
  console.log('startint prime')
  const enr = await ParticipantService.getEnrollmentByEnrollmentType(
    studyId,
    token!,
    'enrolled',
    true
  )

  /* ALINA TODO: remove when batched report is done -- priming */
  const ids = enr.items.map(p => p.participant.identifier)
  const prime = await getAdherenceForWeekForUsers(studyId, ids, token)
  console.log('starting all')
  /* end of priming */

  const endpoint = constants.endpoints.adherenceWeekly.replace(
    ':studyId',
    studyId
  )

  const result = await Utility.callEndpoint<any>(endpoint, 'GET', {}, token)
  console.log(result.data)
  return result.data.items
}

async function getAdherenceForParticipant(
  studyId: string,
  userId: string,
  token: string
): Promise<EventStreamAdherenceReport> {
  console.log('getting particiapnt')
  const endpoint = constants.endpoints.adherenceDetail
    .replace(':studyId', studyId)
    .replace(':userId', userId)
  const result = await Utility.callEndpoint<any>(endpoint, 'GET', {}, token)
  return result.data
}

const AdherenceService = {
  getAdherenceForParticipant,
  getAdherenceForWeek,
  getAdherenceForWeekForUsers,
  COMPLIANCE_THRESHOLD,
}

export default AdherenceService
