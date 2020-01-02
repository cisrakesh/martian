// Login controller , all function related to login should reside here

const mongoose = require('mongoose');
const { Ration} = require('../models/ration');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
var async = require("async");
var dateFormat = require('dateformat');
const connUri = process.env.MONGO_LOCAL_CONN_URL;

var getFoodRationPackets = function (callback) {
    Ration.find({ "packageType": "Food" }, null, { sort: { expiryDate: 1, calories: -1 } }, (err, foodRations) => {
        if (!err) {
            var totalAvailableCalory=0;
            async.forEachOf(foodRations, function (eachPacket, key, forEachCallback) {
                totalAvailableCalory = parseInt(totalAvailableCalory)+ parseInt(eachPacket.calories);
                eachPacket.expiryDateTs = new Date(new Date(eachPacket.expiryDate).toDateString()).getTime();
                forEachCallback();
            }, function (err) {
                if (err) console.log(err, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                callback(null, { "packets": foodRations, "totAvailableCalory": totalAvailableCalory });
            });
            
        } else {
            callback(err);
        }
    });
};

var getWaterRationpackets = function (callback) {
    Ration.find({ "packageType": "Water" }, (err, waterRations) => {
        if (!err) {
            var totalAvailableWater = 0;
            async.forEachOf(waterRations, function (eachPacket, key, forEachCallback) {
                totalAvailableWater += parseInt(eachPacket.liters);
                forEachCallback();
            }, function (err) {
                if (err) console.log(err, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                callback(null, { "packets": waterRations, "totAvailableWater": totalAvailableWater });
            });
            
        } else {
            callback(err);
        }
    });
};

var findFoodPacket = function (foodRationObject, neddedCalory, whilstCallback){
    var tempRationObject = { foodRation: [], totAvailableCalory:0};
    var rationForDay=[];
    //console.log(foodRationObject);
    async.forEachOf(foodRationObject.foodRation, function (eachPacket, key, forEachCallback) {
        
        //if needed calory is more then availaible calory , nothing can be done 
        if (neddedCalory > foodRationObject.totAvailableCalory){
            forEachCallback("done");
            //if packet calory is eqaul to needed calory
        }else if (eachPacket.calories == neddedCalory){
            
            neddedCalory -= parseInt(eachPacket.calories);
            rationForDay.push(eachPacket);
            forEachCallback("done");
            //if packet calory is less then needed calory
        } else if (eachPacket.calories <= neddedCalory){
            neddedCalory -= parseInt(eachPacket.calories);
            rationForDay.push(eachPacket);
            //forEachCallback("done");
        }else{
            tempRationObject.foodRation.push(eachPacket);
            tempRationObject.totAvailableCalory += parseInt(eachPacket.calories)
            forEachCallback();    
        }
        
    }, function (err) {
        //if (err) console.log(err, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        
    });
    
    return { neddedCalory: neddedCalory, rationForDay: rationForDay, tempRationObject: tempRationObject, whilstCallback:whilstCallback };
    
};

var createSchedule=function(rationListObjectParam, callback){
    var rationSchedule = [];
    var dayRation=[];
    var neededCalory=2500;
    var rationListObject = rationListObjectParam;
    
    var i=0;
    console.log(rationListObject.foodRation.length);
    async.whilst(function test(cb) {
        cb(null, (rationListObject.foodRation.length > 0 &&  rationListObject.waterRation.length > 0));
    },function(whilstCallback){
        console.log(rationListObject.foodRation.length+" > 0 && "+rationListObject.waterRation.length+" > 0");
        
        var something = findFoodPacket(rationListObject, neededCalory,whilstCallback);
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>");
        console.log(91, something);
        console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
        rationListObject.foodRation = something.tempRationObject.foodRation;
        rationListObject.totAvailableCalory = something.tempRationObject.totAvailableCalory;
        dayRation = dayRation.concat(something.rationForDay);
        neededCalory = something.neddedCalory;
        if (something.neddedCalory<=0){
            rationSchedule.push(dayRation);
            neededCalory=2500;
            dayRation=[];
        }
        something.whilstCallback();
    },function(err,data){
        if (err) console.log(err);
        
        console.log(rationListObject.foodRation.length);
        
        callback(null, rationSchedule);
    });
    
    
};

var findFoodPacketSeries = function (rationListObjectParam, rationDayTs, neededCalory, parentWhileCallback){
    var dayRation = [];
    var rationListObject = rationListObjectParam;
    var remaningRationObject = { foodRation: [], totAvailableCalory: 0 };
    var scheduleAble=true;
    
    async.series(
        [
            function(seriesCB){
                //get food packet whose expiry equals to rationDayTs
                async.forEachOf(rationListObject.foodRation, function (eachPacket, key, forEachCallback) {
                        //if needed calory is more then availaible calory , nothing can be done 
                    if (neededCalory > rationListObject.totAvailableCalory && rationDayTs == eachPacket.expiryDateTs) {
                        //return forEachCallback("done");
                        //if packet calory is eqaul to needed calory
                    } else if (neededCalory > 0 && rationDayTs == eachPacket.expiryDateTs){
                        dayRation.push(eachPacket);
                        neededCalory -= parseInt(eachPacket.calories);
                        
                    } else if (eachPacket.expiryDateTs>rationDayTs){
                        remaningRationObject.foodRation.push(eachPacket);
                        remaningRationObject.totAvailableCalory += parseInt(eachPacket.calories)
                        
                    }
                    forEachCallback();
                }, function (err) {
                    if (err){
                        scheduleAble=false;
                    } 
                    rationListObject.foodRation = remaningRationObject.foodRation;
                    rationListObject.totAvailableCalory = remaningRationObject.totAvailableCalory;
                    remaningRationObject = { foodRation: [], totAvailableCalory: 0 };
                    seriesCB();
                });
                
            },
            function (seriesCB){
                //get food packet which get fits exactly to the needed callory
                async.forEachOf(rationListObject.foodRation, function (eachPacket, key, forEachCallback) {
                    if (eachPacket.calories == neededCalory) {
                        neededCalory = neededCalory - parseInt(eachPacket.calories);
                        dayRation.push(eachPacket);
                    } else {
                        remaningRationObject.foodRation.push(eachPacket);
                        remaningRationObject.totAvailableCalory += parseInt(eachPacket.calories);
                        
                    }
                    forEachCallback();
                }, function (err) {
                    if (err) {
                        scheduleAble = false;
                    }
                    
                    rationListObject.foodRation = remaningRationObject.foodRation;
                    rationListObject.totAvailableCalory = remaningRationObject.totAvailableCalory;
                    remaningRationObject = { foodRation: [], totAvailableCalory: 0 };
                    seriesCB();
                });
                
            },
            function (seriesCB){
                
                if (rationListObject.foodRation.length > 0 && neededCalory>0){
                    var selectedKey = "";
                    var caloryDiff = neededCalory;
                    console.log(rationListObject.foodRation);
                    async.forEachOf(rationListObject.foodRation, function (eachPacket, key, forEachCallback) {
                        var currCaloryDiff = neededCalory - eachPacket.calories;
                        if (selectedKey==""){
                            selectedKey = key;
                            caloryDiff = currCaloryDiff;
                        } else if (currCaloryDiff == 0 && currCaloryDiff != caloryDiff){
                            selectedKey = key;
                            caloryDiff = currCaloryDiff;
                        } else if (currCaloryDiff < 0 && currCaloryDiff > caloryDiff){
                            selectedKey = key;
                            caloryDiff = currCaloryDiff;
                        } else if (currCaloryDiff > 0 && currCaloryDiff > caloryDiff){
                            selectedKey = key;
                            caloryDiff = currCaloryDiff;
                        }
                                               
                        forEachCallback();
                    }, function (err) {
                        if (err) {
                            scheduleAble = false;
                        }
                        
                        //if (selectedKey!=""){
                            dayRation.push(rationListObject.foodRation[selectedKey]);
                            neededCalory -= parseInt(rationListObject.foodRation[selectedKey].calories);
                            rationListObject.totAvailableCalory -= parseInt(rationListObject.foodRation[selectedKey].calories);
                            rationListObject.foodRation.splice(selectedKey, 1);
                            remaningRationObject = { foodRation: rationListObject.foodRation, totAvailableCalory: rationListObject.totAvailableCalory };    
                            
                        //}
                        
                        seriesCB();
                    });    
                    
                }else{
                    remaningRationObject = { foodRation: rationListObject.foodRation, totAvailableCalory: rationListObject.totAvailableCalory };    
                    seriesCB();
                    
                }
                
            },
            function (seriesCB){
                
                if (neededCalory > 0 && rationListObjectParam.totAvailableCalory > neededCalory){
                    var x = findFoodPacketSeries(rationListObject, rationDayTs, neededCalory, seriesCB);
                    remaningRationObject.foodRation = x.remaningRationObject.foodRation;
                    remaningRationObject.totAvailableCalory = x.remaningRationObject.totAvailableCalory;
                    //console.log(neededCalory+ ">>>>>>>>>>" + x.dayRation + "------------" + dayRation + "<<<<<<<<<<<<<<<<");
                    dayRation = dayRation.concat(x.dayRation);
                    
                    neededCalory = x.neededCalory;
                    x.whileCallbackOne();
                }else{
                    seriesCB();
                }
            }
        ], function (error, data) {
                
                if (error) {
                    
                } 
                
            }
        );
        
    return { "whileCallbackOne": parentWhileCallback, scheduleAble: scheduleAble, rationDayTs: rationDayTs, remaningRationObject: remaningRationObject, neededCalory: neededCalory, dayRation: dayRation };
}

var findWaterPacketSeries = function (rationListObjectParam, dayRation, neededWater, parentWhileCallback) {
    //var dayRation = [];
    var rationListObject = rationListObjectParam;
    var remaningRationObject = { waterRation: [], totAvailableWater: 0 };

    async.series(
        [
            
            function (seriesCB) {
                //get water packet which get fits exactly to the needed water
                async.forEachOf(rationListObject.waterRation, function (eachPacket, key, forEachCallback) {
                    if (eachPacket.liters == neededWater) {
                        neededWater = neededWater - parseInt(eachPacket.liters);
                        dayRation.push(eachPacket);
                    } else {
                        remaningRationObject.waterRation.push(eachPacket);
                        remaningRationObject.totAvailableWater += parseInt(eachPacket.liters);

                    }
                    forEachCallback();
                }, function (err) {
                   

                    rationListObject.waterRation = remaningRationObject.waterRation;
                    rationListObject.totAvailableWater = remaningRationObject.totAvailableWater;
                    remaningRationObject = { waterRation: [], totAvailableWater: 0 };
                    seriesCB();
                });

            },
            function (seriesCB) {

                if (rationListObject.waterRation.length > 0 && neededWater > 0) {
                    var selectedKey = "";
                    var waterDiff = neededWater;
                    async.forEachOf(rationListObject.waterRation, function (eachPacket, key, forEachCallback) {
                        var currWaterDiff = neededWater - parseInt(eachPacket.liters);
                        if (selectedKey == "") {
                            selectedKey = key;
                            waterDiff = currWaterDiff;
                        } else if (currWaterDiff == 0 && currWaterDiff != waterDiff) {
                            selectedKey = key;
                            waterDiff = currWaterDiff;
                        } else if (currWaterDiff < 0 && currWaterDiff > waterDiff) {
                            selectedKey = key;
                            waterDiff = currWaterDiff;
                        } else if (currWaterDiff > 0 && currWaterDiff > waterDiff) {
                            selectedKey = key;
                            waterDiff = currWaterDiff;
                        }

                        forEachCallback();
                    }, function (err) {
                        

                        //if (selectedKey!=""){
                        dayRation.push(rationListObject.waterRation[selectedKey]);
                        neededWater -= parseInt(rationListObject.waterRation[selectedKey].liters);
                        rationListObject.totAvailableWater -= parseInt(rationListObject.waterRation[selectedKey].liters);
                        rationListObject.waterRation.splice(selectedKey, 1);
                        remaningRationObject = { waterRation: rationListObject.waterRation, totAvailableWater: rationListObject.totAvailableWater };

                        //}

                        seriesCB();
                    });

                } else {
                    remaningRationObject = { waterRation: rationListObject.waterRation, totAvailableWater: rationListObject.totAvailableWater };
                    seriesCB();

                }

            },
            function (seriesCB) {

                if (neededWater > 0 && rationListObjectParam.totAvailableWater >= neededWater) {
                    var x = findWaterPacketSeries(rationListObject, dayRation, neededWater, seriesCB);
                    remaningRationObject.waterRation = x.remaningRationObject.waterRation;
                    remaningRationObject.totAvailableWater = x.remaningRationObject.totAvailableWater;
                    //console.log(neededCalory+ ">>>>>>>>>>" + x.dayRation + "------------" + dayRation + "<<<<<<<<<<<<<<<<");
                    //dayRation = dayRation.concat(x.dayRation);
                    dayRation = x.dayRation;

                    neededWater = x.neededWater;
                    x.whileCallbackOne();
                } else {
                    seriesCB();
                }
            }
        ], function (error, data) {

            if (error) {

            }

        }
    );

    return { "whileCallbackOne": parentWhileCallback, remaningRationObject: remaningRationObject, neededWater: neededWater, dayRation: dayRation };
}
module.exports = {
    validate:(method)=>{
        console.log(method.body);
        switch (method) {

            case 'createUser': {
                return [
                    check('name', "userName is required").exists(),
                    check('password', "Password is required").exists(),
                    check('roleId', "Role is required").exists(),
                    check('email', 'Invalid email').exists().isEmail(),
                    check('phone').optional().isInt(),
                    check('status').optional().isIn(['enabled', 'disabled']),
                ];
                break;
            }
            case 'updatePassword':{
                
                return [
                    check('oldPassword', "Old Password is required").exists().isLength({min:1}),
                    check('password', "Password is required").exists().isLength({ min: 1 }),
                    check('confPassword', "Confirm Password is required").exists().isLength({ min: 1 }),
                    check('confPassword', "Confirm password is not same is Password").custom((confPassword,{req,loc,path}) => {
                        if (confPassword !== req.body.password) {
                            // throw error if passwords do not match
                            return false;
                        } else {
                            return true;
                        }
                    })
                ]   
            }
        }
    },
    add: (req, res) => {
        
        let result = {};
        let status = 201;
        
        const rationModel = new Ration(); // document = instance of a model
        rationModel.rationId = req.body.packetId;
        rationModel.packageType = req.body.packetType;
        if (rationModel.packageType=="Food"){
            rationModel.packgeContent = req.body.packetContent;
            rationModel.calories = req.body.calories;
            rationModel.expiryDate = req.body.expiryDate;
        } else if (rationModel.packageType == "Water"){
            rationModel.liters = req.body.liters;    
        }else{
            status = 402;
            result.status = status;
            result.error = 'Package Type is required';
            res.status(status).send(result);
        }
        
        
        
        rationModel.save((err, ration) => {
            if (!err) {
                result.status = status;
                result.message="Ration Added succesfully!";
                result.result = ration;
            } else {
                status = 500;
                result.status = status;
                result.error = err;
            }
            res.status(status).send(result);
        });
        
        
    },
    getAll: (req, res) => {
        //mongoose.connect(connUri, { useNewUrlParser: true,useUnifiedTopology: true }, (err) => {
        Ration.find({}, (err, rations) => {
            if (!err) {
                res.send(rations);
            } else {
            console.log('Error', err);
            }
        });
        //});
    },
    updateCurrentUser: (req, res)=>{
        const payload = req.decoded;
        
        var result={};
        if(payload){
            User.findByIdAndUpdate(payload._id, req.body, function (err, updateRes) {

                if (err) {
                    status=401;
                    result.error=err;
                }else if(updateRes !==null){
                    status = 200;
                    result.message = 'User updated successfully';
                }else {
                    console.log(updateRes);
                    status = 404;
                    result.message = 'Unable to update , Please try again later';
                }
                result.status = status;
                res.status(status).send(result);
            });
        }else{
            status = 404;
            result.status=status;
            result.error = 'User not found';
            res.status(status).send(result);
        }
    },
    updatePassword:(req,res)=>{
        const payload = req.decoded;
        var result = {};
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send({ errors: errors.array(),message : 'Something Went wrong , please try again later' })
        }
        
        let status = 200;
        
        User.findOne({ _id: payload._id }, (err, user) => {
            
            if (!err && user) {
                // We could compare passwords in our model instead of below
                bcrypt.compare(req.body.oldPassword, user.password).then(match => {
                    if (match) {
                        status = 200;
                        
                        user.password = user.generateHash(req.body.password);
                    
                        user.save(function (err) {
                            if (err) {
                                status = 422;
                                result.err = err;
                                result.message = "Something Went wrong , Please try again later!";
                                res.status(status).send(result);
                            }else{
                                result.message = "Password Updated successfuly";
                                user.password = "";
                                delete user.password;
                                result.result = user;
                                res.status(status).send(result);
                            }
                        });
                        
                    } else {
                        status = 422;
                        result.status = status;
                        result.message = "Password dosen't matched";
                        res.status(status).send(result);
                    }
                    //res.status(status).send(result);
                }).catch(err => {
                    status = 500;
                    result.status = status;
                    result.err = err;
                    result.message = "Something Went wrong , Please try again later!";
                    res.status(status).send(result);
                });
            } else {
                status = 422;
                result.status = status;
                result.error = err;
                result.message = "Something Went wrong , Please try again later!";
                res.status(status).send(result);
            }
        });
    },
    deleteRation:(req,res)=>{
        let result = {};
        let status = 201;
        console.log(req);
        Ration.remove({ _id: req.query.id }, function (err) {
            if (!err) {
                result.status = status;
                result.message = "Ration deleted succesfully!";
                
            }
            else {
                status = 500;
                result.status = status;
                result.error = err;
            }
            res.status(status).send(result);
        });
    },
    
    getSchedule:(req,res)=>{
       
        var status = 201;
        var rationListObject="";
        var result={};
        var rationSchedule = {};
        async.series(
            [
                function (seriesCallback) {
                    
                    async.parallel({
                        foodRation: getFoodRationPackets,
                        waterRation: getWaterRationpackets
                    }, function (err, rationList) {
                        rationListObject = { "foodRation": rationList.foodRation.packets,
                                            "waterRation": rationList.waterRation.packets, 
                                            "totAvailableCalory": rationList.foodRation.totAvailableCalory,
                                            "totAvailableWater": rationList.waterRation.totAvailableWater};
                        if (!err) {
                            seriesCallback(null, rationList);
                        } else {
                            seriesCallback(err);
                        }
                    });
                },
                function (seriesCallback) {
                    
                    forday = new Date().getTime();
                    var rationForDay=new Date(new Date().toDateString()).getTime();
                    
                   // callback(null, forday);
                    
                    async.whilst(function test(cb) {
                        cb(null, (rationListObject.foodRation.length > 0 && rationListObject.totAvailableCalory >= 2500 && rationListObject.waterRation.length > 0 && rationListObject.totAvailableWater >= 2));
                        //cb(null, (i<=2));
                    }, function (whilstCallBackOne) {
                        var x = findFoodPacketSeries(rationListObject, rationForDay, 2500, whilstCallBackOne);
                        rationListObject.foodRation = x.remaningRationObject.foodRation;
                        rationListObject.totAvailableCalory = x.remaningRationObject.totAvailableCalory;
                        //rationSchedule[rationForDay] = x.dayRation;
                        
                        
                        var y = findWaterPacketSeries(rationListObject, x.dayRation, 2, x.whileCallbackOne);
                        rationListObject.waterRation = y.remaningRationObject.waterRation;
                        rationListObject.totAvailableWater = y.remaningRationObject.totAvailableWater;
                        rationSchedule[rationForDay] = y.dayRation;
                        rationForDay += parseInt((24 * 60 * 60 * 1000));
                        y.whileCallbackOne();
                        //schedulingStatus.whilstCallBackOne();
                    },function(err,data){
                        seriesCallback(null,rationSchedule);    
                    });
                    //createSchedule(rationListObject, seriesCallback);
                }
            ], function (error, data) {
                
                if (error) {
                    status = 500;
                    result.status = status;
                    result.error = err;
                } else {
                    result.status = status;
                    result.message = "Ration Added succesfully!";
                    result.result = data[1];
                }
                //console.log(result)
                res.status(status).send(result);
            }
        );
    }
}