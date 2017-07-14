const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const jwt = require('jsonwebtoken');
const config = require('dotenv').config().parsed;
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);
const cors = require('cors');

app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

if ( !process.env.JWT_SECRET || !process.env.USERNAME || !process.env.PASSWORD ) {
  throw 'Make sure you have a JWT_SECRET, USERNAME, and PASSWORD in your .env file';
}

app.set('secretKey', process.env.JWT_SECRET);

const checkAuthorization = (request, response, next) => {

  const token = request.body.token ||
                request.param('token') ||
                request.headers.authorization;

  if (token) {
    jwt.verify(token, app.get('secretKey'), (error, decoded) => {

      if (error) {
        return response.status(403).send({
          success: false,
          message: 'Invalid authorization token.'
        });
      } else {
        request.decoded = decoded;
        next();
      }
    });
  } else {
    return response.status(403).send({
      success: false,
      message: 'You must be authorized to hit this endpoint'
    });
  }
};

app.set('port', process.env.PORT || 3000);

app.get('/', (request, response) => {
  response.sendFile('index.html');
});

app.get('/api/v1/regions', (request, response) => {
  database('regions').select()
  .then((regions) => {
    if (regions.length) {
      response.status(200).json(regions);
    } else {
      response.status(404).json({
        error: 'No regions were found.'
      });
    }
  })
  .catch(error => {
    response.status(500).json({
      error: 'Internal Servor Error.'
    });
  });
});

app.get('/api/v1/earthquakes', (request, response) => {
  database('earthquakes').select()
  .then((earthquakes) => {
    if (earthquakes.length) {
      response.status(200).json(earthquakes);
    } else {
      response.status(404).json({
        error: 'No earthquakes were found.'
      });
    }
  })
  .catch(error => {
    response.status(500).json({
      error: 'Internal Servor Error'
    });
  });
});

app.get('/api/v1/regions/:id', (request, response) => {
  database('regions').where('id', request.params.id).select()
  .then(region => {
    if (region.length) {
      response.status(200).json(region);
    } else {
      response.status(404).json({
        error: 'No region was found matching that id.'
      });
    }
  })
  .catch(error => {
    response.status(500).json({
      error: 'Internal Servor Error'
    });
  });
});

app.get('/api/v1/:region_id/earthquakes', (request, response) => {
  database('earthquakes').where('region_id', request.params.region_id).select()
  .then(earthquakes => {
    if (earthquakes.length) {
      response.status(200).json(earthquakes);
    } else {
      response.status(404).json({
        error: 'No earthquakes were found for that region.'
      });
    }
  })
  .catch(error => {
    response.status(500).json({
      error: 'Internal Server Error'
    });
  });
});

app.get('/api/v1/earthquakes/filterMag', (request, response) => {

  const low = parseFloat(request.query.magLow);
  const high = parseFloat(request.query.magHi);

  database('earthquakes').whereBetween('magnitude', [low, high]).select()
  .then(earthquakes => {
    if (earthquakes.length) {
      response.status(200).json(earthquakes);
    } else {
      response.status(404).json({
        error: 'No earthquakes were found for that magnitude range.'
      });
    }
  })
  .catch(error => {
    response.status(500).json({ error });
  });
});

app.post('/api/v1/authenticate', (request, response) => {
  const userInfo = request.body;
  const username = process.env.USERNAME || config.USERNAME;
  const password = process.env.PASSWORD || config.PASSWORD;

  if (userInfo.username !== username ||  userInfo.password !== password) {
    response.status(403).send({
      success: false,
      message: 'Invalid Credentials'
    });
  } else {
    let token = jwt.sign(userInfo, app.get('secretKey'), {
      expiresIn: 345600
    });

    response.json({
      success: true,
      username: userInfo.username,
      token
    });
  }
});

app.post('/api/v1/regions', checkAuthorization, (request, response) => {
  const region = request.body.regionBody;
  // console.log(region);

  for (let requiredParameter of ['name', 'ne_lat', 'ne_long', 'sw_lat', 'sw_long']) {
    if (!region[requiredParameter]) {
      return response.status(422).json({
        error: `Expected format: { name: <String>, ne_lat: <Decimal>, ne_long: <Decimal>, sw_lat: <Decimal>, sw_long: <Decimal>.}. You are missing a ${requiredParameter} property.`
      });
    }
  }

  database('regions').insert(region, 'id')
    .then(region => {
      response.status(201).json({ id: region[0] });
    })
    .catch(error => {
      response.status(500).json({
        error: 'Internal server error.'
      });
    });
});

