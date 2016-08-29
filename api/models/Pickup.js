/**
 * Pickup.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
      pickupLatitude : { type : 'float' },
      pickupLongitude : { type : 'float' },
      pickupAddress : { type : 'string' },
      destinationLatitude : { type : 'float' },
      destinationLongitude : { type : 'float' },
      destinationAddress : { type : 'string' },
      packageSize : { type : 'string' },
      status : { type : 'string' },
      
      boxes : {
          collection : 'box',
          via : 'pickupOrder'
      }
  }
};

