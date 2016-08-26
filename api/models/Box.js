/**
 * Box.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
      boxId : { type : 'string' },
      buttonAssetId : { type : 'string' },
      gpsAssetId : { type : 'string' },
      temperatureAssetId : { type : 'string' },
      humidityAssetId : { type : 'string' },
      lightAssetId : { type : 'string' },
      accelerometerAssetId : { type : 'string' },
      isBeingDelivered : { type : 'boolean' },
      
      pickupOrder : {
          model : 'pickup'
      }
  }
};

