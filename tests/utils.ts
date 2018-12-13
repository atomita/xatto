export const delay = (time) => (new Promise((res) => setTimeout(res, time)))
export const minify = (strings) => strings[0].replace(/\s{2,}/g, '')
