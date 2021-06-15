import * as types from '../constants/actionTypes';

const initialState = {
  name: '',
  email: '',
  phone: '',
  role: '',
  role_id: '',
  contact_pref: '',
  mem_threshold: '',
  cpu_threshold: '',
  container_stops: false,
  isSysAdmin: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
  case types.UPDATE_ALL: {
    return; 
  }
  case types.UPDATE_NAME: {
    return;
  }
  case types.UPDATE_EMAIL: {
    return;
  }
  case types.UPDATE_PHONE: {
    return;
  }
  case types.UPDATE_ROLE: {
    return;
  }
  case types.UPDATE_CONTACT_PREF: {
    return;
  }
  case types.UPDATE_MEM_THRESHOLD: {
    return;
  }
  case types.UPDATE_CPU_THRESHOLD: {
    return;
  }
  case types.UPDATE_CONTAINER_STOPS: {
    return;
  }
  default:
    return state;
  }
}