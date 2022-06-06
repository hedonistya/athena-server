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

app.ws('/', (ws, req) => {
  ws.on('message', (msg) => {
    msg = JSON.parse(msg);

    switch (msg.method) {
      case 'connection':
        connectionHandler(ws, msg);
        break;
      case 'draw':
        broadcastConnection(ws, msg);
        break;
      case 'clear':
        broadcastConnection(ws, msg);
        break;
      case 'message':
        broadcastConnection(ws, msg);
        break;
      default:
        break;
    }
  })
})

const connectionHandler = (ws, msg) => {
  ws.id = msg.id;
  broadcastConnection(ws, msg);
};

const broadcastConnection = (ws, msg) => {
  aWss.clients.forEach(client => {
    if (client.id === msg.id) {
      client.send(JSON.stringify(msg));
    }
  })
};

app.post('/image', (req, res) => {
  try {
    const data = req.body.img.replace(`data:image/png;base64,`, '');
    fs.writeFileSync(path.resolve(__dirname, 'images', `${req.query.id}.png`), data, 'base64');
    return res.status(200).json({
      message: "Загружено"
    })
  } catch (e) {
    console.log(e);
    return res.status(500).json('error')
  }
});

app.get('/image', (req, res) => {
  try {
    const file = fs.readFileSync(path.resolve(__dirname, 'images', `${req.query.id}.png`));
    const data = `data:image/png;base64,` + file.toString('base64');
    res.json(data);
  } catch (e) {
    console.log(e);
    return res.status(500).json('error');
  }
});

app.post('/users', (req, res) => {
  try {
    const data = {
      owner: req.body.owner
    };
    const json = JSON.stringify(data);
    fs.writeFileSync(path.resolve(__dirname, 'users', `${req.query.id}.json`), json, 'utf8');
    return res.status(200).json({
      message: "Загружено"
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json('error')
  }
});

app.get('/users', (req, res) => {
  try {
    const rawdata = fs.readFileSync(path.resolve(__dirname, 'users', `${req.query.id}.json`));
    const data = JSON.parse(rawdata);
    res.json(data);
  } catch (e) {
    console.log(e);
    return res.status(500).json('error');
  }
});

app.listen(PORT, () => console.log(`Server port ${PORT}`));