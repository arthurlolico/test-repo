import soma from './soma';

test('adicionar 10 + 10 é igual a 20', () => {
    expect(soma(10,10)).toEqual(20);
  });