import { documentClient } from '../utils/config';
import { ORDERS_TABLE } from '../utils/constants';
import createError from 'http-errors';

export const editOrderStatus = async (orderStatusRequest: any) => {
  try {
    const params = {
      TableName: ORDERS_TABLE,
      Key: {
        OrderId: orderStatusRequest.OrderId,
        CustomerId: orderStatusRequest.CustomerId,
      },
      ExpressionAttributeNames: {
        '#OrderStatus': 'OrderStatus',
        '#LastUpdatedDate': 'UpdatedAt',
        '#HandoverTime': 'HandoverTime',
        '#TrackingId': 'TrackingId',
      },
      ExpressionAttributeValues: {
        ':OrderStatus': orderStatusRequest.OrderStatus,
        ':LastUpdatedDate': orderStatusRequest.LastUpdatedDate,
        ':HandoverTime': orderStatusRequest.HandoverTime,
        ':TrackingId': orderStatusRequest.TrackingId,
      },
      UpdateExpression:
        'SET #OrderStatus = :OrderStatus, #LastUpdatedDate = :LastUpdatedDate, #HandoverTime = :HandoverTime, #TrackingId = :TrackingId',
      ReturnValues: 'ALL_NEW',
    };

    let strBody = JSON.stringify(orderStatusRequest);
    console.info(`Edit Order Begins: String request - ${strBody}`);
    console.info(`Edit Order - ${params}`);
    console.info(
      `Edit Order Begins: Service Table - ${ORDERS_TABLE}'-'${orderStatusRequest.OrderId}`
    );

    const res = await documentClient.update(params).promise();
    if (!res) {
      throw new createError.InternalServerError(
        'Error while updating the Order '
      );
    }
    console.info(
      `Response Body: ${{
        statusCode: 200,
        body: JSON.stringify(res.Attributes),
      }} Method: POST Action:EditOrderStatus `
    );
    return res.Attributes;
  } catch (error: any) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
};
