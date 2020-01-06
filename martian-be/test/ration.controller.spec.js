var assert = require('assert');
var rationController = require('../Controllers/rationController');
var expect  = require('chai').expect;
var rationList={ 
                "foodRation": { 
                    "packets": [
                        { "rationId": "F4", "packageType": "Food","calories": 1500, "expiryDate": "2020-05-05T18:30:00.000Z","expiryDateTs": 1588703400000 },
                        { "rationId": "F1", "packageType": "Food","calories": 1000, "expiryDate": "2020-05-07T11:29:10.000Z","expiryDateTs": 1588789800000 }, 
                        { "rationId": "F2", "packageType": "Food","calories": 2000, "expiryDate": "2020-06-05T18:30:00.000Z","expiryDateTs": 1591381800000 }, 
                        { "rationId": "F3", "packageType": "Food","calories": 1000, "expiryDate": "2020-06-26T18:30:00.000Z","expiryDateTs": 1593196200000 }, 
                        { "rationId": "F7", "packageType": "Food","calories": 1000, "expiryDate": "2020-07-02T18:30:00.000Z","expiryDateTs": 1593714600000 }, 
                        { "rationId": "F6", "packageType": "Food","calories": 1500, "expiryDate": "2020-07-05T18:30:00.000Z","expiryDateTs": 1593973800000 }, 
                        { "rationId": "f9", "packageType": "Food","calories": 100, "expiryDate": "2020-11-19T10:13:37.000Z","expiryDateTs": 1605724200000 }, 
                        { "rationId": "F8", "packageType": "Food","calories": 400, "expiryDate": "2020-12-17T09:34:40.000Z","expiryDateTs": 1608143400000 }, 
                        { "rationId": "F5", "packageType": "Food","calories": 1000, "expiryDate": "2020-12-30T18:30:00.000Z","expiryDateTs": 1609353000000 }
                    ], 
                    "totAvailableCalory": 9500 
                }, 
                "waterRation": { 
                    "packets": [
                        { "rationId": "W1", "packageType": "Water", "liters": 1,}, 
                        { "rationId": "W2", "packageType": "Water", "liters": 2,},
                        { "rationId": "W3", "packageType": "Water", "liters": 2,},
                        { "rationId": "W4", "packageType": "Water", "liters": 1,}
                    ], 
                    "totAvailableWater": 6 
                }
            };
