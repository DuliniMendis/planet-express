import * as React from 'react'
import './App.css'
import { getChunk } from './dataRequests'
// import Timeline from './Timeline'
import Video from './Video'

const url = 'https://s3-ap-southeast-2.amazonaws.com/dulini-test/bunny'
const chunkPeriod = 10

class App extends React.Component<{}, IAppState> {

  constructor() {
    super({})
    this.state = {
      playerTime: 0,
      currentTime: 0,
      startTime: 0,
      endTime: chunkPeriod * 10,
      chunks: [],
      isPlaying: false,
      lastUpdatedChunk: 0,
    }
  }

  componentDidMount() {
    this.setup()
  }

  async setup() {
    const iChunk = Math.floor(this.state.currentTime / chunkPeriod)
    this.getChunk(iChunk)
  }

  // handleSlider (evt: any) {
  //   const time = evt.target.value
  //   this.setState({
  //     currentTime: time,
  //     playerTime: time,
  //   }, () => {
  //     this.updateChunks(time)
  //   })
  // }

  handleVideo (time: number) {
   this.setState({ playerTime: time })
 }

  // async updateChunks(time: number) {
  //   const iChunk = Math.floor(time / chunkPeriod)
  //   if (!this.state.chunks[iChunk]) {
  //     this.setState({
  //       currentTime: time,
  //       playerTime: time,
  //       lastUpdatedChunk: iChunk,
  //     }, () => {
  //       if (iChunk < 10) {
  //         this.getChunk(iChunk)
  //       }
  //     })
  //   }
  // }

  async getChunk(iChunk: number) {
    const chunk = await getChunk(`${url}${iChunk}.mp4`)
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

  // togglePlay() {
  //   this.setState({ isPlaying: !this.state.isPlaying })
  // }

  render() {

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Media Player</h1>
        </header>
        {this.state.chunks[0] && <Video
          currentTime={this.state.currentTime}
          chunks={this.state.chunks}
          chunkPeriod={chunkPeriod}
          isPlaying={this.state.isPlaying}
          lastUpdatedChunk={this.state.lastUpdatedChunk}
          handleVideo={(time: number) => this.handleVideo(time)}
        />}
        {/* <Timeline
          startTime={this.state.startTime}
          endTime={this.state.endTime}
          currentTime={this.state.playerTime}
          handleSlider={(evt: any) => this.handleSlider(evt)}
          togglePlay={() => this.togglePlay()}
        /> */}
      </div>
    )
  }
}

interface IAppState {
  playerTime: number
  currentTime: number
  startTime: number
  endTime: number
  chunks: any[]
  isPlaying: boolean
  lastUpdatedChunk: number
}

export default App
