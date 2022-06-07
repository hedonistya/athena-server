const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const WSServer = require('express-ws')(app);
const aWss = WSServer.getWss();

const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.json({
  limit: '500mb'
}))

app.ws('/', (ws, request) => {
  ws.on('message', (message) => {
    message = JSON.parse(message);

    switch (message.method) {
      case 'connection':
        getConnection(ws, message);
        break;
      case 'draw':
        getAction(ws, message);
        break;
      case 'clear':
        getAction(ws, message);
        break;
      case 'message':
        getAction(ws, message);
        break;
      default:
        break;
    }
  })
})

const getConnection = (ws, message) => {
  ws.id = message.id;
  getAction(ws, message);
};

const getAction = (ws, message) => {
  aWss.clients.forEach(client => {
    if (client.id === message.id) {
      client.send(JSON.stringify(message));
    }
  })
};

app.post('/image', (request, response) => {
  try {
    const result = request.body.img.replace(`data:image/png;base64,`, '');
    fs.writeFileSync(path.resolve(__dirname, 'images', `${request.query.id}.png`), result, 'base64');

    return response.status(200).json({
      message: "Success"
    })
  } catch (error) {
    console.log(error);

    return response.status(500).json('error')
  }
});

app.get('/image', (request, response) => {
  try {
    const data = fs.readFileSync(path.resolve(__dirname, 'images', `${request.query.id}.png`));
    const result = `data:image/png;base64,` + data.toString('base64');

    response.json(result);
  } catch (error) {
    console.log(error);

    return response.status(500).json('error');
  }
});

app.post('/users', (request, response) => {
  const data = {
    owner: request.body.owner
  };

  try {
    const result = JSON.stringify(data);
    fs.writeFileSync(path.resolve(__dirname, 'users', `${request.query.id}.json`), result, 'utf8');

    return response.status(200).json({
      message: "Success"
    });
  } catch (error) {
    console.log(error);

    return response.status(500).json('error')
  }
});

app.get('/users', (request, response) => {
  try {
    const data = fs.readFileSync(path.resolve(__dirname, 'users', `${request.query.id}.json`));
    const result = JSON.parse(data);

    response.json(result);
  } catch (error) {
    console.log(error);

    return response.status(500).json('error');
  }
});

app.listen(PORT, () => console.log(`Server port ${PORT}`));