describe('rationController', function () {
    //this.timeout(0);
    it('Checks that expired food should not get into the result', async ()=> {
        var rationList = {
            "foodRation": {
                "packets": [
                    { "rationId": "F4", "packageType": "Food", "calories": 1500, "expiryDate": "2020-01-01T18:30:00.000Z", "expiryDateTs": 1577817000000 },
                    { "rationId": "F1", "packageType": "Food", "calories": 1000, "expiryDate": "2020-01-03T11:29:10.000Z", "expiryDateTs": 1577989800000 },
                    { "rationId": "F2", "packageType": "Food", "calories": 2000, "expiryDate": "2020-01-03T18:30:00.000Z", "expiryDateTs": 1577989800000 },
                    
                ],
                "totAvailableCalory": 4500
            }
        };
        rationListObject = {
            "foodRation": rationList.foodRation.packets,
            "totAvailableCalory": rationList.foodRation.totAvailableCalory,//total available calories from all food packets
        };
        var rationDayTs = new Date(new Date("2020-01-04").toDateString()).getTime();
            var neededCalory=2500;
            
            var todayRation = await rationController.findFoodPacketSeries(rationListObject, rationDayTs, neededCalory, function(err,data){
                
            });
            
            expect(todayRation.dayRation).to.be.an('array');
            expect(todayRation.dayRation).to.have.lengthOf(0);
            
            
            
            
    });
    
    it('Needed calories remains unchanged if no food packet is consumed', async () => {
        var rationList = {
            "foodRation": {
                "packets": [
                    { "rationId": "F4", "packageType": "Food", "calories": 1500, "expiryDate": "2020-01-01T18:30:00.000Z", "expiryDateTs": 1577817000000 },
                    { "rationId": "F1", "packageType": "Food", "calories": 1000, "expiryDate": "2020-01-03T11:29:10.000Z", "expiryDateTs": 1577989800000 },
                    { "rationId": "F2", "packageType": "Food", "calories": 2000, "expiryDate": "2020-01-03T18:30:00.000Z", "expiryDateTs": 1577989800000 },

                ],
                "totAvailableCalory": 4500
            }
        };
        rationListObject = {
            "foodRation": rationList.foodRation.packets,
            "totAvailableCalory": rationList.foodRation.totAvailableCalory,//total available calories from all food packets
        };
        var rationDayTs = new Date(new Date("2020-01-04").toDateString()).getTime();
        var neededCalory = 2500;

        var todayRation = await rationController.findFoodPacketSeries(rationListObject, rationDayTs, neededCalory, function (err, data) {
        });
        
        expect(todayRation.dayRation).to.have.lengthOf(0);
        expect(todayRation.neededCalory).to.equal(neededCalory);
        //something.whileCallbackOne(null,something);



    });
    
    it('Expiring ration should be consumed on same day or before', async () => {
        var rationList = {
            "foodRation": {
                "packets": [
                    { "rationId": "F0", "packageType": "Food", "calories": 1000, "expiryDate": "2020-01-03T18:30:00.000Z", "expiryDateTs": 1577989800000 },
                    { "rationId": "F1", "packageType": "Food", "calories": 1500, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },
                    { "rationId": "F2", "packageType": "Food", "calories": 1000, "expiryDate": "2020-01-05T11:29:10.000Z", "expiryDateTs": 1588617000000 },
                    { "rationId": "F3", "packageType": "Food", "calories": 500, "expiryDate": "2020-01-05T11:29:10.000Z", "expiryDateTs": 1588617000000 },
                    { "rationId": "F4", "packageType": "Food", "calories": 2000, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },
                    { "rationId": "F5", "packageType": "Food", "calories": 500, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },
                    { "rationId": "F6", "packageType": "Food", "calories": 500, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },

                ],
                "totAvailableCalory": 7000
            }
        };
        rationListObject = {
            "foodRation": rationList.foodRation.packets,
            "totAvailableCalory": rationList.foodRation.totAvailableCalory,//total available calories from all food packets
        };
        var rationDayTs = new Date(new Date("2020-01-04").toDateString()).getTime();
        var neededCalory = 2500;

        var todayRation = await rationController.findFoodPacketSeries(rationListObject, rationDayTs, neededCalory, function (err, data) {
        });

        //if result contains expiring packets which fulfils needed calory , then it will have two objects
        expect(todayRation.dayRation).to.have.lengthOf(2);
        //the expected food packet at index 0 will be F1
        expect(todayRation.dayRation[0].rationId).to.equal('F1');
        //the expected food packet at index 1 will be F4
        expect(todayRation.dayRation[1].rationId).to.equal('F4');
        //something.whileCallbackOne(null,something);



    });

    it('Food packets serving same calory , then packet expiring soon should be consumed', async () => {
        var rationList = {
            "foodRation": {
                "packets": [
                    { "rationId": "F2", "packageType": "Food", "calories": 1000, "expiryDate": "2020-01-05T11:29:10.000Z", "expiryDateTs": 1588617000000 },
                    { "rationId": "F7", "packageType": "Food", "calories": 1000, "expiryDate": "2020-01-03T18:30:00.000Z", "expiryDateTs": 1577989800000 },
                    { "rationId": "F3", "packageType": "Food", "calories": 500, "expiryDate": "2020-01-05T11:29:10.000Z", "expiryDateTs": 1588617000000 },
                    { "rationId": "F4", "packageType": "Food", "calories": 2000, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },
                    { "rationId": "F5", "packageType": "Food", "calories": 500, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },
                    { "rationId": "F1", "packageType": "Food", "calories": 1500, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },
                    { "rationId": "F6", "packageType": "Food", "calories": 500, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },

                ],
                "totAvailableCalory": 7000
            }
        };
        rationListObject = {
            "foodRation": rationList.foodRation.packets,
            "totAvailableCalory": rationList.foodRation.totAvailableCalory,//total available calories from all food packets
        };
        var rationDayTs = new Date(new Date("2020-01-01").toDateString()).getTime();
        var neededCalory = 2500;

        var todayRation = await rationController.findFoodPacketSeries(rationListObject, rationDayTs, neededCalory, function (err, data) {
        });
        //console.log(todayRation);

         //if result contains expiring packets which fulfils needed calory , then it will have two objects
        expect(todayRation.dayRation).to.have.lengthOf(2);
        //the expected food packet at index 0 will be F7 as F2 and F7 serves same calory but F7 expires first
        expect(todayRation.dayRation[0].rationId).to.equal('F7');
        //the expected food packet at index 1 will be F1
        expect(todayRation.dayRation[1].rationId).to.equal('F1');
        //something.whileCallbackOne(null,something);

    });
    
    it('All expiring packets are consumed, and still calory is needed, then optimal calory packet should be used', async () => {
        var rationList = {
            "foodRation": {
                "packets": [
                    { "rationId": "F2", "packageType": "Food", "calories": 1000, "expiryDate": "2020-01-05T11:29:10.000Z", "expiryDateTs": 1588617000000 },
                    { "rationId": "F7", "packageType": "Food", "calories": 1000, "expiryDate": "2020-01-03T18:30:00.000Z", "expiryDateTs": 1577989800000 },
                    { "rationId": "F3", "packageType": "Food", "calories": 500, "expiryDate": "2020-01-03T18:30:00.000Z", "expiryDateTs": 1577989800000 },
                    { "rationId": "F4", "packageType": "Food", "calories": 2000, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },
                    { "rationId": "F5", "packageType": "Food", "calories": 200, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },
                    { "rationId": "F1", "packageType": "Food", "calories": 1500, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },
                    { "rationId": "F6", "packageType": "Food", "calories": 800, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },
                    { "rationId": "F8", "packageType": "Food", "calories": 300, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },

                ],
                "totAvailableCalory": 7000
            }
        };
        rationListObject = {
            "foodRation": rationList.foodRation.packets,
            "totAvailableCalory": rationList.foodRation.totAvailableCalory,//total available calories from all food packets
        };
        var rationDayTs = new Date(new Date("2020-01-03").toDateString()).getTime();
        var neededCalory = 2500;

        var todayRation = await rationController.findFoodPacketSeries(rationListObject, rationDayTs, neededCalory, function (err, data) {
        });
        //console.log(todayRation);

        //if result contains expiring packets which fulfils needed calory , then it will have 4 objects
        expect(todayRation.dayRation).to.have.lengthOf(4);
        //the expected food packet at index 0 should be F7 as F2 and F7 serves same calory but F7 expires first
        expect(todayRation.dayRation[0].rationId).to.equal('F7');
        //the expected food packet at index 1 will be F3 as it is expiring on same day
        expect(todayRation.dayRation[1].rationId).to.equal('F3');
        
        /*
        *all the expiring packets are consumed , still 1000 calory is needed, which is provided F2
        * but F2 is expiring on 5 Jan , before that we are have packets expiring on 04 Jan
        * and on 4 jan packets of callory 2000,200,1500,800 and 300 is available
        * so on optimal use first callary packet of 800 i.e F6 should be picked and then packet of 200 i.e F5 should be picked
        */
        expect(todayRation.dayRation[2].rationId).to.equal('F6');
        expect(todayRation.dayRation[3].rationId).to.equal('F5');
    });
    
    it('if no packets are expiring on day, then optimal calory packet should be used as per they are expiring', async () => {
        var rationList = {
            "foodRation": {
                "packets": [
                    { "rationId": "F2", "packageType": "Food", "calories": 1000, "expiryDate": "2020-01-05T11:29:10.000Z", "expiryDateTs": 1588617000000 },
                    { "rationId": "F7", "packageType": "Food", "calories": 1000, "expiryDate": "2020-01-03T18:30:00.000Z", "expiryDateTs": 1577989800000 },
                    { "rationId": "F3", "packageType": "Food", "calories": 500, "expiryDate": "2020-01-03T18:30:00.000Z", "expiryDateTs": 1577989800000 },
                    { "rationId": "F4", "packageType": "Food", "calories": 2000, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },
                    { "rationId": "F5", "packageType": "Food", "calories": 200, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },
                    { "rationId": "F1", "packageType": "Food", "calories": 1500, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },
                    { "rationId": "F6", "packageType": "Food", "calories": 800, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },
                    { "rationId": "F8", "packageType": "Food", "calories": 300, "expiryDate": "2020-01-04T18:30:00.000Z", "expiryDateTs": 1578076200000 },

                ],
                "totAvailableCalory": 7000
            }
        };
        rationListObject = {
            "foodRation": rationList.foodRation.packets,
            "totAvailableCalory": rationList.foodRation.totAvailableCalory,//total available calories from all food packets
        };
        var rationDayTs = new Date(new Date("2020-01-01").toDateString()).getTime();
        var neededCalory = 2500;

        var todayRation = await rationController.findFoodPacketSeries(rationListObject, rationDayTs, neededCalory, function (err, data) {
        });
        //console.log(todayRation);

        // it will have 2 objects
        expect(todayRation.dayRation).to.have.lengthOf(2);
        expect(todayRation.dayRation[0].rationId).to.equal('F7');
        expect(todayRation.dayRation[1].rationId).to.equal('F1');

        
    });
    
    it('Water packets which best fits the needed qauntity should be used', async () => {
        var rationList = {
            "waterRation": {
                "packets": [
                    { "rationId": "W1", "packageType": "Water", "liters": 1 },
                    { "rationId": "W2", "packageType": "Water", "liters": 0.5 },
                    { "rationId": "W3", "packageType": "Water", "liters": 0.5 },
                    { "rationId": "W4", "packageType": "Water", "liters": 1 },
                    { "rationId": "W5", "packageType": "Water", "liters": 2 }
                ],
                "totAvailableWater": 5
            }
        };
        var rationListObj = {
            "waterRation": rationList.waterRation.packets,
            "totAvailableWater": rationList.waterRation.totAvailableCalory,
        };

        
        var todaysWater1 = await rationController.findWaterPacketSeries(rationListObj, [], 2, function (err, data) {
        });
        

        
        expect(todaysWater1.dayRation).to.have.lengthOf(1);
        expect(todaysWater1.dayRation[0].rationId).to.equal('W5');
        var rationListObj = {
            "waterRation": rationList.waterRation.packets,
            "totAvailableWater": rationList.waterRation.totAvailableCalory,
        };
        var todaysWater2 = await rationController.findWaterPacketSeries(rationListObj, [], 0.5, function (err, data) {
        });
        //console.log(todaysWater);
        expect(todaysWater2.dayRation).to.have.lengthOf(1);
        expect(todaysWater2.dayRation[0].rationId).to.equal('W2');
        var rationListObj = {
            "waterRation": rationList.waterRation.packets,
            "totAvailableWater": rationList.waterRation.totAvailableCalory,
        };
        var todaysWater3 = await rationController.findWaterPacketSeries(rationListObj, [], 1.5, function (err, data) {
        });
        expect(todaysWater3.dayRation).to.have.lengthOf(2);
        expect(todaysWater3.dayRation[0].rationId).to.equal('W1');
        expect(todaysWater3.dayRation[1].rationId).to.equal('W2');


    });
    
    
});