const Log = require('@dazn/lambda-powertools-logger')
const EventBridge = require('aws-sdk/clients/eventbridge')
const eventBridge = new EventBridge()
const SNS = require('aws-sdk/clients/sns')
const sns = new SNS()

const busName = process.env.bus_name
const topicArn = process.env.restaurant_notification_topic

module.exports.handler = async (event) => {
  const order = event.detail
  const snsReq = {
    Message: JSON.stringify(order),
    TopicArn: topicArn
  };
  await sns.publish(snsReq).promise()

  const { restaurantName, orderId } = order
  Log.debug('notified restaurant...',{ restaurantName, orderId })
  await eventBridge.putEvents({
    Entries: [{
      Source: 'big-mouth',
      DetailType: 'restaurant_notified',
      Detail: JSON.stringify(order),
      EventBusName: busName
    }]
  }).promise()

  Log.debug(`published event to EventBridge`, {
    eventType: 'restaurant_notified',
    busName
  })
}