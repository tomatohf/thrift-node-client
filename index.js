function pool(service, servers) {
  var thriftClients = null;
  var init = function () {
    var thrift = require('thrift');
    thriftClients = (servers || []).map(function (server) {
      var thriftClient = {
        closed: null,
        connection: thrift.createConnection(server.server, server.port, {
          transport: thrift.TFramedTransport,
          max_attempts: 8
        })
      };
      var addr = server.server + ':' + server.port;
      thriftClient.connection.on('connect', function () {
        thriftClient.closed = false;
        console.log('thrift connect to ' + addr);
      });
      thriftClient.connection.on('close', function () {
        thriftClient.closed = true;
        console.log('thrift connection to ' + addr + ' close');
      });
      thriftClient.connection.on('error', function (error) {
        console.log('thrift connection to ' + addr + ' error', error);
      });
      thriftClient.client = thrift.createClient(service, thriftClient.connection);
      return thriftClient;
    });
  };
  var resetClosed = function () {
    thriftClients && thriftClients.forEach(function (thriftClient) {
      if (thriftClient.closed) {
        thriftClient.connection.initialize_retry_vars();
        thriftClient.connection.connection_gone();
      }
    });
  };

  var counter = 0;
  return function () {
    counter += 1;
    if (!thriftClients) init();
    var clients = thriftClients.filter(function (thriftClient) {
      return thriftClient.connection.connected;
    });
    var connectedCount = clients.length;
    if (connectedCount * 2 <= thriftClients.length) resetClosed();
    if (connectedCount <= 0) clients = thriftClients;
    var clientCount = clients.length;
    return (clientCount > 0) ? clients[counter % clientCount].client : null;
  };
}

module.exports = {
  pool: pool
};
