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
    
    sails.models.pickup.findOne({id: pickupIdFromReq}).then(function(findResult){
        if (findResult.status != "IN PROGRESS") {
            var pboxesIds = findResult.pboxId;
            var localStatus = "";
            for (let pboxIt of pboxesIds) {
                if (pboxIt == boxIdFromReq) {
                    pboxesIds.splice(pboxesIds.indexOf(pboxIt), 1);

                    if (findResult.status == "READY") {
                        localStatus = "READY";
                        if (pboxesIds.length == 0) {
                            pboxesIds.push("NONE");
                            localStatus = "DRAFT";
                        }
                    }
                    if (findResult.status == "PAUSED") {
                        //should also take into account the location of the box before marking the Pickup as DELIVERED
                        localStatus = "DELIVERED";
                    }
                }
            }
                
                sails.models.box.update({boxId: boxIdFromReq, pickupOrder: pickupIdFromReq}, {pickupOrder: null, isBeingDelivered: false}).then(function(updatedBox){
                    sails.models.pickup.update({id: pickupIdFromReq}, {pboxId: pboxesIds, status: localStatus}).then(function(updated){
                        return res.json(updated);
                    });
                });

                    
        } else {
            res.serverError('Invalid opperation. Cannot remove Box from an IN PROGRESS Pickup');
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
            return res.send('Cannot delete Pickup');
        }
    });
        
}

function _removeBoxFromPickup_v1(req, res) {
    
    var pickupIdFromReq = req.params.pickupModelId;
    var boxIdFromReq = req.params.boxId;

    sails.models.pickup.findOne({id: pickupIdFromReq}).then(function(findResult){
        var pboxUpdatedIds = findResult.pboxId;
        var boxFoundInPickup = false;
        for (let iterator of pboxUpdatedIds) {
            if (iterator == boxIdFromReq) {
                boxFoundInPickup = true;
            }
        }
        if (boxFoundInPickup) {
            sails.models.box.update({boxId: boxIdFromReq}, {pickupOrder: null}).then(function(updated){
                var localStatus = "READY";
                if (pboxUpdatedIds.length == 1) {
                    pboxUpdatedIds[0] = "NONE";
                    localStatus = "DRAFT";    
                } else {
                    if (pboxUpdatedIds[pboxUpdatedIds.length-1] == boxIdFromReq) {
                        pboxUpdatedIds.pop();
                    } else {
                        pboxUpdatedIds.splice(pboxUpdatedIds.indexOf(boxIdFromReq), 1);    
                    }
                    localStatus = "READY";
                }
                sails.models.pickup.update({id: pickupIdFromReq},{pboxId: pboxUpdatedIds, status: localStatus}).then(function(result){
                    //do nothing
                });
                return res.json(updated);
            });
        } else {
            return res.json();
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
            pboxId: ["NONE"],
            destinationLatitude: req.body.destinationLatitude,
            destinationLongitude: req.body.destinationLongitude,
            destinationAddress: destAdd,
            status: "DRAFT"
        }).then(function(result){
            return res.json(result);
        });
    } else {
        sails.models.pickup.create(
        {
            pickupLatitude: pckpLat,
            pickupLongitude: pckpLong,
            pickupAddress: pckAdd,
            packageSize: pckSize,
            pboxId: ["NONE"],
            status: "IDLE"
        }).then(function(result){
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
    
    sails.models.pickup.findOne({ id: req.params.pickupModelId }).then(function(findResult){
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
                    return res.json(result);
            });
        } else {
            res.serverError('Cannot update destination of Pickup. Status not IDLE');
        }
        
    });       
}

function _addBoxToPickup(req, res) {
    
    var pickupIdFromReq = req.params.pickupModelId;
    var boxIdFromReq = req.params.boxId;
    
    sails.models.pickup.findOne({id: pickupIdFromReq}).then(function(findResult){
        if (findResult.status == "DRAFT" || findResult.status == "READY") {
            sails.models.box.update({boxId: boxIdFromReq, pickupOrder: null}, {pickupOrder: pickupIdFromReq}).then(function(updated){
                if (updated.length > 0) {
                    var pboxUpdatedIds = findResult.pboxId;
                    if (pboxUpdatedIds[0] == "NONE") {
                        pboxUpdatedIds[0] = boxIdFromReq;
                    } else {
                        pboxUpdatedIds.push(boxIdFromReq);
                    }
                    sails.models.pickup.update({id: pickupIdFromReq}, {status: "READY", pboxId: pboxUpdatedIds}).then(function(result){
                        return res.json(result);
                    });
                } else {
                    return res.json();
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
            return res.send('Pickup with ID ' + req.params.pickupModelId + ' not found in database');
        }
    });
}