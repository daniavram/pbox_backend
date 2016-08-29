/**
 * BoxController
 *
 * @description :: Server-side logic for managing Boxes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	createBox: _createBox,
    getBoxById: _getBoxById,
    getPickupForBox: _getPickupForBox,
    removeBoxById: _removeBoxById,
    resumePickupDelivery: _resumePickupDelivery,
    pausePickupDelivery: _pausePickupDelivery
};

function _createBox(req, res) {
    
    sails.models.box.create(
    {   
        boxId: req.body.boxId,
        buttonAssetId: req.body.buttonAssetId,
        gpsAssetId: req.body.gpsAssetId,
        temperatureAssetId: req.body.temperatureAssetId,
        humidityAssetId : req.body.humidityAssetId,
        lightAssetId: req.body.lightAssetId,
        accelerometerAssetId: req.body.accelerometerAssetId,
        isBeingDelivered: false
    }).then(function(result){
        return res.json(result);
    });
}

function _getBoxById(req, res) {
    
    sails.models.box.findOne({boxId: req.params.boxId}).then(function(result){
        return res.json(result);
    });
}

function _getPickupForBox(req, res) {
    
    sails.models.box.findOne({boxId: req.params.boxId}).populate('pickupOrder').then(function(result){
        if (result.pickupOrder) {
            return res.json(result.pickupOrder);
        } else {
            return res.serverError('No Box with ID ' + req.params.boxId + ' found');
        }
    });
}

function _removeBoxById(req, res) {
    
    sails.models.box.destroy({boxId: req.params.boxId, pickupOrder: null}).then(function(result){
        return res.json(result);
    });
}

function _resumePickupDelivery(boxIdParam) {
    sails.models.box.findOne({boxId: boxIdParam}).populate('pickupOrder').then(function(result){
        if (result) {
            sails.models.box.update({boxId: boxIdParam}, {isBeingDelivered: true}).then(function(updated) {
                //box updated to isBeingDelivered == true
            });
            sails.models.pickup.update({id: result.pickupOrder.id}, {status: "IN PROGRESS"}).then(function(updated) {
                //'Pickup updated to IN PROGRESS
                console.log('Resume Pickup Delivery ' + result.pickupOrder.id);
            });
        }
    });
}

function _pausePickupDelivery(boxIdParam) {
    sails.models.box.findOne({boxId: boxIdParam}).populate('pickupOrder').then(function(result){
        if (result) {
            sails.models.box.update({boxId: boxIdParam}, {isBeingDelivered: false}).then(function(updated) {
                //box updated to isBeingDelivered == false
            });
            sails.models.pickup.update({id: result.pickupOrder.id}, {status: "PAUSED"}).then(function(updated) {
                //Pickup updated to PAUSED
                console.log('Pause Pickup Delivery ' + result.pickupOrder.id);
            });
        }
    });
}