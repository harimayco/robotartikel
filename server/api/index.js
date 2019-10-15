// INDEX.JS
const express = require('express')
const app = express()
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio')
const faker = require('faker/locale/id_ID');
const FILE_PATH = path.join(__dirname, '../../files');
const EXPORT_FILE_PATH = FILE_PATH + '/export/';
const BLOGGER_EXPORT_FILE_PATH = EXPORT_FILE_PATH + '/blogger/';
const WORDPRESS_EXPORT_FILE_PATH = EXPORT_FILE_PATH + '/wordpress/';
const axios = require('axios');
const csv = require('csv-parser')
var multer = require('multer')
var md5 = require('md5');
var slugify = require('slugify')
var json = require('./dict.json');


const available_headers = ['wilayah', 'keyword', 'promo'];

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

app.get('/test', (req, res, next) => {


  var testing = () => {
    return res.send('waaaaaaw');
  }
  testing();
});


app.get('/get-uploaded-files', async (req, res, next) => {
  //requiring path and fs modules

  //joining path of directory
  const directoryPath = FILE_PATH + '/upload';
  //passsing directoryPath and callback function
  var files_arr = await readFiles(directoryPath);

  res.json(files_arr);
});



app.post('/upload', upload.single('file'), async (req, res, next) => {
  res.json({ res: 'Ok!' });
});

app.post('/generate-article', upload.single('file'), async (req, res, next) => {

  const params = new URLSearchParams();
  params.append("content", req.body.content);
  params.append("submit", 'Spintax 1');
  axios
    .post("http://www.spinnerartikelindonesia.com/", params)
    .then(result => {
      const $ = cheerio.load(result.data);
      res.send($('textarea[name="spintax"]').text());
    })
    .catch(err => {
      res.send('error');
    });
});

app.post('/generate/:platform/:fileName', async (req, res, next) => {
  app.locals.export_filename = '';
  app.locals.exported = [];
  app.locals.export_path = '';

  const fpath = path.join(FILE_PATH, 'upload', req.params.fileName);
  var data = [];

  const category = req.body.category;
  const start_date = req.body.start_date;
  const end_date = req.body.end_date;
  const file_name = req.body.file_name ? '-' + req.body.file_name : '';
  const judul = req.body.judul;
  const content = req.body.content;
  const plat = '-' + req.params.platform;
  const tags = req.body.tags;
  const status = req.params.status;

  fs.createReadStream(fpath)
    .pipe(csv({ headers: available_headers }))
    .on('data', (row) => {
      if (row.wilayah != '' && row.keyword != '' && row.promo != '') {
        data.push(row);
      }

    })
    .on('end', async () => {
      var split_data = chunkArray(data, 1000);
      //console.log(split_data.length);
      let ex_path = '';
      if (req.params.platform == 'blogger') {
        /* empty file first */
        //console.log(split_data);

        for (i = 1; i <= split_data.length; i++) {
          var fn = changeExtension(req.params.fileName, plat + file_name + '-' + i + '.xml');
          app.locals.export_filename = path.join(BLOGGER_EXPORT_FILE_PATH, fn);
          var r = fs.writeFileSync(app.locals.export_filename, '');
          await generateXml(split_data[i - 1], category, start_date, end_date, file_name, judul, content);
          fs.appendFileSync(app.locals.export_filename, getXmlTemplateFooter(req.params.platform) + '\n');
          app.locals.exported.push(fn);
        }
        ex_path = BLOGGER_EXPORT_FILE_PATH;


      } else {
        for (i = 1; i <= split_data.length; i++) {
          var fn = changeExtension(req.params.fileName, plat + file_name + '-' + i + '.xml');
          app.locals.export_filename = path.join(WORDPRESS_EXPORT_FILE_PATH, fn);
          var r = fs.writeFileSync(app.locals.export_filename, '');
          //console.log(tags);
          await generateXml(split_data[i - 1], category, start_date, end_date, file_name, judul, content, tags, status, req.params.platform);
          fs.appendFileSync(app.locals.export_filename, getXmlTemplateFooter(req.params.platform) + '\n');
          app.locals.exported.push(fn);
        };

        ex_path = WORDPRESS_EXPORT_FILE_PATH;
      }

      var result_files = await readFiles(ex_path, app.locals.exported);
      res.json(result_files);
    });

});




