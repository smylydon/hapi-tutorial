var Hapi = require('hapi');
var Joi = require('joi');

var server = new Hapi.Server({
  cache: [
    {
      name: 'redisCache',
      host: '127.0.0.1',
      partition: 'cache',
      engine: require('catbox-redis')
    }
  ]
});

server.connection({ port:8080, host:'localhost'});

server.route({
  path: '/',
  method: 'GET',
  handler: function (request, reply) {
    reply('Hello, world!');
  }
});

var helloConfig = {
  handler: function (request, reply) {
    var names = request.params.name.split('/');
    server.methods.getColor(request.params.name, function(err, color) {
      reply({
          first: names[0],
          last: names[1],
          mood: request.query.mood || 'neutral',
          age: request.query.age,
          color: color
      });
    });
  },
  validate: {
    params: {
      name: Joi.string().min(8).max(20)
    },
    query: {
      mood: Joi.string().valid(['neutral','happy','sad']).default('neutral'),
      age: Joi.number().integer().min(13).max(100)
    }
  }
};

server.route({
  path: '/hello/{name*2}',
  method: 'GET',
  config: helloConfig
});

server.method('getColor', function (name, next) {
  var colors = ['red', 'blue', 'indigo', 'violet', 'green'];
  var color = colors[Math.floor(Math.random() * colors.length)];
  next(null, color);
}, {
  cache: {
    expiresIn: 30000
  }
})

server.start(function () {
  console.log('Hapi server started @', server.info.uri);
});
