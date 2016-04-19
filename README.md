# thrift-node-client
Support multiple thrift servers

## Install
```bash
$ npm install thrift-node-client
```

## Usage
```javascript
var service = require('./gen/Service');

var servers = [
  {server: '10.1.8.6', port: 6666},
  {server: '10.1.8.8', port: 8888}
];

var getClient = require('thrift-node-client').pool(service, servers);
getClient().callThriftMethod();
```
