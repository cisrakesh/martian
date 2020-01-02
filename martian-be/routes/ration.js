const RationController = require('../Controllers/rationController');

module.exports = (router) => {
  	router.route('/ration')
            .post(RationController.add)
            .get(RationController.getAll) // This route will be protected shortly;
            .delete (RationController.deleteRation);
    router.route('/ration-schedule')
        .get(RationController.getSchedule);
    // router.route('/profile')
    //     .get(RationController.getCurrentUser) 
    //     .put(RationController.updateCurrentUser); 
    // router.route('/update-password')
    //     .put([RationController.validate('updatePassword')],RationController.updatePassword); 
    
    
        
  	
};