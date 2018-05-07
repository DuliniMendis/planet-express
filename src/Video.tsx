import * as React from 'react'

class Video extends React.Component <IVideoProps, IVideoState> {

  private video: HTMLVideoElement | null
  private mediaSource: any

  constructor(props: IVideoProps) {
    super(props)
    this.state = {
      unappendedChunks: [], // for keeping chunks that still need to be appended
    }
  }

  componentDidMount() {
    if (this.video) {
      this.mediaSource = new MediaSource() // make  a new media source
      this.video.src = window.URL.createObjectURL(this.mediaSource) // blob URL pointing to the MediaSource.

      // add event listeners
      this.video.addEventListener('play', () => this.props.togglePlay())
      this.video.addEventListener('pause', () => this.props.togglePlay())
      this.video.addEventListener('seeking', (e: any) => this.handleSeeking(e))
    }
    this.mediaSource.addEventListener('sourceopen', (e: any) => this.onSourceOpen(e), false)
  }

  componentWillReceiveProps(props: IVideoProps) {
    if (this.video) {
      if (props.isPlaying) { // toggle play and pause
        this.video.play()
      } else {
        this.video.pause()
      }
    }
    if (this.props.chunks !== props.chunks) { // if there are new chunks, update the sourceBuffer
      this.updateChunk(props.lastUpdatedChunk, props.chunks)
    }
  }

  onSourceOpen(e: Event) {
    if (this.mediaSource.sourceBuffers.length === 0) {
      // add a source buffer with a specific MIME type
      const mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
      const sourceBuffer = this.mediaSource.addSourceBuffer(mimeType)
      sourceBuffer.mode = 'segments' // for add chunks at specific time offsets

      // add event listeners
      sourceBuffer.addEventListener('updateend', () => this.onUpdateEnd())

      // add a duration to the media source
      this.mediaSource.duration = this.props.duration

      this.updateChunk(0, this.props.chunks)
    }
  }

  onUpdateEnd () {
    console.log('on update end')
    // add leftover chunks in the unappendedChunks list
    if (this.state.unappendedChunks.length > 0) {
      const unappendedChunks = this.state.unappendedChunks.map((b) => b)
      const chunk = unappendedChunks.shift()
      this.setState({ unappendedChunks }, () => {
        this.updateChunk(chunk.iChunk, this.props.chunks)
      })
    }
  }

  async updateChunk (iChunk: number, chunks: any[]) {
    if (chunks[iChunk]) {
      console.log('updating chunk', iChunk)
      try {
        // add chunk at specific time offset
        this.mediaSource.sourceBuffers[0].timestampOffset = iChunk * this.props.chunkPeriod
        this.mediaSource.sourceBuffers[0].appendBuffer(chunks[iChunk])
        console.log('added chunk', iChunk)
      } catch {
        // add chunks with errors to the unappendedChunks list
        console.log('error while adding chunk', iChunk)
        const unappendedChunk = {
          iChunk,
          chunk: chunks[iChunk],
        }
        this.setState({ unappendedChunks: [...this.state.unappendedChunks, unappendedChunk] })
      }
    }
 }

 handleSeeking(e: any) {
   if (this.video) {
     console.log('seeking', this.video.currentTime)
     this.props.handleSkip(this.video.currentTime) // request the chunk at this time
   }
 }

  render() {
    return (
      <div>
        <video
          id="video"
          ref={(ref) => { // create a reference to the video element
            this.video = ref
          }}
          controls={true}
        />
      </div>
    )
  }
}

export interface IVideoProps {
  chunks: any[]
  chunkPeriod: number
  duration: number
  isPlaying: boolean
  lastUpdatedChunk: number
  handleSkip: (iChunk: number) => void
  togglePlay: () => void
}

export interface IVideoState {
  unappendedChunks: any[]
}

export default Video
