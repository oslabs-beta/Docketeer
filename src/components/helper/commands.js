import { exec } from 'child_process';
import query from './psqlQuery';
import parseContainerFormat from './parseContainerFormat';
import store from '../../renderer/store';
/**
 *
 * @param {*} runningList
 * @param {*} callback
 * on app start-up, get the containers that are already running by calling addRunning
 */

// docker stats --no-stream --format "{{ json . }}"
export const addRunning = (runningList, callback) => {
  exec(
    'docker stats --no-stream --format "{{json .}},"',
    (error, stdout, stderr) => {
      if (error) {
        alert(`${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      // trim whitespace at end out stdout,slice to remove trailing comma and remove spaces
      const dockerOutput = stdout.trim().slice(0, -1).replaceAll(' ', '');
      const output = `[${dockerOutput}]`;
      const convertedValue = JSON.parse(output);
      const newList = [];

      for (let i = 0; i < convertedValue.length; i++) {
        let isInTheList = false;
        for (const container of runningList) {
          if (container.cid === convertedValue[i].cid) {
            isInTheList = true;
            break;
          }
        }
        isInTheList ? '' : newList.push(convertedValue[i]);
      }
      newList.length ? callback(newList) : '';
    }
  );
};

/**
 *
 * @param {*} callback
 * @param {*} runningList
 * Running containers will be refreshed every time
 */
export const refreshRunning = (refreshRunningContainers) => {
  exec(
    'docker stats --no-stream --format "{{json .}},"',

    (error, stdout, stderr) => {
      if (error) {
        alert(`${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      // trim whitespace at end out stdout,slice to remove trailing comma and remove spaces
      const dockerOutput = `[${stdout
        .trim()
        .slice(0, -1)
        .replaceAll(' ', '')}]`;
      // const output = `[${dockerOutput}]`;
      const convertedValue = JSON.parse(dockerOutput);

      refreshRunningContainers(convertedValue);
    }
  );
};

/**
 *
 * @param {*} callback
 * Stopped containers will refresh every time
 */
export const refreshStopped = (refreshStoppedContainers) => {
  exec(
    'docker ps -f "status=exited" --format "{{json .}},"',
    (error, stdout, stderr) => {
      if (error) {
        alert(`${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      // trim whitespace at end out stdout and slice to remove trailing comma
      const dockerOutput = stdout.trim().slice(0, -1);
      let output = `[${dockerOutput}]`;
      output = JSON.parse(output);
      refreshStoppedContainers(output);
    }
  );
};

/**
 *
 * @param {*} callback
 * Images will be refreshed every time
 */
export const refreshImages = (callback) => {
  exec('docker images', (error, stdout, stderr) => {
    if (error) {
      alert(`${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    const value = parseContainerFormat.convert(stdout);
    const objArray = ['reps', 'tag', 'imgid', 'size'];
    const resultImages = [];
    for (let i = 0; i < value.length; i++) {
      const innerArray = [];
      if (value[i][0] !== '<none>') {
        innerArray.push(value[i][0]);
        innerArray.push(value[i][1]);
        innerArray.push(value[i][2]);
        innerArray.push(value[i][6]);
        resultImages.push(innerArray);
      }
    }
    const convertedValue = parseContainerFormat.convertArrToObj(
      resultImages,
      objArray
    );

    callback(convertedValue);
  });
};

/**
 *
 * @param {*} id
 * @param {*} callback
 * Images will be removed
 */
export const remove = (id, callback) => {
  exec(`docker rm --force ${id}`, (error, stdout, stderr) => {
    if (error) {
      alert(`${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    callback(id);
  });
};

/**
 *
 * @param {*} id
 * @param {*} callback
 * Stop a container on what user selects
 */
export const stop = (id, callback) => {
  exec(`docker stop ${id}`, (error, stdout, stderr) => {
    if (error) {
      alert(`${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    callback(id);
  });
};

/**
 *
 * @param {*} id
 * @param {*} callback
 * Start the container
 */
export const runStopped = (
  id,
  runStoppedContainerDispatcher,
  refreshRunningContainers
) => {
  exec(`docker start ${id}`, (error, stdout, stderr) => {
    if (error) {
      alert(`${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    runStoppedContainerDispatcher(id);
  });
};

/**
 *
 * @param {*} id
 * @param {*} runningList
 * @param {*} callback_1
 * @param {*} callback_2
 * Run Image
 *
 */

export const runIm = (id, runningList, callback_1, callback_2) => {
  // props.runIm(ele['imgid'], props.runningList, helper.addRunning, props.addRunningContainers)
  exec(`docker run ${id}`, (error, stdout, stderr) => {
    if (error) {
      alert(`${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
  });
  callback_1(runningList, callback_2);
};

/**
 *
 * @param {*} id
 * @param {*} imagesList
 * @param {*} callback_1
 * @param {*} callback_2
 * Remove Image
 */
export const removeIm = (id, imagesList, callback_1, callback_2) => {
  exec(`docker rmi -f ${id}`, (error, stdout, stderr) => {
    if (error) {
      alert(
        `${error.message}` +
          '\nPlease stop running container first then remove.'
      );
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    callback_1(callback_2);
  });
};

/**
 *
 * @param {*} e
 * Handling System Prune
 */
export const handlePruneClick = (e) => {
  e.preventDefault();
  exec('docker system prune --force', (error, stdout, stderr) => {
    if (error) {
      alert(`${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
  });
};

/**
 *
 * @param {*} repo
 * Pull image based on the repo you select
 */
export const pullImage = (repo) => {
  exec(`docker pull ${repo}`, (error, stdout, stderr) => {
    if (error) {
      alert(`${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
  });
};

/**
 *
 * @param {*} getDockerNetworkReducer
 * Display all containers network based on docker-compose when the application starts
 */
export const networkContainers = (getDockerNetworkReducer) => {
  // exec("docker network ls", (error, stdout, stderr) => {
  exec('docker network ls --format "{{json .}},"', (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }

    // trim whitespace at end out stdout,slice to remove trailing comma and remove spaces
    const dockerOutput = `[${stdout.trim().slice(0, -1).replaceAll(' ', '')}]`;
    // remove docker network defaults named: bridge, host, and none
    const networkContainers = JSON.parse(dockerOutput).filter(
      ({ Name }) => Name !== 'bridge' && Name !== 'host' && Name !== 'none'
    );
    // dispatch the network containers to the redux store
    getDockerNetworkReducer(networkContainers);
  });
};

export const inspectDockerContainer = (containerId) => {
  exec(`docker inspect ${containerId}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(stdout);
  });
};

export const dockerComposeUp = (fileLocation) => {
  return new Promise((resolve, reject) => {
    const cmd = `cd ${fileLocation} && docker-compose up -d`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error.message);
        return;
      }

      if (stderr) {
        resolve(stderr);
      }

      if (stdout) {
        console.log(stdout);
      }
    });
  });
};

export const dockerComposeStacks = (getComposeStacksReducer, filePath) => {
  if (getComposeStacksReducer && filePath) {
    exec(
      'docker network ls --filter "label=com.docker.compose.network" --format "{{json .}},"',
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        const dockerOutput = `[${stdout
          .trim()
          .slice(0, -1)
          .replaceAll(' ', '')}]`;
        const parseDockerOutput = JSON.parse(dockerOutput);
        parseDockerOutput[parseDockerOutput.length - 1].FilePath = filePath;

        getComposeStacksReducer(parseDockerOutput);
      }
    );
  } else {
    exec(
      'docker network ls --filter "label=com.docker.compose.network" --format "{{json .}},"',
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        const dockerOutput = `[${stdout
          .trim()
          .slice(0, -1)
          .replaceAll(' ', '')}]`;
        const parseDockerOutput = JSON.parse(dockerOutput);
        getComposeStacksReducer(parseDockerOutput);
      }
    );
  }
};

export const dockerComposeDown = (filePath) => {
  return new Promise((resolve, reject) => {
    const cmd = `cd ${filePath} && docker-compose down`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error.message);
        return;
      }

      if (stderr) {
        console.log(stderr);
        resolve(stderr);
      }

      if (stdout) {
        console.log(stdout);
      }
    });
  });
};

export const writeToDb = () => {
  const interval = 300000;
  setInterval(() => {
    const state = store.getState();
    const runningContainers = state.containersList.runningList;
    const stoppedContainers = state.containersList.stoppedList;
    if (!runningContainers.length) return;
    let dbQuery = 'insert into metrics (container_id, container_name, cpu_pct, memory_pct, memory_usage, net_io, block_io, pid, created_at) values ';
    runningContainers.forEach((container, idx) => {
      // no need to worry about sql injections as it would be self sabotaging! 
      const string = `('${container.ID}', '${container.Name}', '${container.CPUPerc}', '${container.MemPerc}', '${container.MemUsage}', '${container.NetIO}', '${container.BlockIO}', '${container.PIDs}', current_timestamp)`;
      if (idx === runningContainers.length - 1 && stoppedContainers.length === 0) dbQuery += string;
      else dbQuery += string + ', ';
    });
    stoppedContainers.forEach((container, idx) => {
      const string = `('${container.ID}', '${container.Names}', '0.00%', '0.00%', '00.0MiB/0.00GiB', '0.00kB/0.00kB', '00.0MB/00.0MB', '0', current_timestamp)`;
      if (idx === stoppedContainers.length - 1) dbQuery += string;
      else dbQuery += string + ', ';
    });
    query(dbQuery);
  }, interval);
};

export const setDbSessionTimeZone = () => {
  const currentTime = new Date();
  const offsetTimeZoneInHours = currentTime.getTimezoneOffset() / 60;
  query(`set time zone ${offsetTimeZoneInHours}`);
};

export const getContainerGitUrl = (container) => {
  return query(`Select github_url from containers where name = '${container}'`);
};
