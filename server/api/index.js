// INDEX.JS
const express = require('express')
const app = express()
const path = require('path');
const fs = require('fs');
const faker = require('faker/locale/id_ID');
const FILE_PATH = path.join(__dirname, '../../files');
const csv = require('csv-parser')
var multer = require('multer')
var md5 = require('md5');

var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, FILE_PATH + '/upload/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

var upload = multer({ storage: storage })

app.get('/get-uploaded-files', async (req, res, next) => {
  //requiring path and fs modules

  //joining path of directory
  const directoryPath = FILE_PATH + '/upload';
  //passsing directoryPath and callback function
  var files_arr = await readFilesFromDirectory(directoryPath);

  res.json(files_arr);
});

app.post('/upload', upload.single('file'), async (req, res, next) => {
  res.json({ res: 'Ok!' });
});

app.post('/generate/:platform/:fileName', async (req, res, next) => {
  const fpath = path.join(FILE_PATH, 'upload', req.params.fileName);
  var data = [];

  const category = req.body.category;
  const start_date = req.body.start_date;
  const end_date = req.body.end_date;
  const file_name = req.body.file_name;
  const judul = req.body.judul;
  const content = req.body.content;

  fs.createReadStream(fpath)
    .pipe(csv({ headers: ['wilayah', 'keyword', 'promo'], separator: '|' }))
    .on('data', (row) => {
      data.push(row);
    })
    .on('end', () => {
      if (req.params.platform == 'blogger') {
        res.send(generateBlogspot(data, category, start_date, end_date, file_name, judul, content));
      }
    });

});

function generateBlogspot(data = [], category, start_date, end_date, file_name, judul, content) {
  var res = getXmlTemplateHeader();

  category = category.split(',');
  category = category.map(el => {
    return getXmlTemplateCategory(el);
  })
  category = category.join('\n');


  data.forEach((d, index) => {
    const id = getBloggerId(index);
    const author = getRandomName();
    var post_content = content;
    var date = getRandomtime(new Date(start_date), new Date(end_date));
    var post_title = judul;

    res = res + getXmlTemplateItem(category, id, author, post_content, date, post_title);
  });
  res = res + getXmlTemplateFooter();
  return res;
}

app.delete('/delete/:folderName/:fileName', (req, res, next) => {
  const cpath = path.join(FILE_PATH, req.params.folderName, req.params.fileName);
  fs.unlink(cpath, (res) => {

  });
  res.send('deleted! ' + cpath);
});

function getBloggerId(index = 0) {
  var microtime = (Date.now() % 1000) / 1000;
  return md5(microtime + index);
}

async function readFilesFromDirectory(directoryPath) {
  var files = fs.readdirSync(directoryPath);
  var files_arr = [];
  await Promise.all(files.map(async file => {
    const { birthtime, size } = fs.statSync(directoryPath + '/' + file);
    files_arr.push({ name: file, size: humanFileSize(size), date: birthtime, });
  }));

  return files_arr;
}

function humanFileSize(size) {
  var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
};

function getRandomtime(start, end, mode = 'blogspot') {
  // get the difference between the 2 dates, multiply it by 0-1,
  // and add it to the start date to get a new date
  var diff = end.getTime() - start.getTime();
  var new_diff = diff * Math.random();
  var date = new Date(start.getTime() + new_diff);
  if (mode === 'blogspot') {
    return date.toISOString();
  }

  var iso = date.toISOString().match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/);
  return iso[1] + ' ' + iso[2];
}

function replaceShortcode(string, shortcode, replace) {
  return string.replace(new RegExp(shortcode, "g"), replace);
}

function getRandomName() {
  return faker.name.firstName();
}



function getXmlTemplateHeader() {
  return '<?xml version="1.0" encoding="UTF-8"?> \n' +
    '<ns0:feed xmlns:ns0=http://www.w3.org/2005/Atom">\n' +
    '<ns0:generator>Blogger</ns0:generator> ';
}

function getXmlTemplateItem(post_category = '', id = '', author = '', post_content = '', date = '', post_title = '') {
  return '<ns0:entry> \n' +
    '<ns0:category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/blogger/2008/kind#post" />\n' +
    post_category + '\n' +
    '<ns0:id>' + id + '</ns0:id> \n' +
    '<ns0:author><ns0:name>' + author + '</ns0:name></ns0:author>\n' +
    '<ns0:content type="html"><![CDATA[' + post_content + ']]></ns0:content> \n' +
    '<ns0:published>' + date + '</ns0:published>\n' +
    '<ns0:title type="html"><![CDATA[' + post_title + ']]></ns0:title>\n' +
    '</ns0:entry>\n';
}

function getXmlTemplateCategory(cat = '') {
  return '<ns0:category scheme="http://www.blogger.com/atom/ns#" term="' + cat + '" />';
}

function getXmlTemplateFooter() {
  return '</ns0:feed>';
}
// export the server middleware
module.exports = {
  path: '/api',
  handler: app
}