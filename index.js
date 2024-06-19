const express = require("express");
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const person_routes = require('./routes/person_routes');
const item_routes = require('./routes/item_routes');
const cors = require('cors');
const multer = require('multer')
const middlware = require('./middleware/tokenverify')
const path = require('path')
const model = require('./model/model')
const item = require('./model/Items')
const bodyParser = require('body-parser')


const app = express();
const port = 4444;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// Set up static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



const storage= multer.diskStorage({
   
  destination: function (req, file,cb){
       
      cb(null,'uploads')  
  },
  filename: function (req,file,cb){
      cb(null,Date.now() + path.extname(file.originalname))
  }
});

const upload =multer({storage:storage});


app.post('/add', middlware, upload.single('image'), async (req, res) => {
  try {
    const image = req.file ? req.file.filename : undefined;
    const vender = await model.findOne(req.venderid._id);
    const { name, price, message, category, place } = req.body;

    if (!vender) {
      return res.send("vendor not found");
    }

    const newItem = new item({ name, price, message, category, place, image, vendor: vender._id });
    const savedItem = await newItem.save();
    vender.item.push(savedItem);
    await vender.save();
    res.send("product added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding product");
  }
});


dotenv.config();
app.use('/person', person_routes);
app.use('/item', item_routes);

mongoose.connect(process.env.url)
  .then(() => {
    console.log("mongoose connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`server running on port ${port}`);
});
