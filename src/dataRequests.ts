export const getChunk = (url: string) => (
  fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText)
    } else if (!response.body) {
      throw new Error('No valid response body found')
    } else {
      const reader = response.body.getReader()
      return readStream(reader)
    }
  })
)

export const readStream = async (reader: any, data: any = new Uint8Array(0)): Promise<any> => {
  const { done, value } = await reader.read()
  if (done) {
    return data
  } else {
    const newArr = new Uint8Array(data.length + value.length)
    newArr.set(data)
    newArr.set(value, data.length)
    return await readStream(reader, newArr)
  }
}
