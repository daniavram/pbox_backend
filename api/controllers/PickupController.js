/**
 * PickupController
 *
 * @description :: Server-side logic for managing Pickups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


module.exports = {
    getBoxesFromPickup: _getBoxesFromPickup,
	createPickup: _createPickup,
    updateDestination: _updateDestination,
    addBoxToPickup: _addBoxToPickup,
    removeBoxFromPickup: _removeBoxFromPickup,
    removePickup: _removePickup
};

function _removeBoxFromPickup(req, res) {
    
    var pickupIdFromReq = req.params.pickupModelId;
    var boxIdFromReq = req.params.boxId;
    
    sails.models.pickup.findOne({id: pickupIdFromReq}).populate('boxes').then(function(findResult){
        if (findResult.status == "IN PROGRESS") {
            return res.serverError('Cannot delete Box from an IN PROGRESS Pickup');
        } else {
            var localStatus = "";
            if (findResult.status == "READY") {
                if (boxes.length > 1) {
                    localStatus = "READY";
                } else {
                    localStatus = "DRAFT";
                }
            } else if (findResult.status == "PAUSED") {
                //should also take into account current Box position before updating to DELIVERED
                //FIX IT!
                localStatus = "DELIVERED";
            }

            sails.models.box.update({boxId: boxIdFromReq}, {pickupOrder: null}).then(function(updatedBox) {
                sails.models.pickup.update({id: pickupIdFromReq}, {status: localStatus}).then(function(updatedPickup) {
                    console.log('Pickup ' + pickupIdFromReq + ' removed from Box ' + boxIdFromReq);
                    findResult.status = localStatus;
                    return res.json(findResult);
                });
            });
        }  
    });
}

function _removePickup(req, res) {
    
    sails.models.pickup.findOne({id: req.params.pickupModelId}).then(function(findResult) {
        if (findResult.status == "IDLE" || findResult.status == "DRAFT" || findResult.status == "DELIVERED" ) {
            sails.models.pickup.destroy({id: req.params.pickupModelId}).then(function(result) {
                return res.json(result);
            });
        } else {
            return res.serverError('Cannot delete Pickup');
        }
    });
        
}

function _createPickup(req, res) {
    
    var pckpLat = req.body.pickupLatitude;
    var pckpLong = req.body.pickupLongitude;
    var pckSize = req.body.packageSize;
    var pckAdd = req.body.pickupAddress;
    var destAdd = req.body.destinationAddress;
    
    if (req.body.destinationLatitude && req.body.destinationLongitude && destAdd) {
        sails.models.pickup.create(
        {
            pickupLatitude: pckpLat,
            pickupLongitude: pckpLong,
            pickupAddress: pckAdd,
            packageSize: pckSize,
            destinationLatitude: req.body.destinationLatitude,
            destinationLongitude: req.body.destinationLongitude,
            destinationAddress: destAdd,
            status: "DRAFT"
        }).populate('boxes').then(function(result){
            return res.json(result);
        });
    } else {
        sails.models.pickup.create(
        {
            pickupLatitude: pckpLat,
            pickupLongitude: pckpLong,
            pickupAddress: pckAdd,
            packageSize: pckSize,
            status: "IDLE"
        }).populate('boxes').then(function(result){
            return res.json(result);
        });
    }   
}

function _updateDestination(req, res) {
    
    var destLat = req.body.destinationLatitude;
    var destLong = req.body.destinationLongitude;
    var destAdd = req.body.destinationAddress;
    var localStatus = "";
    
    if (destLat == null || destLong == null || destAdd == null) {
        localStatus = "IDLE";
    } else {
        localStatus = "DRAFT";
    }
    
    sails.models.pickup.findOne({ id: req.params.pickupModelId }).populate('boxes').then(function(findResult){
        if (findResult.status == "IDLE") {
            sails.models.pickup.update(
                { id: req.params.pickupModelId },
                {
                    destinationLatitude: destLat,
                    destinationLongitude: destLong,
                    destinationAddress: destAdd,
                    status: localStatus
                }
            ).then(function(result){
                findResult.destinationLatitude = destLat;
                findResult.destinationLongitude = destLong;
                findResult.destinationAddress = destAdd;
                findResult.status = localStatus;
                return res.json(findResult);
            });
        } else {
            res.serverError('Cannot update destination of Pickup. Status not IDLE');
        }
        
    });       
}

function _addBoxToPickup(req, res) {
    
    var pickupIdFromReq = req.params.pickupModelId;
    var boxIdFromReq = req.params.boxId;
    
    sails.models.pickup.findOne({id: pickupIdFromReq}).populate('boxes').then(function(findResult){
        if (findResult.status == "DRAFT" || findResult.status == "READY") {
            sails.models.box.update({boxId: boxIdFromReq, pickupOrder: null}, {pickupOrder: pickupIdFromReq}).then(function(updated){
                if (updated.length > 0) {
                    sails.models.pickup.update({id: pickupIdFromReq}, {status: "READY"}).then(function(result){
                        findResult.status = "READY";
                        return res.json(findResult);
                    });
                } else {
                    return res.serverError('Cannot add Box ' + boxIdFromReq + ' to Pickup ' + pickupIdFromReq);
                }
            });
        } else {
            res.serverError('Invalid opperation. Cannot add Box to a Pickup which is not DRAFT or READY');
        }
    });
}

function _getBoxesFromPickup(req, res) {
    
    sails.models.pickup.findOne({id: req.params.pickupModelId}).populate('boxes').then(function(result){
        if (result) {
            return res.json(result.boxes);   
        } else {
            return res.serverError('Pickup with ID ' + req.params.pickupModelId + ' not found in database');
        }
    });
}