import { mutate } from "./mutate";

export function mutateProvider(
  getContext,
  setContext,
  scheduleRender
) {
  return (
    context,
    path
  ) => mutate(
    getContext,
    setContext,
    scheduleRender,
    context,
    path
  )
}
