'use strict';

module.exports = {
  aws_local_config: {
    region: 'local',
    endpoint: 'http://localhost:8000'
  },
  aws_remote_config: {
    accessKeyId: process.env.awsAccesskeyID,
    secretAccessKey: process.env.awsSecretAccessKey,
    region: process.env.region,
  },
  jwt_secret: process.env.jwt_secret,
  awsAccesskeyID: process.env.awsAccesskeyID,
  awsSecretAccessKey: process.env.awsSecretAccessKey,
  awsRegion: process.env.awsRegion,
  webURi: process.env.webURi,
  awsS3BaseUrl: process.env.S3_URL
};