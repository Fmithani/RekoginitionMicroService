const AWS = require("aws-sdk");
const config = require("../config/config");
const tables = require("../config/tables");
const { Response } = require("../config/Util");
const MESSAGE = require("../config/messages");
const Ajv = require("ajv");

const isDev = process.env.NODE_ENV !== "production";

exports.rekognizeImage = async (req, res, next) => {
  const schema = {
    type: "object",
    properties: {
      image_id: { type: "array" },
    },
    required: ["image_id"],
    additionalProperties: false,
  };

  // validate the request
  const ajv = new Ajv();
  const valid = ajv.validate(schema, req.body);
  if (!valid) {
    return Response(
      res,
      false,
      ajv.errors[0].message,
      ajv.errors[0].params,
      422
    );
  }

  if (isDev) {
    AWS.config.update(config.aws_local_config);
  } else {
    AWS.config.update(config.aws_remote_config);
  }

  let _body = req.body;
  let _res = [];
  let _res_error = [];
  let _image_count = image_update_count = 0;

  _body.image_id.map(async (value) => {
    getImageObject(value)
      .then((result) => {
        _image_count++;
        let imageObject = result.Count > 0 ? result.Items[0] : null;

        updateImage(req, res, imageObject)
        .then((success) => {
          
          image_update_count++;

          _res.push(success);

          if (image_update_count >= _body.image_id.length) {
            return Response(res, true, MESSAGE.UPDATED, _res, 200, _res_error);
          }

        })
        .catch((error) => {
          image_update_count++;

          _res_error.push(error);

          if (image_update_count >= _body.image_id.length) {
            return Response(res, true, MESSAGE.UPDATED, _res, 200, _res_error);
          }
        });
      })
      .catch((err) => {
        _image_count++;
      });
  });
};

getImageObject = async (image_id) => {
  return new Promise((resolve, reject) => {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
      TableName: tables.IMAGES,
      FilterExpression: "#field = :data",
      ExpressionAttributeNames: {
        "#field": "_id",
      },
      ExpressionAttributeValues: {
        ":data": image_id,
      },
    };

    docClient.scan(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

updateImage = async (req, res, image) => {

  return new Promise(async (resolve, reject) => {

    image = await getLablesRekognition(image);

    // Face Detection
    let faceKeyword = ["Person", "Human", "Face"];
    let haveFace = faceKeyword.every((i) => image.LabelsArray.includes(i));
    if (haveFace) {
      image = await getFaceRekognition(image);
    }

    var params = {
      TableName: tables.IMAGES,
      Key: {
        _id: image?._id
      },
      AttributeUpdates: {
        labels: {
          Value: image?.LabelsObject
        },
      },
      ReturnValue: "ALL_NEW"
    };

    if (image.FaceDetails != undefined) {
      params.AttributeUpdates.face = {
        Value: image.FaceDetails
      };
    }

    const docClient = new AWS.DynamoDB.DocumentClient();

    docClient.update(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

getLablesRekognition = (imageData) => {
  return new Promise((resolve, reject) => {
    var params = {
      Image: {
        S3Object: {
          Bucket: process.env.BUCKET_S3,
          Name: imageData.file_name,
        },
      },
    };

    imageData.LabelsArray = [];

    const rekognition = new AWS.Rekognition();

    rekognition.detectLabels(params, function (err, data) {
      if (err) {
        reject(imageData);
      } else {
        var labelArray = [];
        var labelObj = {};

        data.Labels.map((obj) => {

          labelObj[obj.Name] = {
            Confidance: obj.Confidence,
            Instances: obj.Instances,
          };

          labelArray.push(obj.Name);

        });
        
        imageData.LabelsArray = labelArray;
        imageData.LabelsObject = labelObj;

        resolve(imageData);
      }
    });
  });
};



getFaceRekognition = (imageData) => {
  return new Promise((resolve, reject) => {
    var params = {
      Image: {
        S3Object: {
          Bucket: process.env.BUCKET_S3,
          Name: imageData.file_name,
        },
      },
    };

    const rekognition = new AWS.Rekognition();

    rekognition.detectFaces(params, function (err, data) {
      if (err) {
        reject(imageData);
      } else {

        imageData.FaceDetails = data.FaceDetails;

        imageData.FaceDetails.forEach(o => {
          delete o.Landmarks;
        });

        resolve(imageData);
      }
    });
  });
};
