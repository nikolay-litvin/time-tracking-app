/* eslint-disable no-param-reassign */
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

const DATA_FILE = path.join(__dirname, 'data.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});




// возвращет список всех таймеров
app.get('/api/timers', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.json(JSON.parse(data));
  });
});

// принимает JSON body с аттрибутами и вставляет новый объект-таймер в свое хранилище
app.post('/api/timers', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    const timers = JSON.parse(data);
    const newTimer = {
      title: req.body.title,
      project: req.body.project,
      id: req.body.id,
      elapsed: 0,
      runningSince: null,
    };
    timers.push(newTimer);
    fs.writeFile(DATA_FILE, JSON.stringify(timers, null, 4), () => {
      res.setHeader('Cache-Control', 'no-cache');
      res.json(timers);
    });
  });
});

// принимает JSON body  с атрибутами id и start.
// Ищет по хранилищу нужный таймер id и устанавливает runningSince to start
app.post('/api/timers/start', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    const timers = JSON.parse(data);
    timers.forEach((timer) => {
      if (timer.id === req.body.id) {
        timer.runningSince = req.body.start;
      }
    });
    fs.writeFile(DATA_FILE, JSON.stringify(timers, null, 4), () => {
      res.json({});
    });
  });
});

// принимает JSON body с атрибутами id и stop.
// Ищет по хранилищу нужный таймер id, обновляет elapsed в зависимости от того,
// как долго таймер был запущен (stop - runningSince). Устанавливает runningSince to null
app.post('/api/timers/stop', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    const timers = JSON.parse(data);
    timers.forEach((timer) => {
      if (timer.id === req.body.id) {
        const delta = req.body.stop - timer.runningSince;
        timer.elapsed += delta;
        timer.runningSince = null;
      }
    });
    fs.writeFile(DATA_FILE, JSON.stringify(timers, null, 4), () => {
      res.json({});
    });
  });
});

// принимает JSON body с атрибутами id и title / project.
// Ищет по хранилищу нужный таймер id, обновляет title и/или project
app.put('/api/timers', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    const timers = JSON.parse(data);
    timers.forEach((timer) => {
      if (timer.id === req.body.id) {
        timer.title = req.body.title;
        timer.project = req.body.project;
      }
    });
    fs.writeFile(DATA_FILE, JSON.stringify(timers, null, 4), () => {
      res.json({});
    });
  });
});

// принимает JSON body с атрибутом id
// Ищет по хранилищу нужный таймер id и удаляет его
app.delete('/api/timers', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    let timers = JSON.parse(data);
    timers = timers.reduce((memo, timer) => {
      if (timer.id === req.body.id) {
        return memo;
      } else {
        return memo.concat(timer);
      }
    }, []);
    fs.writeFile(DATA_FILE, JSON.stringify(timers, null, 4), () => {
      res.json({});
    });
  });
});





app.get('/molasses', (_, res) => {
  setTimeout(() => {
    res.end();
  }, 5000);
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
