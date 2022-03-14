import { DynamoDB } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocument,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import DynamoDbLocal from 'dynamodb-local';

let child: any;

const port = 8000;

beforeAll(async () => {
  child = await DynamoDbLocal.launch(port, null, [], false, true);
});

afterAll(() => {
  DynamoDbLocal.stopChild(child);
});

const documentClient = DynamoDBDocument.from(
  new DynamoDB({
    endpoint: `http://127.0.0.1:${port}`,
    region: 'eu-central-1',
    tls: false,
    credentials: {
      accessKeyId: 'foo',
      secretAccessKey: 'bar',
    },
  }),
  {
    marshallOptions: {
      convertEmptyValues: true,
      convertClassInstanceToMap: true,
    },
  }
);

it('should insert item into table', async () => {
  await documentClient.send(
    new PutCommand({ TableName: 'files', Item: { id: '1', hello: 'world' } })
  );

  const { Item } = await documentClient.send(
    new GetCommand({ TableName: 'files', Key: { id: '1' } })
  );

  expect(Item).toEqual({
    id: '1',
    hello: 'world',
  });
});
