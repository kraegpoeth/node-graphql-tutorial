var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
  type Query {
    rollDice(numDice: Int!, numSides: Int): [Int]
  }
`);

var root = {
  rollDice: function ({numDice, numSides}) {
    var output = [];
    for(var i = 0; i < numDice; i++) {
      output.push(1 + Math.floot(Math.random() * (numSides || 6)));
    }
    return output;
  }
};

var app = express();
app.use('/graphiql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

app.listen(4000)
console.log('gql server live on port localhost:4000/graphiql');
