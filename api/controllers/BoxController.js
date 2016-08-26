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
    boxButtonPressed: _boxButtonPressed
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
            return res.json();
        }
    });
}

function _removeBoxById(req, res) {
    
    sails.models.box.destroy({boxId: req.params.boxId, pickupOrder: null}).then(function(result){
        return res.json(result);
    });
}

function _boxButtonPressed(boxIdParam) {
        
    sails.models.box.findOne({boxId: boxIdParam}).then(function(result){
        if (result) {
            sails.models.pickup.findOne({id: result.pickupOrder}).then(function(findResult){
                if (findResult) {
                    //this IF is necessary in case there is no Box attached to any Pickup and the button is pressed on the box
                    var localStatus = "";
                    if (findResult.status == "IN PROGRESS") {
                        localStatus = "PAUSED";
                    } else if ( (findResult.status == "READY") || (findResult.status == "PAUSED") ) {
                        localStatus = "IN PROGRESS";
                    }

                    if (result.isBeingDelivered == false) {
                        sails.models.box.update({boxId: boxIdParam}, {isBeingDelivered: true}).then(function(updated){
                            //do nothing for now
                        });
                    }

                    sails.models.pickup.update({id: result.pickupOrder}, {status: localStatus}).then(function(updatedResult){
                        console.log(updatedResult);
                    });
                }
            });
        }
    });
}