const mongoose = require('mongoose');
const campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

// supress deprecation warning for mongoose 7
mongoose.set('strictQuery', false);

//connect to the mongoose database
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')

//logic to check an error
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
})

//picking a random number for the array
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()  * 20) + 10;
        const camp = new campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: 'https://source.unsplash.com/collection/483251',
            images:[ 
            {
                url: 'https://res.cloudinary.com/dqsjjbp5w/image/upload/v1673980358/YelpCamp/f9nypqoskoraz62rczbn.jpg',
                filename: 'YelpCamp/f9nypqoskoraz62rczbn',
              },
              {
                url: 'https://res.cloudinary.com/dqsjjbp5w/image/upload/v1673980358/YelpCamp/uifnrm5exk9okwra1qx2.jpg',
                filename: 'YelpCamp/uifnrm5exk9okwra1qx2',
              }],
            author: '63be9bc24db208151741a7d7',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            description: `Ad anim mollit fugiat magna ad mollit. Incididunt cupidatat ex qui quis anim. Consectetur 
            anim aliqua exercitation cillum aute nulla Lorem cillum qui cillum adipisicing amet exercitation commodo. 
            Adipisicing sint nulla laborum nisi aute laboris quis magna. Nisi elit laboris cupidatat Lorem et mollit.`
        })
        await camp.save()
    }
    // const c = new campground({title: 'purple field'});
    // await c.save();
    // console.log(c);
}

// Running seeds function(old code)
// seedDB();
// if done close the connection
seedDB().then(() => {
    mongoose.connection.close()
})

