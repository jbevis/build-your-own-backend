const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.set('port', process.env.PORT || 3000);

app.use(express.static(`${__dirname}/public`))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (request, response) => {
  response.sendFile('index.html')
});

app.get('/api/v1/regions', (request, response) => {
  database('regions').select()
  .then((regions) => {
    if (regions.length) {
      response.status(200).json(regions);
    } else {
      response.status(404).json({
        error: 'No regions were found'
      });
    }
  })
  .catch(error => {
    response.status(500).json({
      error: 'Internal Servor Error'
    })
  });
});

app.get('/api/v1/earthquakes', (request, response) => {
  database('earthquakes').select()
  .then((earthquakes) => {
    if (earthquakes.length) {
      response.status(200).json(earthquakes);
    } else {
      response.status(404).json({
        error: 'No earthquakes were found'
      });
    }
  })
  .catch(error => {
    response.status(500).json({
      error: 'Internal Servor Error'
    })
  });
});

app.get('/api/v1/regions/:id', (request, response) => {
  database('regions').where('id', request.params.id).select()
  .then(region => {
    if (region.length) {
      response.status(200).json(region);
    } else {
      response.status(404).json({
        error: 'No region was found matching that id'
      });
    }
  })
  .catch(error => {
    response.status(500).json({
      error: 'Internal Servor Error'
    })
  });
});

app.get('/api/v1/:region_id/earthquakes', (request, response) => {
  database('earthquakes').where('region_id', request.params.region_id).select()
  .then(earthquakes => {
    if (earthquakes.length) {
      response.status(200).json(earthquakes);
    } else {
      response.status(404).json({
        error: 'No earthquakes were found for that region'
      });
    }
  })
  .catch(error => {
    response.status(500).json({
      error: 'Internal Server Error'
    })
  });
});

// app.get('/api/v1/earthquakes?magnitude=:low&magnitude=:high', (request, response) => {
//   database('earthquakes').whereBetween('magnitude', [request.params.low, request.params.high]).select()
//   .then(earthquakes => {
//     if (earthquakes.length) {
//       response.status(200).json(earthquakes);
//     } else {
//       response.status(404).json({
//         error: 'No earthquakes were found in that magnitude range'
//       });
//     }
//   })
//   .catch(error => {
//     response.status(500).json({
//       error: 'Internal Server Error'
//     })
//   });
// });

app.post('/api/v1/regions', (request, response) => {
  const region = request.body;

  for (let requiredParameter of ['name', 'ne_lat', 'ne_long', 'sw_lat', 'sw_long']) {
    if (!region[requiredParameter]) {
      return response.status(422).json({
        error: `Expected format: { name: <String>, ne_lat: <Decimal>, ne_long: <Decimal>, sw_lat: <Decimal>, sw_long: <Decimal>.}. You are missing a ${requiredParameter} property.`
      });
    }
  }

  database('regions').insert(region, 'id')
    .then(region => {
      response.status(201).json({ id: region[0] })
    })
    .catch(error => {
      response.status(500).json({ error })
    })
});

app.post('/api/v1/earthquakes', (request, response) => {
  const earthquake = request.body;

  for (let requiredParameter of ['id', 'magnitude', 'description', 'lat', 'long', 'depth', 'region_id']) {
    if (!earthquake[requiredParameter]) {
      return response.status(422).json({
        error: `Expected format: { id: <String>, magnitude: <Decimal>, description: <String>, lat: <Decimal>, long: <Decimal>, depth: <Decimal>, region_id: <Integer>}. You are missing a ${requiredParameter} property.`
      });
    }
  }

  database('earthquakes').insert(earthquake, 'id')
    .then(earthquake => {
      response.status(201).json({ id: earthquake[0] })
    })
    .catch(error => {
      response.status(500).json({ error })
    })
});

if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`Server is running on port ${app.get('port')}`);
  })
}

module.exports = app;
