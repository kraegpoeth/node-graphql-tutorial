var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type Query {
    getMessage(id: ID!): Message
    ip: String
  }

  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  },
`);

function loggingMiddleware(req, res, next) {
  console.log('ip: '+req.ip);
  next();
}

class Message {
  constructor(id, {content, author}) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}


var fakeDatabase = {};


var root = {
  ip: function(args, request){
    return request.ip;
  },
  getMessage: function ({id}) {
    if (!fakeDatabase[id]){
    throw new Error('no message exists with id ' + id);
    }
    return new Message(id, fakeDatabase[id]);
  },
  createMessage: function ({input}) {
    var id = require('crypto').randomBytes(10).toString('hex');

    fakeDatabase[id] = input;
    return new Message(id, input);
  },
  updateMessage: function ({id, input}) {
    if(!fakeDatabase[id]) {
      throw new Error('no message exists with id ' + id);
    }
    // Will replace all old data, could do partial update instead...
    fakeDatabase[id] = input;
    return new Message(id, input);
  },
}

var app = express();
app.use(loggingMiddleware);
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

app.listen(4000)
console.log('gql server live on port localhost:4000/graphql');
