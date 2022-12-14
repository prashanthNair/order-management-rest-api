import createError from 'http-errors';
import { CartDetails } from '../model/orderDataModel';
import { SaveItemToCart } from '../services/saveCart';
import {
  MakeHeaderRequest,
  ResponseBuilder,
  ValidateHeader,
} from '../utils/helper';
import { ValidatePostCart } from '../utils/validator';

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
    const customerId = event.pathParameters.CustomerId;
    if (!customerId) {
      const err = new createError.NotFound('customerId Missing');
      return ResponseBuilder(err, 400);
    }

    if (!event.body) {
      const err = new createError.NotFound('Body Missing');
      return ResponseBuilder(err, 400);
    }
    let productDetails: CartDetails = JSON.parse(event.body);
    let headers = event.headers;
    console.info('Request Body', event.body);
    const itemId = 'CA' + new Date().getTime().toString();
    const now = new Date();
    productDetails.TraceId = headers['TraceId'];
    productDetails['CreatedDate'] = now.toISOString();
    productDetails.CartId = itemId;
    productDetails.CustomerId = customerId;
    const validate = ValidatePostCart(productDetails);
    if (!validate.isValid) {
      return ResponseBuilder(validate.message, 400);
    }

    let response = await SaveItemToCart(productDetails);
    console.info(
      `Response Body: ${{
        statusCode: 200,
        body: JSON.stringify(response),
      }} Method: POST Action:createBrand `
    );
    return ResponseBuilder(response, 200);
  } catch (error: any) {
    console.info(
      `Error: Path: ${event.path}, Method:${
        event.httpMethod
      } Error:${JSON.stringify(error)}`
    );
    return ResponseBuilder(error, 500);
  }
};
