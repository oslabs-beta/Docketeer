import { EventEmitter } from 'stream';

const Event = require('events');
const store = require('../../renderer/store.js');
// import updateSession from '../login/login.js'
// import start from './notificationsRequester.js'
// let StoreState = store.getState()

const MemThreshold = new Event;
// const ProcessingThreshold = new Event


// if(StoreState.containersList.runningList[0].memUsage  > start.checkForNotifications.state.session.cpu_threshold
// || StoreState.containerList.runningList[0].CPUperc > StoreState.session.mem-threshold)
// updateSession();
// setInterval(()=>{
//     StoreState = store.getState()
// console.log(StoreState, 'Jesus Fucking Christ (CURR STATE)')
//  console.log('(CPU notifications list) This is the container list, which needs to be accessed or else!', StoreState.notificationList.cpuNotificationList);
//  console.log('Whaaa, first item in the runninglist', StoreState.containersList.runningList[0]);
// //  console.log('dookie CPU proc', StoreState.containersList.CPUPerc[0]);
// }, 15000)


// const processingCurrentUsage = StoreState.
// const memCurrentUsage = StoreState.

function memAndProcessThresholdEvent(){
  const StoreState = store.getState();
  console.log('this is state', StoreState);
  for(let i = 0; i < StoreState.containersList.runningList.length; i++){

    const currentMemUsage = StoreState.containersList.runningList[i].MemPerc; 

    const currentCPUUsage =  StoreState.containersList.runningList[i].CPUPerc; 

    const cpuThreshold = StoreState.session.mem_threshold;

    const memThreshold = StoreState.session.mem_threshold;

    const username = StoreState.session.username;

    const email = StoreState.session.email;

    const containerName  = StoreState.containersList.runningList[i].Name;
    
    const reqObject = {
         
      username: [`${username}`],
      email: [`${email}`],
      containerName: [`${containerName}`],
      ProcessingUsage: [`${currentCPUUsage}` / (`${cpuThreshold}` + '%')],
      MemoryUsage: [`${currentMemUsage}` / (`${memThreshold}` + '%')]
    };
    // console.log('THIS IS A FUGGIN CPU THREHOLD', `${cpuThreshold}` + '%')

    // console.log('THIS IS A FUGGIN MEM THREHOLD', `${memThreshold}` + '%')

    // console.log('CurrMem', currentMemUsage);

    // console.log('THE ONE LOG TO END ALL LOGS (First value is curr CPU USAGE, Second is cpuThreshold)', currentCPUUsage, `${cpuThreshold}` + '%')

    // console.log('THE OTHER LOG AROUND MEMORY AND SHIT(first is current mem, second is mem threshold', currentMemUsage, `${memThreshold}` + '%')
 
 
    // console.log('This is the username', username)

    // console.log('This is the email', email)

    console.log('This is the container name', containerName);
 
  
  
    //  let usrName = 
    //  let email =

    console.log('currentMemUsage', currentMemUsage);

    console.log('currentCPUUSage', currentCPUUsage);
    console.log(reqObject, 'doooot');
    return reqObject;
  }
  //   console.log('userCPUThreshold, accessing NotificationsRequester', userCPUThreshold)
  //   console.log('userMemThreshold, accessing NotificationsRequester', userMemThreshold)


  // 'Memory being used:' `${}`,



}

MemThreshold.on('Memory-Usage', thresholdBreach); // creates an Event called MemThreshold tied to the memAndProcessThresholdEvent function

// ProcessingThreshold.on('Process-Usage', processingTotAndUse)

MemThreshold.emit(onchange, 'Memory-Usage');

// ProcessingThreshold.emit('Process-Usage');


function thresholdBreach(){
  fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
  })
    .then((res)=>{ 

      return res.json();})

    .then((events)=>{

      events
      // .slice(0,3)
        .forEach((event)=>{ memAndProcessThresholdEvent(event);
        
        });
    })
    .catch((err)=>{
      console.log('error found', err);
        
    });

}

// console.log('first is thresholdBreach function, second is req.body', thresholdBreach, threholdBreach.req.body)

// add event emitter for on change <<<<<<<<<<<<<****


//  app.post('/api', function (req, res) {
//  
//   reqObject=req.body
//   console.log('look over here PENDEJO', req.body)
 
// }).then((res)=> res.json());
  
// app.listen(PORT, function(err){
//     if (err) console.log(err);
//     console.log("Server listening on PORT", PORT);
// });
// }

// return fetch('/API', {
//     method: 'POST',
//     headers: { 
//         'Content-Type': 'application/json'
//     }
//   }
// )
// .then((res)=>{
//     if(currentCPUUsage > (`${cpuThreshold}` + '%') || currentMemUsage> (`${memThreshold}` + '%') ){
//      //assign req body {}
//     //  document.write(email, username, containerName)=res.body
//      res.json()
// }})



// function sendNotification(){
// if(currentCPUUsage > (`${cpuThreshold}` + '%') || currentMemUsage> (`${memThreshold}` + '%') ){

// return (fetch('/API', {
//     method: 'POST',
//     headers: { 
//         'Content-Type': 'application/json'
//     }
// }).then(res => {
//     // =res.body

// res.json()
//     }),
// }
// }

setInterval(()=>{
//     // memAndProcessThresholdEvent()
  console.log(thresholdBreach());
}, 36000);
// console.log(thresholdBreach())
export default thresholdBreach;
