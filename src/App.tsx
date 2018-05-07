import * as React from 'react'
import './App.css'
import { getChunk } from './dataRequests'
import Video from './Video'

const url = 'https://s3-ap-southeast-2.amazonaws.com/dulini-test/bunny'
const chunkPeriod = 10 // seconds
const duration = 110 // seconds

class App extends React.Component<IAppProps, IAppState> {

  constructor(props: IAppProps) {
    super(props)
    this.state = {
      chunks: [], // array of video chunks
      isPlaying: false,
      lastUpdatedChunk: 0,
      skip: false, // variable to keep track of progressive downloads and user-requested downloads
    }
  }

  componentDidMount() {
    this.getChunk(0)
  }

  // when the user requests a chunk at specific time
  handleSkip(time: number) {
    const iChunk = Math.floor(time / chunkPeriod)
    this.setState({ skip: true }, () => {
      this.getChunk(iChunk)
    })
  }

  async getChunk(iChunk: number) {
    if (!this.state.chunks[iChunk]) { // only fetch if not already in state

      const chunk = await getChunk(`${url}${iChunk}.mp4`)

      if (this.state.skip && this.state.lastUpdatedChunk !== iChunk - 1) { // if it's a skip request
        // turn off skip and update chunk array
        console.log('skip to time and update')
        const newChunks = this.state.chunks.map((c) => c)
        newChunks[iChunk] = chunk
        this.setState({
          chunks: newChunks,
          lastUpdatedChunk: iChunk,
          skip: false,
        }, () => {
          if (iChunk < 10) {
            this.getChunk(iChunk + 1)
          }
        })
      }
      if (
        (!this.state.skip && this.state.lastUpdatedChunk === iChunk - 1 ) || // if it's progressive downloading
        (this.state.lastUpdatedChunk === 0) // or if it's the very first chunk
      ) {
        // just update the chunk array
        console.log('progressive update')
        const newChunks = this.state.chunks.map((c) => c)
        newChunks[iChunk] = chunk
        this.setState({
          chunks: newChunks,
          lastUpdatedChunk: iChunk,
        }, () => {
          if (iChunk < 10) {
            this.getChunk(iChunk + 1)
          }
        })
      }
    }
  }

  // toggle play and pause
  togglePlay() {
    this.setState({ isPlaying: !this.state.isPlaying })
  }

  render() {
    return (
      <div className="App">
        <img id="tv" src="tvFrame.png"/>
        <Video
          chunks={this.state.chunks}
          chunkPeriod={chunkPeriod}
          duration={duration}
          isPlaying={this.state.isPlaying}
          lastUpdatedChunk={this.state.lastUpdatedChunk}
          handleSkip={(iChunk: number) => this.handleSkip(iChunk)}
          togglePlay={() => this.togglePlay()}
        />
      </div>
    )
  }
}

interface IAppState {
  chunks: any[]
  isPlaying: boolean
  lastUpdatedChunk: number
  skip: boolean
}

interface IAppProps {
}

export default App
