const mongoose = require('mongoose');
const mongooseUniqueValidator = require('mongoose-unique-validator');
const environment = process.env.NODE_ENV;
const stage = require('../config')[environment];

// schema maps to a collection
const Schema = mongoose.Schema;


const rationSchema = new Schema({
    rationId: {
        type: 'String',
        required: true,
        trim: true,
        unique: true
    },
    packageType: {
        type: 'String',
        required: true,
        trim: true
    },
    packgeContent:{
        type: 'String',
        trim: true,
    },
    calories: {
        type: 'number',
        trim: true,
    },
    expiryDate: {
        type: 'String',
        trim: true
    },
    liters: {
        type: 'number',
        trim: true
    },
    expiryDateTs:{
        type:'number',
        trim:true
    }
    
});
rationSchema.plugin(mongooseUniqueValidator);

const RationModel = mongoose.model('Ration', rationSchema);

module.exports = {
    Ration: RationModel
}