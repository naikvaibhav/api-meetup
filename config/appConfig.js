let appConfig = {};

appConfig.port = 3000;
appConfig.allowedCorsOrigin = '*';
appConfig.env = 'dev';
appConfig.db = {
  // uri: 'mongodb+srv://vaibhav:vaibhav@vncluster-dhl0q.mongodb.net/meetUpDB?retryWrites=true&w=majority'
  uri : 'mongodb://127.0.0.1:27017/meetUpDB'
};
appConfig.apiVersion = '/api/v1';

module.exports = {
  port: appConfig.port,
  allowedCorsOrigin: appConfig.allowedCorsOrigin,
  environment: appConfig.env,
  db: appConfig.db,
  apiVersion: appConfig.apiVersion
};
