import { ATTRIBUTES } from './consts/vNodeAttributeNames'

export const lifeCycleEventPath = (name) => `${ATTRIBUTES}.on${name}`
