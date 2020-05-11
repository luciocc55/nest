import { devEnvironment } from './devEnv';
import { prodEnvironment } from './prodEnv';
let environment = null;

if (process.env.Production === 'true') {
    environment = prodEnvironment;
} else {
    environment = devEnvironment;
}

export default environment;
