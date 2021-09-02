const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
// adds username, password hash, and salt to the userSchema
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);