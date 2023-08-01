/**
 * @fileoverview Common configurations
 * @author Mohammad Idris
 */

let environmentType = {
   PROD: 'production',
   DEV: 'dev',
   SANDBOX: 'sandbox'
}[process.env.ENVR];

const DEFAULT_ENV = environmentType || 'dev';

let config = {
   "production": require("./prodConfig"),
   "dev": require("./devConfig"),
   //"sandbox": require("./sandboxConfig")
};
const currentEnv = config[DEFAULT_ENV];
currentEnv.CURRENT_ENV = DEFAULT_ENV;
module.exports = currentEnv;
