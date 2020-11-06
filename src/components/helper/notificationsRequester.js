/* eslint-disable implicit-arrow-linebreak */
import store from '../../renderer/store';
import * as categories from '../../constants/notificationCategories';

// object that holds what notifications have been sent
const sentNotifications = {};
let state;

/**
 * The amount of seconds to wait before resend notification
 * when container problem has not been addressed
 */
const RESEND_INTERVAL = 60; // seconds

const getTargetStat = (containerObject, notificationSettingType) => {
  if (notificationSettingType === categories.MEMORY)
    return parseFloat(containerObject.mp.replace('%', ''));
  if (notificationSettingType === categories.CPU)
    return parseFloat(containerObject.cpu.replace('%', ''));
  if (notificationSettingType === categories.STOPPED) return 1;
};

const getContainerObject = (containerList, containerId) => {
  for (let i = 0; i < containerList.length; i += 1) {
    const containerObject = containerList[i];
    if (containerObject.cid === containerId) return containerObject;
  }
  // container not present in container list (ex: running or stopped lists)
  return undefined;
};

const isContainerInSentNotifications = (notificationType, containerId) => {
  if (sentNotifications[notificationType]) {
    // return true if the notificationType key in sentNotification contains our containerId
    return Object.prototype.hasOwnProperty.call(
      sentNotifications[notificationType],
      containerId,
    );
  }
  // return false since container's notification category is not present
  return false;
};

const constructNotificationMessage = (
  notificationType,
  stat,
  triggeringValue,
  containerId,
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

// this function will make a request that will trigger a notification
const sendNotification = (
  notificationType,
  containerId,
  stat,
  triggeringValue,
) => {
  // request notification
  fetch('http://localhost:5000/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'Application/JSON',
    },
    body: JSON.stringify({
      mobileNumber: state.lists.phoneNumber,
      triggeringEvent: constructNotificationMessage(
        notificationType,
        stat,
        triggeringValue,
        containerId,
      ),
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Data from nofication service: ', data);
    })
    .catch((err) => console.log('send notification fetch ERROR: ', err));
};

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
  triggeringValue,
) => {
  // scan notification settings
  notificationSettingsSet.forEach((containerId) => {
    // check container metrics if it is seen in either runningList or stoppedList
    const containerObject = getContainerObject(containerList, containerId);
    if (containerObject) {
      // gets the stat/metric on the container that we want to test
      const stat = getTargetStat(containerObject, notificationType);
      // if the stat should trigger rule
      if (stat > triggeringValue) {
        // if the container is in sentNotifications object
        if (isContainerInSentNotifications(notificationType, containerId)) {
          // get the time from the sentNotifications object
          const notificationLastSent = getLatestNotificationDateTime(
            notificationType,
            containerId,
          );

          // calculate time between now and last notification sent time
          let spentTime = Math.floor(
            (Date.now() - notificationLastSent) / 1000,
          );

          // check if enough time (RESEND_INTERVAL) has passed since laster notification sent.
          if (spentTime > RESEND_INTERVAL) {
            // send nofication
            sendNotification(
              notificationType,
              containerId,
              stat,
              triggeringValue,
            );
            console.log(
              `** Notification SENT. ${notificationType} containerId: ${containerId} stat: ${stat} triggeringValue: ${triggeringValue} spentTime: ${spentTime}`,
            );
            console.log('sentNofications: ', sentNotifications);

            // update date.now in object that stores sent notifications
            sentNotifications[notificationType][containerId] = Date.now();
          } else {
            // resend interval not yet met
            console.log(
              `** Resend Interval Not Met. ${notificationType} is at ${stat}.\nLast sent notification time: ${notificationLastSent}`,
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
            `** Notification SENT. ${notificationType} containerId: ${containerId} stat: ${stat} triggeringValue: ${triggeringValue}`,
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
      state.lists.memoryNotificationList,
      categories.MEMORY,
      state.lists.runningList,
      80, // triggering value
    );
    // check if any containers register to cpu notification exceed triggering cpu value
    checkForNotifications(
      state.lists.cpuNotificationList,
      categories.CPU,
      state.lists.runningList,
      80, // triggering value
    );
    // check if any containers register to stopped notification trigger notification
    checkForNotifications(
      state.lists.stoppedNotificationList,
      categories.STOPPED,
      state.lists.stoppedList,
      0, // triggering value
    );
  }, 10000);
}
