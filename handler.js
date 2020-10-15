'use strict';
const settings = require('./config/settings');
const axios = require('axios');
const cheerio = require('cheerio');
const AWS = require('aws-sdk');
const uuid = require('uuid');

const dynamoDB = new AWS.DynamoDB.DocumentClient()

module.exports.scheduler = async event => {
  console.log('at: ', new Date().toISOString(), JSON.stringify(event, null, 2))

  const {
    data
  } = await axios.get(settings.APICommitMessagesUrl)

  const $ = cheerio.load(data);

  const [commitMessage] = await $("#content").text().trim().split("\n")
  console.log("Message ", commitMessage)

  const params = {
    TableName: settings.dbTableName,
    Item: {
      commitMessage,
      id: uuid.v1(),
      createAt: new Date().toISOString()
    }
  }

  await dynamoDB.put(params).promise()

  return {
    statusCode: 200
  }
};