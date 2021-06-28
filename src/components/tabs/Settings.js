/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';
import * as actions from '../../actions/actions';
import { ipcRenderer } from 'electron';
import PropTypes from 'prop-types';

// Material UI Imports
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import * as categories from '../../constants/notificationCategories';
import query from '../helper/psqlQuery';
import * as queryType from '../../constants/queryTypes';
import { makeStyles } from '@material-ui/core/styles';
import SendIcon from '@material-ui/icons/Send';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';

const mapDispatchToProps = (dispatch) => ({
  addPhoneNumber: (data) => dispatch(actions.addPhoneNumber(data)),
  addNotificationFrequency: (data) => dispatch(actions.addNotificationFrequency(data)),
  addMonitoringFrequency: (data) => dispatch(actions.addMonitoringFrequency(data)),
  addMemoryNotificationSetting: (data) => dispatch(actions.addMemoryNotificationSetting(data)),
  addCpuNotificationSetting: (data) => dispatch(actions.addCpuNotificationSetting(data)),
  addStoppedNotificationSetting: (data) => dispatch(actions.addStoppedNotificationSetting(data)),
  removeMemoryNotificationSetting: (data) => dispatch(actions.removeMemoryNotificationSetting(data)),
  removeCpuNotificationSetting: (data) => dispatch(actions.removeCpuNotificationSetting(data)),
  removeStoppedNotificationSetting: (data) => dispatch(actions.removeStoppedNotificationSetting(data)),
});

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      marginLeft: 5,
      marginBottom: 15,
      width: 220,
      verticalAlign: 'middle',
    },
  },
  button: {
    '& > *': {
      pointerEvents: 'none',
    },
    marginLeft: 5,
    width: 100,
    verticalAlign: 'top',
  },
  verifiedIcon: {
    verticalAlign: 'top',
    color: 'green',
  },
  description: {
    marginLeft: 5,
    marginBottom: 30,
  },
}));

// showVerificationInput IS USED FOR RENDERING THE VERIFICATION CODE COMPONENT
let showVerificationInput = false;
let isVerified = false;

