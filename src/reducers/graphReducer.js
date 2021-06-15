import * as types from '../constants/actionTypes';

const initialState = {
  graphAxis: [],
  graphMemory: [
    {
      label: '',
      data: [],
      fill: '',
    },
  ],
  graphCpu: [
    {
      label: '',
      data: [],
      fill: '',
    },
  ],
};

const graphReducer = (state = initialState, action) => {
  switch (action.type) {
  case types.BUILD_AXIS: {
    // console.log('action.payload build axis:', action.payload);
    if (action.payload === 'clear') return { ...state, graphAxis: [] };
    // cuts day of week from begingin and the timezone off the end.
    const formatedDate = action.payload.toString().slice(4, 24);
    // compare two string dates
    if (
      formatedDate > state.graphAxis[state.graphAxis.length - 1] ||
            !state.graphAxis.length
    ) {
      const newAxis = state.graphAxis;
      newAxis.push(formatedDate);
      return { ...state, graphAxis: newAxis };
    }
    return { ...state };
  }
  case types.BUILD_MEMORY: {
    if (action.payload === 'clear') return { ...state, graphMemory: [] };
    const newMemory = state.graphMemory.slice();
    newMemory.push(action.payload[0]);
    return { ...state, graphMemory: newMemory };
  }
  case types.BUILD_CPU: {
    if (action.payload === 'clear') return { ...state, graphCpu: [] };
    const newCpu = state.graphCpu.slice();
    newCpu.push(action.payload[0]);
    return { ...state, graphCpu: newCpu };
  }
  default:
    return state;
  }
};

export default graphReducer;
