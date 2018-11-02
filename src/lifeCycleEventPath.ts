import { PROPS } from './consts/vNodeAttributeNames'

export const lifeCycleEventPath = (name) => `${PROPS}.on${name}`
