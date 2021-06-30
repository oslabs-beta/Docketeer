/* eslint-disable implicit-arrow-linebreak */
import { ipcRenderer } from 'electron';
import store from '../../renderer/store';
import * as categories from '../../constants/notificationCategories';
import thresholdBreach from './EventEmitter.js';
// object that holds what notifications have been sent
const sentNotifications = {};
let state;


//I was onroute to implementing ipcRenderer, but a more traditional event emitter is imported on line 12, 13
//I believe I've implement ipcRenderer, but haven't checked it, likely some bugs.
//go to EmailPost.js to see routing of fetch request and ipcMain.handle logic (handling 
//the events emitted from ipcRenderer) see line 112-125 for more details


// const Event = require('events');
// const MemThreshold = new Event;

/**
 * The amount of seconds to wait before resend notification
 * when container problem has not been addressed
 */
const RESEND_INTERVAL = 60; /// /?////// seconds

const getTargetStat = (containerObject, notificationSettingType) => {
  if (notificationSettingType === categories.MEMORY)
    return parseFloat(containerObject.mp.replace('%', ''));
  if (notificationSettingType === categories.CPU)
    return parseFloat(containerObject.cpu.replace('%', ''));
  if (notificationSettingType === categories.STOPPED) return 1;
};

const getContainerObject = (containerList, containerId) => {
  // console.log('GET CONTAINER OBJECT: ', containerList, containerId);
  for (let i = 0; i < containerList.length; i += 1) {
    const containerObject = containerList[i];
    // console.log('containerObject: ', containerList[i]);
    // console.log('CID: ', containerObject.cid);
    console.log('ID: ', containerObject.ID);
    if (containerObject.cid === containerId) return containerObject;
  }
  // container not present in container list (ex: running or stopped notificationList)
  return undefined;
};

const isContainerInSentNotifications = (notificationType, containerId) => {
  if (sentNotifications[notificationType]) {
    // return true if the notificationType key in sentNotification contains our containerId
    return Object.prototype.hasOwnProperty.call(
      sentNotifications[notificationType],
      containerId
    );
  }
  // return false since container's notification category is not present
  return false;
};

const constructNotificationMessage = (
  notificationType,
  stat,
  triggeringValue,
  containerId
) => {
  let message = '';
  switch (notificationType) {
  case categories.STOPPED:
    message = `Container with ID of ${containerId} has stopped`;
    break;
  case categories.CPU || categories.MEMORY:
    message = `${notificationType} alert for container with ID of ${containerId}. Current Value: ${stat}; Alert Setting: ${triggeringValue}`;
    break;
  default:
    message = `${notificationType} alert for container with ID of ${containerId}. Current Value: ${stat}; Alert Setting: ${triggeringValue}`;
    break;
  }

  return message;
};

// notes below for a more traditional event emitter.
// //Creates an event called Memory-Usage and invokes the sendNotification function when an event is emitted.

// MemThreshold.on('Memory-Usage', sendNotification); 



// MemThreshold.emit(storeState.session.email, 'Memory-Usage');
// when the email is read in the state, memory usage will be emitted



// this function will make a request that will trigger a notification
const sendNotification = async (
  notificationType,
  containerId,
  stat,
  triggeringValue
) => {

  // adding current state
  const storeState = store.getState();
  // request notification
  const body = {
    mobileNumber: state.notificationList.phoneNumber,
    triggeringEvent: constructNotificationMessage(
      notificationType,
      stat,
      triggeringValue,
      containerId
    ),
  };
  if(storeState.session.email){
    const emailBody = {

      email: storeState.session.email,
      triggeringEvent: constructNotificationMessage(
        notificationType,
        stat,
        triggeringValue,
        containerId
      )
    };
    await ipcRenderer.invoke( 'Memory-Usage', emailBody );
  }
  
  
  // the first argument would be the name of the event handled in ipcMain.handle (line 124 )
  await ipcRenderer.invoke('post-event', body);
};



/// BELOW ARE NOTES ON THE ipcRenderer EVENT EMITTER FROM ELECTRON

// LINK IN ELECTRON DOCS FOR IPC RENDERER
// https://www.electronjs.org/docs/api/ipc-renderer


