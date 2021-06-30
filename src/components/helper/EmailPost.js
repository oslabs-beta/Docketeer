import { ipcRenderer } from 'electron';
 
 
// I realize now line 6 & 7 are typically at the bottom of index.js
 
ipcMain.handle('Memory-Usage', async (_, emailBody) => {
  const { email, triggeringEvent } = args;
  const result = await thresholdBreach(email, triggeringEvent);
  return result;
});
    

// const { mobileNumber, triggeringEvent } = args;
// return await postEvent(mobileNumber, triggeringEvent);
// });




function thresholdBreach(email){
  fetch('/', {
    method: 'POST',
    body:JSON.stringify(email),
    headers: {
      'Content-Type': 'application/json'
    },
  })
    .then((res)=>{ 
  
      return res.json();})
  
    .then((events)=>{

    })
    .catch((err)=>{
      console.log('error found', err);
          
    });
  
}