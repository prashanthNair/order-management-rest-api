import { UpdateOrderModel } from '../model/updateOrderStatusModel';
import { editOrderStatus } from '../services/editOrderStatus';
import {
  MakeHeaderRequest,
  ResponseBuilder,
  ValidateHeader,
} from '../utils/helper';
import { ValidateUpdateOrder } from '../utils/validator';

export const handler = async (event: any) => {
  try {
    console.info(
      `Request Body: ${JSON.stringify(
        event.body
      )} Method: POST Action:CreateOrder `
    );

    let validateResponse = ValidateHeader(event['headers']);

    if (!validateResponse.Status) {
      return ResponseBuilder(validateResponse, 400);
    }

    const headerRequest: any = MakeHeaderRequest(event['headers']);
    console.info(
      `Request: Path: ${event.path}, Method:${
        event.httpMethod
      } Headers:${JSON.stringify(event.headers)}, Body:${JSON.stringify(
        event.body
      )} TraceId: ${headerRequest.TraceId}`
    );
    console.info('Request Event', event);
    console.info('Request Body', event.body);
    let orderStatusModel: UpdateOrderModel = JSON.parse(event.body);
    const validate = ValidateUpdateOrder(orderStatusModel);
    if (!validate.isValid) {
      return ResponseBuilder(validate.message, 400);
    }
    const now = new Date().toISOString();
    const result = await Promise.all(
      orderStatusModel.Orders.map(async (model) => {
        try {
          const orderStatusRequest = {
            OrderId: model.OrderId,
            CustomerId: model.CustomerId,
            OrderStatus: model.OrderStatus,
            HandoverTime: model.HandoverTime,
            LastUpdatedDate: now,
            TrackingId: model.TrackingId,
          };
          return await editOrderStatus(orderStatusRequest);
        } catch (err) {
          console.log(err);
          throw err;
        }
      })
    );

    console.info(
      `Response Body: ${{
        statusCode: 200,
        body: JSON.stringify(result),
      }} Method: POST Action:createBrand `
    );
    return ResponseBuilder(result, 200);
  } catch (error: any) {
    console.info(
      `Error: Path: ${event.path}, Method:${
        event.httpMethod
      } Error:${JSON.stringify(error)}`
    );
    return ResponseBuilder(error, 500);
  }
};