const Settings = (props) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const classes = useStyles();

  // Similar to TypeScript, we can use propTypes to explicit declare a type for a prop. This enables type checking and allows for catching of bugs.
  // https://reactjs.org/docs/typechecking-with-proptypes.html
  Settings.propTypes = {
    addMonitoringFrequency: PropTypes.func.isRequired,
    addMemoryNotificationSetting: PropTypes.func.isRequired,
    addCpuNotificationSetting: PropTypes.func.isRequired,
    addStoppedNotificationSetting: PropTypes.func.isRequired,
    addPhoneNumber: PropTypes.func.isRequired,
    addNotificationFrequency: PropTypes.func.isRequired,
    runningList: PropTypes.array.isRequired,
    stoppedList: PropTypes.array.isRequired,
    memoryNotificationList: PropTypes.object.isRequired,
    cpuNotificationList: PropTypes.object.isRequired,
    stoppedNotificationList: PropTypes.object.isRequired,
  };

  // handle check
  // I couldve made this a single function where queryType gets passed in
  // but the query's parameters are not the same
  const handleCheckSetting = (containerId, containerName, metricName) => {
    // add to DB
    query(
      queryType.INSERT_CONTAINER,
      [containerId, containerName],
      (err, res) => {
        if (err) {
          console.log(`Error in INSERT_CONTAINER. Error: ${err}`);
        } else {
          // if all good, call fetchNotificationSettings
          fetchNotificationSettings();
          console.log('** INSERT_CONTAINER returned: **', res);
        }
      }
    );

    query(
      queryType.INSERT_CONTAINER_SETTING,
      [containerId, metricName.toLowerCase()],
      (err, res) => {
        if (err) {
          console.log(`Error in INSERT_CONTAINER_SETTING. Error: ${err}`);
        } else {
          // if all good, call fetchNotificationSettings
          fetchNotificationSettings();
          console.log('** INSERT_CONTAINER_SETTING returned: **', res);
        }
      }
    );
  };

  // handle uncheck
  // remove from DB
  const handleUnCheckSetting = (containerId, metricName) => {
    // add to DB
    query(
      queryType.DELETE_CONTAINER_SETTING,
      [containerId, metricName.toLowerCase()],
      (err, res) => {
        if (err) {
          console.log(`Error in DELETE_CONTAINER_SETTING. Error: ${err}`);
        } else {
          // if all good, call fetchNotificationSettings
          fetchNotificationSettings();
          console.log('** DELETE_CONTAINER_SETTING returned: **', res);
        }
      }
    );
  };

  const fetchNotificationSettings = () => {
    return query(queryType.GET_NOTIFICATION_SETTINGS, [], (err, res) => {
      if (err) {
        console.log(`Error getting settings. Error: ${err}`);
      } else {
        // find a way to set the three lists here
        // iterate through res.row
        // if the metric_name = "memory"
        const tempMemory = [];
        const tempCPU = [];
        const tempStopped = [];

        res.rows.forEach((el, i) => {
          switch (el.metric_name) {
          case categories.MEMORY.toLowerCase():
            tempMemory.push(el.container_id);
            break;
          case categories.CPU.toLowerCase():
            tempCPU.push(el.container_id);
            break;
          case categories.STOPPED.toLowerCase():
            tempStopped.push(el.container_id);
            break;
          default:
            break;
          }
        });

        // replace state with new data from database
        props.addMemoryNotificationSetting(tempMemory);
        props.addCpuNotificationSetting(tempCPU);
        props.addStoppedNotificationSetting(tempStopped);
      }
    });
  };

  const verifyMobileNumber = async () => {
    await ipcRenderer.invoke('verify-number', mobileNumber);
  };

  // fetch on component mount only because of empty dependency array
  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  /**
   * alerts if phone not entered on Test click
   */
  const handlePhoneNumberSubmit = () => {
    if (!mobileNumber) alert('Please enter phone number');
    else {
      // alert if input is not a number
      if (isNaN(Number(mobileNumber)))
        alert('Please enter phone number in numerical format. ex: 123456789');
      else {
        alert(`Phone: ${mobileNumber} is valid`);
        // ask SMS service for a verification code
        query(
          queryType.INSERT_USER,
          ['admin', mobileNumber, 5, 2],
          (err, res) => {
            if (err) {
              console.log(`Error in insert user. Error: ${err}`);
            } else {
              console.log(`*** Inserted ${res} into users table. ***`);
              props.addPhoneNumber(mobileNumber);
              showVerificationInput = true;
              // ask SMS service for a verification code
              verifyMobileNumber();
            }
          }
        );
      }
    }
  };

  // SAVING USER INPUTS: NOTIFICATION AND MEMORY CYCLE
  // 1. GET DATA FROM THE FORM
  // 2. MAKE SURE THAT IT HAS THE RIGHT FORMAT
  // 3. SEND IT TO DATABASE
  // 4. THEN UPDATE THE STATE
  const [tempNotifFreq, setTempNotifFreq] = useState('');
  const notificationFrequency = () => {
    // default value for Notification Frequency
    let frequency = 5;
    // alert if input is not a number
    if (isNaN(Number(tempNotifFreq)))
      alert('Please enter notification frequency in numerical format. ex: 15');
    else {
      if (tempNotifFreq) frequency = tempNotifFreq;
      query(
        queryType.INSERT_NOTIFICATION_FREQUENCY,
        // ['admin', , frequency, ,],
        ['admin', undefined, frequency, undefined, undefined],
        (err, res) => {
          if (err) {
            console.log(`INSERT_NOTIFICATION_FREQUENCY. Error: ${err}`);
          } else {
            console.log(`*** Inserted ${res} into users table. ***`);
            props.addNotificationFrequency(frequency);
          }
        }
      );
    }
  };

  const [tempMonitoringFrequency, setTempMonitoringFrequency] = useState('');
  const monitoringFrequency = () => {
    // default value for Monitoring Frequency
    let frequency = 2;
    // alert if input is not a number
    if (isNaN(Number(tempMonitoringFrequency)))
      alert('Please enter monitoring frequency in numerical format. ex: 15');
    else {
      if (tempMonitoringFrequency) frequency = tempMonitoringFrequency;
      query(
        queryType.INSERT_MONITORING_FREQUENCY,
        // ['admin', , , frequency],
        ['admin', undefined, undefined, frequency],
        (err, res) => {
          if (err) {
            console.log(`INSERT_MONITORING_FREQUENCY. Error: ${err}`);
          } else {
            console.log(`*** Inserted ${res} into users table. ***`);
            props.addMonitoringFrequency(frequency);
          }
        }
      );
    }
  };

  // VERIFICATION OF THE CODE TYPED IN BY USER FROM SMS
  const [formData, updateFormData] = useState('');
  const handleChange = (value) => {
    updateFormData(value);
  };

  // Verify code
  const handleSubmit = async () => {
    const body = {
      code: formData,
      mobileNumber: mobileNumber,
    };

    const result = await ipcRenderer.invoke('verify-code', body);

    if (result === 'approved') {
      showVerificationInput = false;
      isVerified = result === 'approved' ? true : false;
    } else alert('Please try verification code again');
  };

  /**
   * Checks to see if the containerId is in the array
   * @param {array} array the notification settings array (ex: memoryNotificationList)
   * @param {string} containerId the container's ID
   * @returns {number} -1 or the index of the container ID within the array
   */
  // general function to check if a container is in a notification setting list
  const isSelected = (set, containerId) => set.has(containerId);

  const allContainersList = props.runningList.concat(props.stoppedList); // INSTEAD OF CREATING A NEW STATE IN THE REDUCER CONCATENATED 2 ALREADY EXISTING STATES

  // GITHUB URL FORM
  // 1. CREATE AN OBJECT STATE WITH LIST OF CONTAINERS AS KEYS AND EMPTY ARRAYS AS VALUES
  const stateObject = {};
  allContainersList.forEach((el) => {
    if (!stateObject[el.ID]) stateObject[el.ID] = '';
  });

  // 2. MAKE A DB REQUEST TO GET EXISTING DATA ABOUT GITHUB URL LINKS AND UPDATE THE STATE WITH THIS INFORMATION
  const getData = () => {
    return query(queryType.GET_CONTAINERS, []);
  };

  const updateState = async () => {
    const output = await getData();
    output.forEach((el) => {
      stateObject[el.id] = el.github_url;
    });
  };

  const [tempGithubLink, setTempGithubLink] = useState(stateObject);
  const githubLink = (event) => {
    if (!tempGithubLink)
      alert('Please provide a link in accordance with provided example');
    if (!event.target.id) alert('Please provide a container ID');
    else {
      const github_url = tempGithubLink[event.target.id];
      query(
        queryType.INSERT_GITHUB,
        [event.target.id, event.target.name, github_url],
        (err, res) => {
          if (err) {
            console.log(`INSERT_GITHUB. Error: ${err}`);
          } else {
            console.log(`*** Inserted ${res} into containers table. ***`);
          }
        }
      );
    }
  };

  // Redux: Map state to props
  const _id = useSelector((state) => state.session._id);
  const mem_threshold = useSelector((state) => state.session.mem_threshold);
  const cpu_threshold = useSelector((state) => state.session.cpu_threshold);
  const container_stops = useSelector((state) => state.session.container_stops);
  const contact_pref = useSelector((state) => state.session.contact_pref);

  // Local state variables to hold cpuThreshold, memThreshold, stoppedContainers, however should move to Redux session state variables
  const [ cpuThreshold, setCpuThreshold ] = useState(cpu_threshold);
  const [ memThreshold, setMemThreshold ] = useState(mem_threshold);
  const [ stoppedContainers, setStoppedContainers ] = useState(container_stops);
  const [value, setValue] = useState(contact_pref);

  const dispatch = useDispatch();
  const updateUser = (userInfo) => dispatch(actions.updateUser(userInfo));

  const handleRadioChange = (event) => {
    setValue(event.target.value);
  };

  const handleRadioSubmit = (value) => {
    fetch('http://localhost:3000/account/contact', 
      { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id,
          contact_pref: value,
        })
      })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        updateUser(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCpuChange = (event) => {
    setCpuThreshold(document.getElementById('cpu-threshold-input').value);
  };

  const handleCpuSubmit = (value) => {
    console.log('CPU SUBMIT: ', _id);
    fetch('http://localhost:3000/account/cpu', 
      { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id,
          cpu_threshold: value,
        })
      })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        updateUser(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleMemSubmit = (value) => {
    fetch('http://localhost:3000/account/memory', 
      { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id,
          mem_threshold: value,
        })
      })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        updateUser(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleStoppedContainersSubmit = (value) => {
    fetch('http://localhost:3000/account/stops', 
      { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id,
          container_stops: value,
        })
      })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        updateUser(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleMemChange = (event) => {
    setMemThreshold(document.getElementById('mem-threshold-input').value);
  };

  const handleStoppedContainersChange = (event) => {
    setStoppedContainers(document.getElementById('stopped-containers-input').checked);
  };

  const renderAllContainersList = allContainersList.map((container, i) => {
    const isMemorySelected = isSelected(
      props.memoryNotificationList,
      container.ID
    );
    const isCpuSelected = isSelected(props.cpuNotificationList, container.ID);
    const isStoppedSelected = isSelected(
      props.stoppedNotificationList,
      container.ID
    );

    return (
      <TableRow key={i} id="settings-row">
        <TableCell>
          <span className="container-name">
            {container.Names ? container.Names : container.Name}
            {/* Stopped containers have a .Names key. Running containers have a .Name key */}
          </span>
        </TableCell>
        <TableCell>
          <span className="container-id">{container.ID}</span>
        </TableCell>
        <TableCell>{container.Image}</TableCell>
        <TableCell align="center">
          <Checkbox
            onClick={(event) =>
              event.target.checked
                ? handleCheckSetting(
                  container.ID,
                  container.Name,
                  categories.MEMORY
                )
                : handleUnCheckSetting(container.ID, categories.MEMORY)
            }
            role="checkbox"
            key={container.ID}
            checked={isMemorySelected}
          />
        </TableCell>
        <TableCell align="center">
          <Checkbox
            onClick={(event) =>
              event.target.checked
                ? handleCheckSetting(
                  container.ID,
                  container.Name,
                  categories.CPU
                )
                : handleUnCheckSetting(container.ID, categories.CPU)
            }
            role="checkbox"
            key={container.ID}
            checked={isCpuSelected}
          />
        </TableCell>
        <TableCell align="center">
          <Checkbox
            onClick={(event) =>
              event.target.checked
                ? handleCheckSetting(
                  container.ID,
                  container.Names ? container.Names : container.Name, // Stopped containers have a .Names key. Running containers have a .Name key
                  categories.STOPPED
                )
                : handleUnCheckSetting(container.ID, categories.STOPPED)
            }
            role="checkbox"
            key={container.ID}
            checked={isStoppedSelected}
          />
        </TableCell>
        <TableCell align="center">
          <TextField
            className={classes.textfield}
            id="textfield"
            label="Main repository url"
            helperText="* e.g.: https://api.github.com/repos/oslabs-beta/Docketeer/commits?"
            variant="outlined"
            value={tempGithubLink[container.ID]}
            onChange={(e) => {
              stateObject[container.ID] = e.target.value;
              setTempGithubLink(stateObject);
            }}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Button
            className={classes.button}
            size="medium"
            variant="contained"
            name={container.Names ? container.Names : container.Name}
            id={container.ID}
            onClick={(e) => githubLink(e)}
          >
            Confirm
          </Button>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <div className="renderContainers">
      <div className="header">
        <h1 className="tabTitle">Settings</h1>
      </div>

      <div className="metric-section-title">
        <h3>Communication</h3>
      </div>
      <div className="settings-container">
        <p>
          Allows you to (i) connect a mobile phone to your account, and (ii) choose your preferred method of communication.
        </p>
        <br></br>
        <p>1. Link mobile phone to your account</p>
        <br></br>
        <form className={classes.root} autoComplete="off">
          <div>
            <TextField
              required
              id="textfield"
              label="Phone Number"
              helperText="* use country code (+1)"
              variant="outlined"
              value={mobileNumber}
              onChange={(e) => {
                setMobileNumber(e.target.value);
                isVerified = false;
              }}
              size="small"
            />
            {!isVerified ? (
              <Button
                className={classes.button}
                size="medium"
                variant="contained"
                onClick={(e) => handlePhoneNumberSubmit(e)}
                endIcon={<SendIcon />}
              >
                Verify
              </Button>
            ) : (
              <CheckCircleIcon
                fontSize="large"
                className={classes.verifiedIcon}
              />
            )}
          </div>
        </form>

        {showVerificationInput ? (
          <form className={classes.root} autoComplete="off">
            <div className="verification-code">
              <TextField
                required
                id="verification-code"
                label="Verification code"
                variant="outlined"
                onChange={(e) => {
                  handleChange(e.target.value);
                }}
                size="small"
              />
              <Button
                className={classes.button}
                size="medium"
                color="default"
                variant="contained"
                onClick={handleSubmit}
                endIcon={<SendIcon />}
              >
                Submit
              </Button>
            </div>
          </form>
        ) : null}

        {/* <br></br> */}
        <p>2. Contact preference:</p>
        <br></br>
        <FormControl component="fieldset">
          <RadioGroup aria-label="Contact Preferences" name="contact_pref" value={value} onChange={handleRadioChange}>
            <FormControlLabel value="email" control={<Radio />} label="Email" />
            <FormControlLabel value="phone" control={<Radio />} label="Phone" />
          </RadioGroup>
          <br></br>
          <Button
            className={classes.button}
            size="medium"
            variant="contained"
            name="submit-contact-pref"
            id="submit-contact-pref"
            onClick={() => handleRadioSubmit(value)}
          >
            Submit
          </Button>
        </FormControl>

        
        {/* <br></br>
        <p>
          3. Setup / update attribute values for notification triggers in
          Containers settings table below. Recommended values will be used by
          default.
        </p>
        <br></br> */}
      </div>

      <div className="metric-section-title">
        <h3>Notification preferences</h3>
      </div>
      <div className="settings-container">
        <p>
          Allows you to (i) customize monitoring and notification frequency, and (ii) define container conditions that will trigger notifications. When a container hits a threshold, an alert is sent via your preferred method of communication. Recommended values will be used by default.
        </p>
        
        <br></br>
        <p>
          1. Setup / update notification criteria
        </p>
        <br></br>
        <div>
          <form className={classes.root} autoComplete="off">
            <TextField
              id="textfield"
              label="Notification frequency, min"
              helperText="* 5 min is recommended"
              variant="outlined"
              value={tempNotifFreq}
              onChange={(e) => {
                setTempNotifFreq(e.target.value);
              }}
              size="small"
            />
            <Button
              className={classes.button}
              size="medium"
              variant="contained"
              onClick={(e) => notificationFrequency(e)}
            >
              Confirm
            </Button>
          </form>
        </div>

        <div>
          <form className={classes.root} autoComplete="off">
            <TextField
              className={classes.textfield}
              id="textfield"
              label="Monitoring frequency, min"
              helperText="* 2 min is recommended"
              variant="outlined"
              value={tempMonitoringFrequency}
              onChange={(e) => {
                setTempMonitoringFrequency(e.target.value);
              }}
              size="small"
            />
            <Button
              className={classes.button}
              size="medium"
              variant="contained"
              onClick={(e) => monitoringFrequency(e)}
            >
              Confirm
            </Button>
          </form>
        </div>

        <br></br>
        <p>2. Configure notification thresholds</p>
        <br></br>
        <form className={classes.root} autoComplete="off">
          <div>
            <TextField
              required
              id="cpu-threshold-input"
              label="CPU Threshold"
              helperText="* 80% CPU usage recommended"
              variant="outlined"
              // value="80" set this later
              onChange={handleCpuChange}
              placeholder={`${cpu_threshold}`}
              size="small"
            />
            <Button
              className={classes.button}
              size="medium"
              variant="contained"
              onClick={() => handleCpuSubmit(cpuThreshold)}
            >
              Confirm
            </Button>
            <br></br>
            <TextField
              required
              id="mem-threshold-input"
              label="Memory Threshold"
              helperText="* 80% memory recommended"
              variant="outlined"
              onChange={handleMemChange}
              placeholder={`${mem_threshold}`}
              // value="80" set this later
              size="small"
            />

            <Button
              className={classes.button}
              size="medium"
              variant="contained"
              onClick={() => handleMemSubmit(memThreshold)}
            >
              Confirm
            </Button>
            <br></br>
            {/* <p>2. Receive notification if container stops</p>
            <FormControlLabel value={true} control={<Checkbox />} label="" />
            <br></br> */}
            <br></br>
            <p>3. Stopped containers:</p>
            <FormControlLabel value={true} control={<Checkbox id="stopped-containers-input" onChange={handleStoppedContainersChange}/>} label="Receive notification when a container stops" />
          </div>
          <Button
            className={classes.button}
            size="medium"
            variant="contained"
            onClick={()=> handleStoppedContainersSubmit(stoppedContainers)}
            endIcon={<SendIcon />}
          >
            Submit
          </Button>
        </form>

        {showVerificationInput ? (
          <form className={classes.root} autoComplete="off">
            <div className="verification-code">
              <TextField
                required
                id="verification-code"
                label="Verification code"
                variant="outlined"
                onChange={(e) => {
                  handleChange(e.target.value);
                }}
                size="small"
              />
              <Button
                className={classes.button}
                size="medium"
                color="default"
                variant="contained"
                onClick={handleSubmit}
                endIcon={<SendIcon />}
              >
                Submit
              </Button>
            </div>
          </form>
        ) : null}
      </div>

      <div className="metric-section-title">
        <h3>GitHub commits</h3>
      </div>
      <div className="settings-container">
        <p>
          Allows you to get access to latest GitHub commits in your project 
          repository on "Metrics" tab for selected containers
        </p>
        <br></br>
        <p>
          1. Add GitHub repositories url in Containers settingss table below
        </p>
      </div>

      <div className="metric-section-title">
        <h3> Containers setting table</h3>
        <p></p>
      </div>

      <div className="settings-container">
        <div id="description" className={classes.description}></div>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Container Name</TableCell>
                <TableCell>Container ID</TableCell>
                <TableCell>Image</TableCell>
                <TableCell align="center">Memory {'>'} 80%</TableCell>
                <TableCell align="center">CPU {'>'} 80%</TableCell>
                <TableCell align="center">Container Stops</TableCell>
                <TableCell align="center">GitHub repository url</TableCell>
                <TableCell align="center">Apply settings</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{renderAllContainersList}</TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default connect(null, mapDispatchToProps)(Settings);
