// Import DynamoDBClient
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
 DynamoDBDocumentClient, 
 ScanCommand, 
 PutCommand, 
 GetCommand, 
 DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

// Constants Declaration
const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
// Table Name
const tableName = "products";

// Asynchronous Event
export const handler = async (event, context) => { 
    let body; 
    let statusCode = 200; 
    const headers = { 
    "Content-Type": "application/json", 
 }; 

 // Events Validation and Handling
 try { 
        switch (event.routeKey) { 

            // Delete Product
            case "DELETE /products/{id}": 
                    await dynamo.send( 
                        new DeleteCommand({ 
                            TableName: tableName, 
                            Key: { 
                                id: event.pathParameters.id, 
                            }, 
                        }) 
                    ); 
                    body = `Deleted item ${event.pathParameters.id}`; 
                    break; 
            
            // Get Product Details Based on id
            case "GET /products/{id}": 
                    body = await dynamo.send( 
                        new GetCommand({ 
                            TableName: tableName, 
                                    Key: { 
                                        id: event.pathParameters.id, 
                                    }, 
                        }) 
                    ); 
                    body = body.Item; 
                    break; 

            // Get All Products
            case "GET /products": 
                     body = await dynamo.send( 
                        new ScanCommand({ TableName: tableName }) 
                    ); 
                    body = body.products; 
                    break; 
            
            // Added Product
            case "PUT /products": 
                    let requestJSON = JSON.parse(event.body); 
                    await dynamo.send( 
                    new PutCommand({ 
                        TableName: tableName, 
                                Item: {  
                                price: requestJSON.price, 
                                name: requestJSON.name, 
                                description: requestJSON.description
                                }, 
                        }) 
                    ); 
                    body = `Put item ${requestJSON.id}`; 
                    break; 

            default: 
                throw new Error(`Unsupported route: "${event.routeKey}"`); 
    } 
 } catch (err) { 
    statusCode = 400; 
    body = err.message; 
 } finally { 
    body = JSON.stringify(body); 
 } 

 return { 
    statusCode, 
    body, 
    headers, 
 };
};