async function generateXml(data = [], category, start_date, end_date, file_name, judul, content, tags = '', status = 'draft', platform = 'blogger') {

  var result = getXmlTemplateHeader(platform);

  fs.appendFileSync(app.locals.export_filename, result);

  if (category) {
    category = category.split(',');
  }
  if (tags) {
    tags = tags.split(',');
  }

  data.forEach(async (d, index) => {

    const id = getBloggerId(index);
    const author = getRandomName();
    var post_content = spintax(replaceShortcode(content, d));
    var date = getRandomtime(new Date(start_date), new Date(end_date), platform);
    var cat_res = '';
    var tag_res = '';
    if (category.length) {
      category = await category.map(el => {
        return getXmlTemplateCategory(el, platform);
      })
      cat_res = category.join('\n');
    }
    //console.log(tags);
    if (tags.length) {

      tags = await tags.map(e => {
        return getXmlTemplateTags(e);
      })
      tag_res = tags.join('\n');
    }

    var post_title = spintax(replaceShortcode(judul, d));
    cat_res = replaceShortcode(cat_res, d);
    tag_res = replaceShortcode(tag_res, d);
    var result = getXmlTemplateItem(cat_res, id, author, post_content, date, post_title, tag_res, status, platform);
    fs.appendFileSync(app.locals.export_filename, result);

  });


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

function changeExtension(str, ext) {
  return str.substr(0, str.lastIndexOf(".")) + ext;

}

async function readFiles(directoryPath, filenames = null) {
  var files = fs.readdirSync(directoryPath);
  if (filenames) {
    files = filenames;
  }
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

function getRandomtime(start, end, mode = 'blogger') {

  // get the difference between the 2 dates, multiply it by 0-1,
  // and add it to the start date to get a new date
  var diff = end.getTime() - start.getTime();
  var new_diff = diff * Math.random();
  var date = new Date(start.getTime() + new_diff);
  if (mode === 'blogger') {
    return date.toISOString();
  }

  var iso = date.toISOString().match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/);
  return iso[1] + ' ' + iso[2];
}

function replaceShortcode(string, d) {
  string = string.replace(/\[[^\[]*keyword[^\]]*\]/ig, d.keyword.trim());
  string = string.replace(/\[[^\[]*wilayah[^\]]*\]/ig, d.wilayah.trim());
  string = string.replace(/\[[^\[]*promo[^\]]*\]/ig, d.promo.trim());
  return string;
}

function getRandomName() {
  return faker.name.firstName();
}

function chunkArray(myArray, chunk_size) {
  var results = [];

  while (myArray.length) {
    results.push(myArray.splice(0, chunk_size));
  }

  return results;
}



function getXmlTemplateHeader(platform = 'blogger') {
  let header = '';
  if (platform == 'blogger') {
    header = '<?xml version="1.0" encoding="UTF-8"?> \n' +
      '<ns0:feed xmlns:ns0="http://www.w3.org/2005/Atom">\n' +
      '<ns0:generator>Blogger</ns0:generator> \n';
  } else {
    header = '<?xml version="1.0" encoding="UTF-8" ?> \n ' +
      '<rss version="2.0"\n' +
      'xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"\n' +
      'xmlns:content="http://purl.org/rss/1.0/modules/content/"\n' +
      'xmlns:wfw="http://wellformedweb.org/CommentAPI/"\n' +
      'xmlns:dc="http://purl.org/dc/elements/1.1/"\n' +
      'xmlns:wp="http://wordpress.org/export/1.2/">\n' +
      '<channel>\n' +
      '<wp:wxr_version>1.2</wp:wxr_version>\n' +
      '<generator>https://wordpress.org/?v=4.7.3</generator>\n';
  }

  return header;
}

function getXmlTemplateItem(post_category = '', id = '', author = '', post_content = '', date = '', post_title = '', tags = '', status = 'draft', platform = 'blogger') {
  let item = '';
  if (platform == 'blogger') {
    item = '<ns0:entry> \n' +
      '<ns0:category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/blogger/2008/kind#post" />\n' +
      post_category + '\n' +
      '<ns0:id>' + id + '</ns0:id> \n' +
      '<ns0:author><ns0:name>' + author + '</ns0:name></ns0:author>\n' +
      '<ns0:content type="html"><![CDATA[' + post_content + ']]></ns0:content> \n' +
      '<ns0:published>' + date + '</ns0:published>\n' +
      '<ns0:title type="html"><![CDATA[' + post_title + ']]></ns0:title>\n' +
      '</ns0:entry>\n';
  } else {
    item = '<item>\n' +
      '<title>' + post_title + '</title>\n' +
      '<dc:creator><![CDATA[' + author + ']]></dc:creator>\n' +
      '<content:encoded><![CDATA[' + post_content + ']]></content:encoded>\n' +
      '<wp:post_date><![CDATA[' + date + ']]></wp:post_date>\n' +
      '' + tags + '\n' +
      '' + post_category + '\n' +
      '<wp:status><![CDATA[' + status + ']]></wp:status>\n' +
      '<wp:post_type><![CDATA[post]]></wp:post_type>\n' +
      '</item>';
  }

  return item;
}


function getXmlTemplateCategory(cat = '', platform = 'blogger') {
  cat = spintax(cat);
  let category = '';
  if (platform == 'blogger') {
    category = '<ns0:category scheme="http://www.blogger.com/atom/ns#" term="' + cat + '" />';
  } else {
    let cat_slug = slugify(cat);
    category = '<category domain="category" nicename="' + cat_slug + '"><![CDATA[' + cat + ']]></category>';
  }

  return category;
}

function getXmlTemplateTags(tag = '') {


  if (tag == '') {
    return '';
  }
  tag = spintax(tag);
  let tag_slug = slugify(tag);
  return '<category domain="post_tag" nicename="' + tag_slug + '"><![CDATA[' + tag + ']]></category>';

}

function getXmlTemplateFooter(platform = 'blogger') {
  let footer = '';
  if (platform == 'blogger') {
    footer = '</ns0:feed>';
  } else {
    footer = '</channel></rss>';
  }
  return footer;
}

function spintax(text) {

  var matches, options, random;

  var regEx = new RegExp(/{([^{}]+?)}/);

  while ((matches = regEx.exec(text)) !== null) {
    options = matches[1].split("|");
    random = Math.floor(Math.random() * options.length);
    text = text.replace(matches[0], options[random]);
  }
  return text;
}
// export the server middleware
module.exports = {
  path: '/api',
  handler: app
}
