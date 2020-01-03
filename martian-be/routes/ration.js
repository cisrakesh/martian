const RationController = require('../Controllers/rationController');

module.exports = (router) => {
  	router.route('/ration')
            .post([RationController.validate('addRation')],RationController.add)
            .get(RationController.getAll) // This route will be protected shortly;
            .delete([RationController.validate('deleteRation')],RationController.deleteRation);
    router.route('/ration-schedule')
        .get(RationController.getSchedule);
    
    
    
        
  	
};