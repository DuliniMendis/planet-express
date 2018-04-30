import * as React from 'react'

declare const WebKitMediaSource: any

class Video extends React.Component <IVideoProps, IVideoState> {

  private video: HTMLVideoElement | null

  constructor(props: IVideoProps) {
    super(props)
    this.state = {
      mediaSource: new MediaSource(),
      iChunk: 0,
      updated: false,
      buffer: [],
    }

  }

  componentWillReceiveProps(props: IVideoProps) {
    // if (this.props.currentTime !== props.currentTime) {
    //   if (this.video && props.chunks && Math.abs(props.currentTime - this.video.currentTime) >= 1) {
    // //     // this is for when you skip somewhere but the buffer already has those chunks
    //      this.video.currentTime = props.currentTime
    //    }
    // //   this.setState({ updated: false }, () => this.updateChunk(0))
    // }
    console.log(props.chunks)
    if (this.video) {
      if (props.isPlaying) {
        console.log('play')
        this.video.play()
      } else {
        this.video.pause()
      }
    }
    if (this.props.chunks !== props.chunks) {
      this.updateChunk(props.lastUpdatedChunk, props.chunks)
    }
  }

  componentDidMount() {
    if (this.video) {
      // this.Video.addEventListener('timeupdate', () => this.handleTimeUpdate(this.Video))
      this.video.src = window.URL.createObjectURL(this.state.mediaSource) // blob URL pointing to the MediaSource.
      this.video.addEventListener('timeupdate', (e: any) => this.handleTimeUpdate(e))
    }
    if (this.state.mediaSource.sourceBuffers.length === 0) {
      this.state.mediaSource.addEventListener('sourceopen', (e: any) => this.onSourceOpen(e), false)
    }
  }

  componentWillUnmount() {
    this.video = null
  }

  hasMediaSource() {
    return !!(MediaSource || WebKitMediaSource as MediaSource)
  }

  onSourceOpen(e: Event) {
    if (this.state.mediaSource.sourceBuffers.length === 0) {
      const mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
      const sourceBuffer = this.state.mediaSource.addSourceBuffer(mimeType)
      sourceBuffer.addEventListener('updateend', () => this.onUpdateEnd())

      sourceBuffer.mode = 'segment'
      this.state.mediaSource.duration = 110
      this.updateChunk(0, this.props.chunks)
    }
  }

  onUpdateEnd () {
    console.log('on update end')
    if (this.video) {
      if (this.video.error) {
        console.log(this.video.error)
      }
    }
    if (this.state.buffer.length > 0) {
      const buffer = this.state.buffer.map((b) => b)
      const chunk = buffer.shift()
      this.setState({ buffer }, () => {
        this.updateChunk(chunk.iChunk, this.props.chunks)
      })
    }
    console.log(this.state.mediaSource.sourceBuffers[0].updating)
    if (!this.state.mediaSource.sourceBuffers[0].updating) {
      // this.state.mediaSource.endOfStream()
    }
  }

  handleTimeUpdate (evt: any) {
    if (this.video) {
      console.log(this.video.currentTime, this.video.duration)
      // this.props.handleVideo(this.video.currentTime)
    }
  }

  async updateChunk (iChunk: number, chunks: any[]) {
    if (chunks[iChunk]) {
      console.log('video update chunk', iChunk)
      try {
        this.state.mediaSource.sourceBuffers[0].timestampOffset = iChunk * 10
        this.state.mediaSource.sourceBuffers[0].appendBuffer(chunks[iChunk])
        console.log('added chunk', iChunk)
      } catch {
        console.log('error when adding chunk', iChunk)
        const buffer = this.state.buffer.map((b) => b)
        buffer.push({
          iChunk,
          chunk: chunks[iChunk],
        })
        this.setState({ buffer })
      }
    }
 }

  render() {
    return (
      <div>
        <video
          width="480"
          ref={(ref) => {
            this.video = ref
          }}
          controls={true}
        />
      </div>
    )
  }
}

export interface IVideoProps {
  currentTime: number
  chunks: any[]
  chunkPeriod: number
  isPlaying: boolean
  lastUpdatedChunk: number
  handleVideo: (time: number) => void
}

export interface IVideoState {
  mediaSource: any
  iChunk: number
  updated: boolean
  buffer: any[]
}

export default Video
