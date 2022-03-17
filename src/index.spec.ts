import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, GetCommand, PutCommand} from '@aws-sdk/lib-dynamodb';
import DynamoDbLocal from 'dynamodb-local';

let child: any;

const port = 8000;

jest.setTimeout(30000);

beforeAll(async () => {
  child = await DynamoDbLocal.launch(port, null, [], false, true);
  const items = [...new Array(1000)].map((_, index) => {
    const newIndex = index + 1000;
    const hashKey = 'pk';
    const rangeKey = 'sk';
    const hashKeyValue = 'DynamoDBCursorBasedPagination';
    const rangeKeyValue = `cursor-${newIndex}`;

    return {
      [hashKey]: hashKeyValue,
      [rangeKey]: rangeKeyValue,
      index: newIndex,
      parity: newIndex & 1 ? 'ODD' : 'EVEN',
    };

  });
  
  await Promise.all(items.map(item => {
    return documentClient.send(
      new PutCommand({
        TableName: 'DynamoDBCursorBasedPagination',
        Item: item
      })
    );
 }));
});

afterAll(() => {
  DynamoDbLocal.stopChild(child);
});

const documentClient = DynamoDBDocument.from(
  new DynamoDB({
    endpoint: `http://127.0.0.1:${port}`,
    region: 'local-env',
    tls: false,
    credentials: {
      accessKeyId: 'fakeMyKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
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

  const { Item } = await documentClient.send(
    new GetCommand({ TableName: 'DynamoDBCursorBasedPagination', Key: { pk: 'DynamoDBCursorBasedPagination' , sk: 'cursor-1000'} })
  );

  expect(Item).toEqual({
    pk: 'DynamoDBCursorBasedPagination',
    sk: 'cursor-1000',
    index: 1000,
    parity: 'EVEN'
  });
});
