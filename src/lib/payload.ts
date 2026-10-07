import config from '@payload-config'
import { getPayload } from 'payload'

/** Payload Local API cho Server Component và route phía server. */
export const getPayloadClient = () => getPayload({ config })
