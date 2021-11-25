'use strict'

const image = require('../controller/image.controller');

const express = require('express');
const router = express.Router();
const validate = require('../middlware/Validate');

const cors = require('cors')
const app = express()
 
app.use(cors())

router.use(validate.Valid);

router.post('/api/image-rekognition', image.rekognizeImage);
router.post('/api/image-rekognition-search', image.rekognizeImageWithoutUpdate);

module.exports = router;