// EXAMPLE OF SYNTAX TAKEN FROM LINK ABOVE
// ipcRenderer.invoke('some-name', someArgument).then((result) => {
//   // ...
// })

// // Main process
// ipcMain.handle('some-name', async (event, someArgument) => {
//   const result = await doSomeWork(someArgument)
//   return result
// })



/**
 * Returns the DateTime the last notification was sent per notification type, per containerId
 * @param {String} notificationType
 * @param {String} containerId
 */
const getLatestNotificationDateTime = (notificationType, containerId) =>
  sentNotifications[notificationType][containerId];

/**
 * Checks to see if a notification should be sent based on notification container is subscribed to
 * @param {Set} notificationSettingsSet
 * @param {String} type
 * @param {Array} containerList
 */
const checkForNotifications = (
  notificationSettingsSet,
  notificationType,
  containerList,
  triggeringValue
) => {
  if(notificationType === 'MEMORY'){
    console.log('checkForNotifications: ', notificationType, ' ', triggeringValue);
    console.log(containerList, notificationType);
    console.log('notificationSettingsSet: ', notificationSettingsSet);
  }
  // scan notification settings
  notificationSettingsSet.forEach((containerId) => {
    // check container metrics if it is seen in either runningList or stoppedList
    const containerObject = getContainerObject(containerList, containerId);
    // console.log('CONTAINER OBJECT ', notificationType, containerObject);
    if (containerObject) {
      // gets the stat/metric on the container that we want to test
      const stat = getTargetStat(containerObject, notificationType);
      // if the stat should trigger rule
      // console.log('TRIGGER ALERT: ', stat, ' vs ', triggeringValue);
      if (stat > triggeringValue) {
        // if the container is in sentNotifications object
        if (isContainerInSentNotifications(notificationType, containerId)) {
          // get the time from the sentNotifications object
          const notificationLastSent = getLatestNotificationDateTime(
            notificationType,
            containerId
          );

          // calculate time between now and last notification sent time
          const spentTime = Math.floor(
            (Date.now() - notificationLastSent) / 1000
          );
          thresholdBreach();
          // check if enough time (RESEND_INTERVAL) has passed since laster notification sent.
          if (spentTime > RESEND_INTERVAL) {
            // send nofication
            sendNotification(
              notificationType,
              containerId,
              stat,
              triggeringValue
            );
            console.log(
              `** Notification SENT. ${notificationType} containerId: ${containerId} stat: ${stat} triggeringValue: ${triggeringValue} spentTime: ${spentTime}`
            );
            console.log('sentNofications: ', sentNotifications);

            // update date.now in object that stores sent notifications
            sentNotifications[notificationType][containerId] = Date.now();
          } else {
            // resend interval not yet met
            console.log(
              `** Resend Interval Not Met. ${notificationType} is at ${stat}.\nLast sent notification time: ${notificationLastSent}`
            );
          }
        } else {
          // Container not in sentNotifications.
          // Add it with time as now and send notification.
          if (sentNotifications[notificationType]) {
            sentNotifications[notificationType][containerId] = Date.now();
          } else {
            sentNotifications[notificationType] = { [containerId]: Date.now() };
          }
          console.log(
            `** Notification SENT. ${notificationType} containerId: ${containerId} stat: ${stat} triggeringValue: ${triggeringValue}`
          );
        }
      } else {
        // since metric is under threshold, remove container from sentNotifications if present
        // this reset
        if (isContainerInSentNotifications(notificationType, containerId)) {
          delete sentNotifications[notificationType][containerId];
        }
      }
    }
  });
};

export default function start() {
  setInterval(() => {
    // get current state
    state = store.getState();
    // check if any containers register to memory notification exceed triggering memory value
    checkForNotifications(
      state.notificationList.memoryNotificationList,
      categories.MEMORY,
      state.containersList.runningList,
      state.session.cpu_threshold // triggering value
    );
    // check if any containers register to cpu notification exceed triggering cpu value
    checkForNotifications(
      state.notificationList.cpuNotificationList,
      categories.CPU,
      state.containersList.runningList,
      state.session.mem_threshold // triggering value
    );
    // check if any containers register to stopped notification trigger notification
    checkForNotifications(
      state.notificationList.stoppedNotificationList,
      categories.STOPPED,
      state.containersList.stoppedList,
      0 // triggering value
    );
  }, 10000);
}
