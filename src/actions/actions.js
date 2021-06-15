import * as types from '../constants/actionTypes';

export const addRunningContainers = (data) => ({
  type: types.ADD_RUNNING_CONTAINERS,
  payload: data,
});

export const removeContainer = (id) => ({
  type: types.REMOVE_CONTAINER,
  payload: id,
});

export const stopRunningContainer = (id) => ({
  type: types.STOP_RUNNING_CONTAINER,
  payload: id,
});

export const addStoppedContainers = (data) => ({
  type: types.ADD_STOPPED_CONTAINERS,
  payload: data,
});

export const runStoppedContainer = (id) => ({
  type: types.RUN_STOPPED_CONTAINER,
  payload: id,
});

export const getImages = (data) => ({
  type: types.GET_IMAGES,
  payload: data,
});

export const runImage = (id) => ({
  type: types.RUN_IMAGE,
  payload: id,
});

export const removeImage = (id) => ({
  type: types.REMOVE_IMAGE,
  payload: id,
});

export const refreshRunningContainers = (data) => ({
  type: types.REFRESH_RUNNING_CONTAINERS,
  payload: data,
});

export const refreshStoppedContainers = (data) => ({
  type: types.REFRESH_STOPPED_CONTAINERS,
  payload: data,
});

export const refreshImages = (data) => ({
  type: types.REFRESH_IMAGES,
  payload: data,
});

export const composeymlFiles = (data) => ({
  type: types.COMPOSE_YML_FILES,
  payload: data,
});

export const getNetworkContainers = (data) => ({
  type: types.GET_NETWORK_CONTAINERS,
  payload: data,
});

export const getContainerStacks = (data) => ({
  type: types.GET_CONTAINER_STACKS,
  payload: data,
});

export const composeDown = (data) => ({
  type: types.COMPOSE_DOWN,
  payload: data,
});

export const composeUp = (data) => ({
  type: types.COMPOSE_UP,
  payload: data,
});

export const buildAxis = (data) => ({
  type: types.BUILD_AXIS,
  payload: data,
});

export const buildMemory = (data) => ({
  type: types.BUILD_MEMORY,
  payload: data,
});

export const buildCpu = (data) => ({
  type: types.BUILD_CPU,
  payload: data,
});

export const addPhoneNumber = (data) => ({
  type: types.ADD_PHONE_NUMBER,
  payload: data,
});

export const addMemoryNotificationSetting = (data) => ({
  type: types.ADD_MEMORY_NOTIFICATION_SETTING,
  payload: data,
});

export const addCpuNotificationSetting = (data) => ({
  type: types.ADD_CPU_NOTIFICATION_SETTING,
  payload: data,
});

export const addStoppedNotificationSetting = (data) => ({
  type: types.ADD_STOPPED_NOTIFICATION_SETTING,
  payload: data,
});

export const removeMemoryNotificationSetting = (data) => ({
  type: types.REMOVE_MEMORY_NOTIFICATION_SETTING,
  payload: data,
});

export const removeCpuNotificationSetting = (data) => ({
  type: types.REMOVE_CPU_NOTIFICATION_SETTING,
  payload: data,
});

export const removeStoppedNotificationSetting = (data) => ({
  type: types.REMOVE_STOPPED_NOTIFICATION_SETTING,
  payload: data,
});

export const addNotificationFrequency = (data) => ({
  type: types.NOTIFICATION_FREQUENCY,
  payload: data,
});

export const addMonitoringFrequency = (data) => ({
  type: types.MONITORING_FREQUENCY,
  payload: data,
});

export const updateSession = () => ({
  type: types.UPDATE_SESSION,
});

export const updateUser = (data) => ({
  type: types.UPDATE_USER,
  payload: data,
});

export const logoutUser = (data) => ({
  type: types.LOGOUT_USER,
  payload: data,
});