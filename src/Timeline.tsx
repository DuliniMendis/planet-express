import * as React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
`
const Slider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  box-sizing: border-box;
  height: 15px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
  left: -5px;
  &:hover {
    opacity: 0.6;
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 25px;
    height: 25px;
    background: ${(props: any) => props.color ? props.color : '#333'};
    cursor: pointer;
    border-radius: 25px;
  }
`

const TimeSlider = (props: ITimeSliderProps) => {
  const {
    startTime,
    endTime,
    currentTime,
    handleSlider,
  } = props
  return (
    <Container>
      <button onClick={() => props.togglePlay()}>Play</button>
      <Slider
        type="range"
        min={startTime}
        max={endTime}
        value={currentTime}
        onChange={(evt) => handleSlider(evt)}
      />
    </Container>
  )
}
export interface ITimeSliderProps {
  startTime: number
  endTime: number
  currentTime?: number
  handleSlider: (evt: any) => void
  togglePlay: () => void
}
export default TimeSlider