app.post('/api/v1/earthquakes', checkAuthorization, (request, response) => {
  const earthquake = request.body.quakeBody;

  for (let requiredParameter of ['id', 'magnitude', 'description', 'lat', 'long', 'depth', 'region_id']) {
    if (!earthquake[requiredParameter]) {
      return response.status(422).json({
        error: `Expected format: { id: <String>, magnitude: <Decimal>, description: <String>, lat: <Decimal>, long: <Decimal>, depth: <Decimal>, region_id: <Integer>}. You are missing a ${requiredParameter} property.`
      });
    }
  }

  database('earthquakes').insert(earthquake, 'id')
    .then(earthquake => {
      response.status(201).json({ id: earthquake[0] });
    })
    .catch(error => {
      response.status(500).json({
        error: 'Internal server error.'
      });
    });
});

app.patch('/api/v1/earthquakes/:id/updateDepth', checkAuthorization, (request, response) => {

  const earthquake = request.body.newDepth;
  const quakeId = request.params.id;
  const newDepth = request.body.newDepth.newDepth;

  for (let requiredParameter of ['id', 'newDepth']) {
    if (!earthquake[requiredParameter]) {
      return response.status(422).json({
        error: `Expected format: { id: <String>, newDepth: <Decimal>}. You are missing a ${requiredParameter} property.`
      });
    }
  }

  database('earthquakes').where('id', quakeId).update('depth', earthquake.newDepth)
    .then(earthquake => {
      response.status(201).json({
        id: earthquake[0],
        message: 'Earthquake depth successfully updated.'
      });
    })
    .catch(error => {
      response.status(500).json({
        error: 'Internal server error.'
      });
    });
});

app.patch('/api/v1/earthquakes/:id/updateMag', checkAuthorization, (request, response) => {

  const newMag = request.body.newMag.newMag;
  const quakeId = request.params.id;
  const earthquake = request.body.newMag;

  for (let requiredParameter of ['id', 'newMag']) {
    if (!earthquake[requiredParameter]) {
      return response.status(422).json({
        error: `Expected format: { id: <String>, newMag: <Decimal>}. You are missing a ${requiredParameter} property.`
      });
    }
  }

  database('earthquakes').where('id', quakeId).update('magnitude', newMag)
    .then( earthquake => {
      response.status(201).json({
        id: earthquake[0],
        message: 'Earthquake magnitude successfully updated.'
      });
    })
    .catch(error => {
      response.status(500).json({
        error: 'Internal server error.'
      });
    });
});

app.delete('/api/v1/:id/earthquakes', checkAuthorization, (request, response) => {

  database('earthquakes').where('id', request.params.id).del()
  .then(result => {
    if (result === 1) {
      response.status(200).json({
        message: `Earthquake with id of ${request.params.id} successfully deleted.`
      });
    } else {
      response.status(404).json({
        error: `Earthquake with id of ${request.params.id} was not found.`
      });
    }
  })
  .catch(error => {
    response.status(500).json({
      error: 'Internal server error.'
    });
  });
});

app.delete('/api/v1/:id/regions', checkAuthorization, (request, response) => {

  database('earthquakes').where('region_id', request.params.id).del()
  .then(result => {
    if (result >= 1) {
      response.status(200).json({
        message: `All earthquakes with region_id of ${request.params.id} have been deleted successfully.`
      });
    } else {
      response.status(404).json({
        error: `No earthquakes with a region_id of ${request.params.id} were found.`
      });
    }
  })
  .catch(error => {
    response.status(500).json({
      error: 'Internal server error'
    });
  });
  database('regions').where('id', request.params.id).del()
  .then(result => {
    if (result === 1) {
      response.status(200).json({
        message: `Region with an id of ${request.params.id} has been deleted successfully.`
      });
    } else {
      response.status(404).json({
        error: `No earthquakes with a region_id of ${request.params.id} were found.`
      });
    }
  })
  .catch(error => {
    response.status(500).json({
      error: 'Internal server error'
    });
  });
});

if (!module.parent) {
  app.listen(app.get('port'), () => {
  });
}

module.exports = app;
