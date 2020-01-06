// Login controller , all function related to login should reside here

const mongoose = require('mongoose');
const { Ration} = require('../models/ration');
const { check, validationResult, oneOf, sanitize } = require('express-validator');
var async = require("async");
var dateFormat = require('dateformat');
const connUri = process.env.MONGO_LOCAL_CONN_URL;

var self=module.exports = {
    //validate method , which returns a middleware to check the validation of the fields
    validate:(method)=>{
        switch (method) {
            //for adding ration
            case 'addRation': {
                return [
                    check('packetId', "Packet Id should have atleast one character").isLength({ min: 1 }),
                    check('packetId', "packet Id is required").exists(),
                    check('packetType', "Packet Type is required").exists(),
                    check('packetType', "Packet type should be Food or Water").isIn(['Food', 'Water']),
                    
                    oneOf([
                        [
                            check('packetType', "Packet Type should be food").equals("Food"),
                            check('packetContent', "packet Content is required").exists().isLength({min:1}),
                            sanitize('calories').toInt(),
                            check('calories', "Calories is required").exists().isLength({ min: 1 }),
                            check('calories', "Calories should be between 1 to 2500").isInt({ min: 1 ,max:2500}),
                            check('expiryDate', "Expiry date is required").exists().isLength({ min: 1 })
                            
                        ],
                        [
                            check('liters', "Water quantity is required and should be number").exists().isLength({ min: 1 }),
                            check('liters', "Water quantity should be greter between 0 to 2").isInt({ min: 1, max: 2}),
                            check('packetType', "Packet Type should be water").equals("Water")
                        ]
                        
                    ], "Please Fill Out All Fields"),
                    
                ];
                break;
            
            }
            case 'deleteRation': {
                return [
                check('id', "Id is required").exists(),
                check('id', "Id should have atleast one character").isLength({ min: 1 })
                ];
                break;
            }
            
        }
        
    },
    add: (req, res) => {
        
        let result = {};
        let status = 201;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send({ errors: errors.array(), message: 'Something Went wrong , please try again later' })
        }
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
        
        
        //save ration
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
        let result = {};
        let status = 201;
        //get all type of ration
        Ration.find({}, (err, rations) => {
            if (!err) {
                res.status(status).send(rations);
            } else {
                status = 500;
                result.status = status;
                result.error = err;
                res.status(status).send(result);
            }
        });
        
    },
    deleteRation:(req,res)=>{
        let result = {};
        let status = 201;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send({ errors: errors.array(), message: 'Something Went wrong , please try again later' })
        }
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
    //function prepare schedule of the martian
    getSchedule:(req,res)=>{
       
        var status = 201;
        var rationListObject="";
        var result={};
        var rationSchedule = {};
        
        //if start of schedule is not provided get todays date as default
        if (typeof req.query.startDate=="undefined" || req.query.startDate === null || req.query.startDate==""){
            var startDate=new Date(new Date().toDateString()).getTime();
        }else{
            var startDate=parseInt(req.query.startDate);  
            startDate=new Date(new Date(startDate).toDateString()).getTime();  
        }
        
        //start a series of async functions, as all of them are depended on the result of previous functions
        async.series(
            [
                
                function (seriesCallback) {
                    
                    async.parallel({
                        foodRation: self.getFoodRationPackets.bind(null,startDate), //get all food packets
                        waterRation: self.getWaterRationpackets //get all water packets
                    }, function (err, rationList) {
                        //create a generalised object of the packets which will be used for the rationing
                        rationListObject = { "foodRation": rationList.foodRation.packets,
                                            "waterRation": rationList.waterRation.packets, 
                                            "totAvailableCalory": rationList.foodRation.totAvailableCalory,//total available calories from all food packets
                                            "totAvailableWater": rationList.waterRation.totAvailableWater //total available water from all the packets
                                        };
                        if (!err) {
                            seriesCallback(null, rationList);
                        } else {
                            seriesCallback(err);
                        }
                    });
                },
                function (seriesCallback) {  //begin rationing
                    
                    
                    var rationForDay=startDate; //start date of teh rationing
                    //new Date(new Date(startDate).toDateString()).getTime();
                    
                   
                    /*execution of async while loop , untill food packets are available 
                    *along with available calory should be greater or equal to 2500
                    *water packets should also be available
                    * and those water packets should be providing more then or qual to 2 liters
                    * this loop will fetch rations to be utilised per day
                    */
                    async.whilst(function test(cb) {
                        cb(null, (rationListObject.foodRation.length > 0 && rationListObject.totAvailableCalory >= 2500 && rationListObject.waterRation.length > 0 && rationListObject.totAvailableWater >= 2));
                        //cb(null, (i<=2));
                    }, function (whilstCallBackOne) {
                        /*
                        *call function which will fetch the needed food packet , which wil let martian survive for the day.
                        * as a parameter we are passing :-
                        * param 1(rationListObject): currently available list of ration packets
                        * param 2(rationForDay):Time stamp of the day , for which rationing is getting done
                        * param 3 (): Needed calories to sruvive the day
                        * param 4 (whilstCallBackOne) : call back function which ensure the loop is finished completely.
                        * it will return a object which contains the food packets available ,and calories available from them. 
                        * And contains array of food packets which has to be consumed for the given day
                        */
                        var neededFoodPckts = self.findFoodPacketSeries(rationListObject, rationForDay, 2500, whilstCallBackOne);
                        
                        //reset ration list with unused food packets , it will be used in next days/loops
                        rationListObject.foodRation = neededFoodPckts.remaningRationObject.foodRation; 
                        //reset the available colory with remaning calory , will be used in next days/loops
                        rationListObject.totAvailableCalory = neededFoodPckts.remaningRationObject.totAvailableCalory;
                        
                        
                        /*
                        * call a function which will fetch the needed water packets to let martion survive for the day
                        * as a parameter we are passing:-
                        * param 1(rationListObject): currently available list of ration packets
                        * param 2(neededFoodPckts.dayRation):Food Packets which is used to survive for the day
                        * param 3 (): water quantity in liters, which is needed to survive for the day.
                        * param 4 (neededFoodPckts.whileCallbackOne): call back function to ensure loop is executed completed
                        * it will return a object with remaning water water ration and total available water in liters
                        */
                        var neededWaterPckts = self.findWaterPacketSeries(rationListObject, neededFoodPckts.dayRation, 2, neededFoodPckts.whileCallbackOne);
                        
                        //reset ration list with un-used water packets
                        rationListObject.waterRation = neededWaterPckts.remaningRationObject.waterRation;
                        //reset total available water with remaing quantity of water.
                        rationListObject.totAvailableWater = neededWaterPckts.remaningRationObject.totAvailableWater;

                        //if needed callory and water is not fulfilled , it means martian is not able to survive this day.  and ration is incomplete for given day.
                        if (neededFoodPckts.neededCalory <= 0 && neededWaterPckts.neededWater<=0){
                            //if needed callory and water is fullfiled , push the fetched ration in the scheduled array.
                            rationSchedule[rationForDay] = neededWaterPckts.dayRation;
                        }
                        //increase the surivival day timestamp by ading miliseconds
                        rationForDay += parseInt((24 * 60 * 60 * 1000));
                        
                        neededWaterPckts.whileCallbackOne();//call the callback back to flag that current loop is executed.
                        //schedulingStatus.whilstCallBackOne();
                    },function(err,data){
                        seriesCallback(null,rationSchedule);    
                    });
                }
            ], function (error, data) {
                
                if (error) {
                    status = 500;
                    result.status = status;
                    result.error = err;
                } else {
                    result.status = status;
                    result.message = "Schedule of ration!";
                    result.result = data[1];
                }
                //console.log(result)
                res.status(status).send(result);
            }
        );
    },
    //get list of food packets which are not expired 
    getFoodRationPackets:(startDate, callback)=> {

        Ration.find({ "packageType": "Food", expiryDate: { $gte: dateFormat(startDate, "yyyy-mm-dd") } }, null, { sort: { expiryDate: 1, calories: -1 } }, (err, foodRations) => {
            if (!err) {
                var totalAvailableCalory = 0;
                //loop through each food packet to add timestamp
                async.forEachOf(foodRations, function (eachPacket, key, forEachCallback) {
                    totalAvailableCalory = parseInt(totalAvailableCalory) + parseInt(eachPacket.calories);
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
    },
    //get water packets
    getWaterRationpackets: (callback)=> {

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
    },
    //function to create a bunch of rations/food packet which can be consumed in a day as per needed callory
    findFoodPacketSeries:(rationListObjectParam, rationDayTs, neededCalory, parentWhileCallback)=> {
        var dayRation = [];  // temp variable which holds rastion of the day
        var rationListObject = rationListObjectParam; // array of available ration 
        var remaningRationObject = {
            foodRation: [], // temp array of the ration , which dosen't get consumed in current day/loop
            totAvailableCalory: 0 //total callory which is availbale from food packets
        };
        //using async series, to make sure each process executes completely before another starts    
        async.series(
            [
                //first block of series will try to find/consume the food packets which are going to expire on given date itself. if that is the case , we will add them in given date ration
                function (seriesCB) {
                    //execute a aync for-each loop to go each packet of the food
                    async.forEachOf(rationListObject.foodRation, function (eachPacket, key, forEachCallback) {
                        //if needed calory is more then total availaible calory , nothing can be done . rationing is not possible further
                        if (neededCalory > rationListObject.totAvailableCalory && rationDayTs == eachPacket.expiryDateTs) {
                            forEachCallback("done");
                            //else if needed callory is greater then 0 , and packet is going to expire by today
                        } else if (neededCalory > 0 && rationDayTs == eachPacket.expiryDateTs) {
                            dayRation.push(eachPacket); //add food packet to the today ration stack
                            neededCalory -= parseInt(eachPacket.calories); //subtract the needed calory by packest calory
                            forEachCallback();
                            //if food packet is not going to expire today , add it to un-used/remaning ration stack
                        } else if (eachPacket.expiryDateTs > rationDayTs) {
                            remaningRationObject.foodRation.push(eachPacket); //add food packet to remaning ration stack
                            remaningRationObject.totAvailableCalory += parseInt(eachPacket.calories); //add packet calory to available calory
                            forEachCallback();
                        }

                    }, function (err) {
                        if (err) {
                        }
                        //reset foodration with remaning food ration , so that it can be used in next block of series
                        rationListObject.foodRation = remaningRationObject.foodRation;
                        //reset total available ration with un-used/ramaing calories
                        rationListObject.totAvailableCalory = remaningRationObject.totAvailableCalory;
                        //reset remaing ration object to default one
                        remaningRationObject = { foodRation: [], totAvailableCalory: 0 };
                        seriesCB(null,"first series block");
                    });

                },
                //block of series which identifies best needed food packet as per needed calory.
                function (seriesCB) {
                    //if still we need some calory to survive
                    if (neededCalory > 0) {
                        var selectedKey="";
                        var timeToExpire = rationDayTs;
                        var calloryDiff = neededCalory; //diff in calory which is needed
                        //execute a aync for-each loop to go each packet of the food, and find best fit packet as per needed caloory
                        async.forEachOf(rationListObject.foodRation, function (eachPacket, key, forEachCallback) {
                            var newTimeToExpire = Math.abs(eachPacket.expiryDateTs-rationDayTs );
                            var newCalloryDiff = Math.abs(neededCalory - eachPacket.calories);
                            //if packet callory is equals to needed callory ,and ( either no key is selected or current packet is expiring early)
                            if (eachPacket.calories == neededCalory && (selectedKey === "" || newTimeToExpire < timeToExpire)) {
                                selectedKey = key;
                                timeToExpire = newTimeToExpire;
                                calloryDiff = newCalloryDiff;
                            //else if either no item selected or current packet is expiring early
                            } else if(selectedKey === "" || newTimeToExpire < timeToExpire){
                                //console.log(selectedKey + " == '' || " + newTimeToExpire + " < " + timeToExpire, ">>>elseif", selectedKey);
                                selectedKey = key;
                                timeToExpire = newTimeToExpire;
                                calloryDiff = newCalloryDiff;
                            //else if either no item selected or (current packet on same as before and current packet serves nearest needed callory )
                            } else if (selectedKey === "" || (newTimeToExpire == timeToExpire && newCalloryDiff < calloryDiff)){
                                selectedKey = key;
                                timeToExpire = newTimeToExpire;
                                calloryDiff = newCalloryDiff;
                            }
                            
                            
                            forEachCallback();
                        }, function (err) {
                            if (err) {
                            }
                            if (selectedKey!==""){
                                dayRation.push(rationListObject.foodRation[selectedKey]);
                                neededCalory -= parseInt(rationListObject.foodRation[selectedKey].calories);
                                rationListObject.totAvailableCalory -= parseInt(rationListObject.foodRation[selectedKey].calories);
                                rationListObject.foodRation.splice(selectedKey, 1);
                                remaningRationObject = { foodRation: [], totAvailableCalory: 0 };                                
                            }

                            seriesCB(null, "second-1 series block");
                        });
                    } else {
                        seriesCB(null, "second-2 series block");
                    }

                },
                //get the food packet , which serves nearest calory to the needed food callory
                function (seriesCB) {

                    if (rationListObject.foodRation.length > 0 && neededCalory > 0) {
                        var selectedKey = ""; //index of selected food packet, it may change as loop proceeds
                        var diff = neededCalory; //diff in calory which is needed

                        //loop through the ration object , to go by each food packet. and get nearest calory packet to the needed calory
                        async.forEachOf(rationListObject.foodRation, function (eachPacket, key, forEachCallback) {

                            var newdiff = Math.abs(neededCalory - eachPacket.calories);
                            //if no index is selected or diff in calory from curr packet is less then previous packet
                            if (selectedKey == "" || newdiff < diff) {
                                selectedKey = key;
                                diff = newdiff;
                            }

                            forEachCallback();
                        }, function (err) {
                            if (err) {
                            }

                            //if (selectedKey!=""){
                            dayRation.push(rationListObject.foodRation[selectedKey]);
                            neededCalory -= parseInt(rationListObject.foodRation[selectedKey].calories);
                            rationListObject.totAvailableCalory -= parseInt(rationListObject.foodRation[selectedKey].calories);
                            rationListObject.foodRation.splice(selectedKey, 1);
                            remaningRationObject = { foodRation: rationListObject.foodRation, totAvailableCalory: rationListObject.totAvailableCalory };

                            //}

                            seriesCB(null, "third-1 series block");
                        });

                    } else {
                        remaningRationObject = { foodRation: rationListObject.foodRation, totAvailableCalory: rationListObject.totAvailableCalory };
                        seriesCB(null, "third-2 series block");

                    }

                },

                function (seriesCB) {
                    //recursively call function if still needed caloory is greater then 0, and there calory available to allocate
                    if (neededCalory > 0 && rationListObjectParam.totAvailableCalory > neededCalory) {
                        var x = self.findFoodPacketSeries(rationListObject, rationDayTs, neededCalory, seriesCB);
                        remaningRationObject.foodRation = x.remaningRationObject.foodRation;
                        remaningRationObject.totAvailableCalory = x.remaningRationObject.totAvailableCalory;
                        //console.log(neededCalory+ ">>>>>>>>>>" + x.dayRation + "------------" + dayRation + "<<<<<<<<<<<<<<<<");
                        dayRation = dayRation.concat(x.dayRation);

                        neededCalory = x.neededCalory;
                        x.whileCallbackOne();
                    } else {
                        seriesCB(null, "fourth series block");
                    }
                }
            ], function (error, data) {

                if (error) {

                }
            }
        );

        return { "whileCallbackOne": parentWhileCallback, rationDayTs: rationDayTs, remaningRationObject: remaningRationObject, neededCalory: neededCalory, dayRation: dayRation };
    },
    findWaterPacketSeries :(rationListObjectParam, dayRation, neededWater, parentWhileCallback) =>{
        
        //var dayRation = [];
        var rationListObject = rationListObjectParam;
        var remaningRationObject = { waterRation: [], totAvailableWater: 0 };


        async.series(
            [

                function (seriesCB) {
                    //get water packet which get fits exactly to the needed water
                    async.forEachOf(rationListObject.waterRation, function (eachPacket, key, forEachCallback) {

                        if (neededWater>0 && parseFloat(eachPacket.liters) == parseFloat(neededWater)) {
                            neededWater = neededWater - parseFloat(eachPacket.liters);
                            dayRation.push(eachPacket);
                        } else {
                            remaningRationObject.waterRation.push(eachPacket);
                            remaningRationObject.totAvailableWater += parseFloat(eachPacket.liters);

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
                        var diff = neededWater;
                        async.forEachOf(rationListObject.waterRation, function (eachPacket, key, forEachCallback) {
                            var newdiff = Math.abs(neededWater - eachPacket.liters);
                            //if no index is selected or diff in liters from curr packet is less then previous packet
                            if (selectedKey === "" || newdiff < diff) {
                                selectedKey = key;
                                diff = newdiff;
                            }

                            forEachCallback();
                        }, function (err) {


                            if (selectedKey!==""){
                                dayRation.push(rationListObject.waterRation[selectedKey]);
                                neededWater -= parseFloat(rationListObject.waterRation[selectedKey].liters);
                                rationListObject.totAvailableWater -= parseFloat(rationListObject.waterRation[selectedKey].liters);
                                rationListObject.waterRation.splice(selectedKey, 1);
                                remaningRationObject = { waterRation: rationListObject.waterRation, totAvailableWater: rationListObject.totAvailableWater };

                            }

                            seriesCB();
                        });

                    } else {
                        remaningRationObject = { waterRation: rationListObject.waterRation, totAvailableWater: rationListObject.totAvailableWater };
                        seriesCB();

                    }

                },
                function (seriesCB) {

                    if (neededWater > 0 && rationListObjectParam.totAvailableWater >= neededWater) {
                        var x = self.findWaterPacketSeries(rationListObject, dayRation, neededWater, seriesCB);
                        remaningRationObject.waterRation = x.remaningRationObject.waterRation;
                        remaningRationObject.totAvailableWater = x.remaningRationObject.totAvailableWater;

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
}