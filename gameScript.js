const mongoose = require('mongoose');
const async = require("async");

const config = require('./src/config');
const Game = require("./src/models/game");

mongoose
    .connect(config.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    .catch(err => {
        console.log('Error connecting to the database', err.message);
        process.exit(err.statusCode);
    });

//The following part generates test data on games, posts and users.
mongoose.Promise = global.Promise;

async function gameCreate(name, allServers, allPlatforms, isPopular, gamePic, cb) {
    let exist = await Game.exists({name: name});
    if(!exist) {
        const gameInfo = {name, allServers, allPlatforms, isPopular, gamePic};
        const game = new Game(gameInfo);

        game.save(function (err) {
            if(err) {
                cb(err, null);
                return;
            }
            cb(null, game);
        });
    }
    else {
        cb(null, null);
    }
}

function createGames(cb) {
    async.parallel([
        function (callback) {
            gameCreate("Apex Legends", ["Europe", "Korea", "Japan", "North America", "South America"], ["PC", "PS4", "Xbox", "Switch", "iOS", "Android"], false, "https://www.dafont.com/forum/attach/orig/8/5/853990.png?1",callback);
        },
        function (callback) {
            gameCreate("Animal Crossing: New Horizons", ["N/A"], ["Switch"], false, "https://global-img.gamergen.com/animal-crossing-new-horizons-logo-05-09-2019_0903D4000000934367.jpg", callback);
        },
        function (callback) {
            gameCreate("Arena of Valor", ["Europe", "Asia", "North America"], ["Switch", "iOS", "Android"], false, "https://upload.wikimedia.org/wikipedia/en/e/ef/Arena_of_Valor_Logo_2021.png", callback);
        },
        function (callback) {
            gameCreate("Black Desert Online", ["Europe", "Japan", "Korea", "North America", "SEA"], ["Switch", "iOS", "Android"], false,"https://gamingontop.com/wp-content/uploads/2018/06/bdo_square_logo.jpg", callback);
        },
        function (callback) {
            gameCreate("CS:GO", ["Australia", "Europe", "Japan", "Korea", "US", "Brazil", "Chile", "Poland", "Spain", "China", "Singapore", "India"], ["PC"], false, "https://preview.redd.it/1s0j5e4fhws01.png?auto=webp&s=af1a17c3f935e22d1cbf6aecc983d8626c15b590",callback);
        },
        function (callback) {
            gameCreate("Call of Duty", ["US", "Oceania", "Asia", "US"], ["PC", "PS4", "Xbox"], false, "https://cdn6.aptoide.com/imgs/8/e/0/8e0cd8552270598d066043b5c037718e_icon.png", callback);
        },
        function (callback) {
            gameCreate("Dota 2", ["US", "Europe", "Asia", "South America", "Russia", "Australia", "South Africa"], ["PC"], false, "http://i.imgur.com/rlx1Kb2.png", callback);
        },
        function (callback) {
            gameCreate("Fortnight", ["NA West", "NA East", "Brazil", "Europe", "Asia", "China"], ["PC", "PS4", "Xbox", "Switch"], false, "https://logosmarken.com/wp-content/uploads/2020/12/Fortnite-Logo.png", callback);
        },
        function (callback) {
            gameCreate("Grand Theft Auto", ["N/A"], ["PC", "PS5", "PS4", "PS3", "Xbox One", "Xbox 360"], false, "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Grand_Theft_Auto_logo_series.svg/1275px-Grand_Theft_Auto_logo_series.svg.png", callback);
        },
        function (callback) {
            gameCreate("Human Fall Flat", ["N/A"], ["PC", "PS4", "Xbox", "Switch", "iOS", "Android"], false, "https://i.pinimg.com/originals/96/9d/98/969d98ca8c33dcedbc54e011226967e0.png", callback);
        },
        function (callback) {
            gameCreate("League of Legends", ["OCE", "NA", "LAN", "BR", "EU"], ["PC"], true, "https://i.pinimg.com/originals/b8/3e/6f/b83e6fea403a390bd06ae17c187408e3.png",callback);
        },
        function (callback) {
            gameCreate("Minecraft", ["International", "Europe", "US", "China"], ["PC", "Switch", "Xbox"], true, "https://i2.wp.com/minecraft.st/wp-content/uploads/minecraft_Logo_Block_Logo.png?fit=400%2C400&ssl=1", callback);
        },
        function (callback) {
            gameCreate("Monster Hunter World", ["N/A"], ["PC", "PS4", "Xbox"], false, "https://i.pinimg.com/736x/27/e1/f8/27e1f82bb24d2afbb1f5cba2d8006022.jpg", callback);
        },
        function (callback) {
            gameCreate("Monster Hunter RISE", ["N/A"], ["Switch"], false, "https://res.cloudinary.com/teepublic/image/private/s--WU-7IZRH--/t_Resized%20Artwork/c_fit,g_north_west,h_1054,w_1054/co_ffffff,e_outline:53/co_ffffff,e_outline:inner_fill:53/co_bbbbbb,e_outline:3:1000/c_mpad,g_center,h_1260,w_1260/b_rgb:eeeeee/c_limit,f_auto,h_630,q_90,w_630/v1600352262/production/designs/14117514_0.jpg", callback);
        },
        function (callback) {
            gameCreate("Monopoly", ["N/A"], ["PC", "iOS", "Android"], false, "https://www.android-user.de/wp-content/uploads/2019/11/Monopoly-Icon.jpg", callback);
        },
        function (callback) {
            gameCreate("Mario Kart Deluxe", ["N/A"], ["Switch"], false, "https://www.nicepng.com/png/detail/219-2199116_mario-kart-8-deluxe-logo-png-vector-mario.png", callback);
        },
        function (callback) {
            gameCreate("Overwatch", ["Asia", "US", "Europe", "China"], ["PC", "PS4", "Xbox", "Switch"], false, "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Overwatch_circle_logo.svg/600px-Overwatch_circle_logo.svg.png", callback);
        },
        function (callback) {
            gameCreate("Overcooked 2", ["N/A"], ["PC", "PS4", "Xbox One", "Switch"], false, "https://image.api.playstation.com/cdn/EP4064/CUSA10870_00/oEOoxCv1cOCBDW5JwIK5bMX1NhNiRre8.png", callback);
        },
        function (callback) {
            gameCreate("Portal 2", ["N/A"], ["PC"], false, "https://upload.wikimedia.org/wikipedia/en/f/f9/Portal2cover.jpg", callback);
        },
        function (callback) {
            gameCreate("PUBG", ["NA", "SA", "EU", "JP", "KR", "SEA"], ["PC", "PS4", "Xbox"], true, "https://play-lh.googleusercontent.com/JRd05pyBH41qjgsJuWduRJpDeZG0Hnb0yjf2nWqO7VaGKL10-G5UIygxED-WNOc3pg", callback);
        },
        function (callback) {
            gameCreate("Rainbow Six", ["US", "Brazil", "EU", "Asia", "Australia", "Japan"], ["PC", "PS4", "Xbox"], false,"https://red.elbenwald.de/media/image/51/de/80/E1063325_3.jpg", callback);
        },
        function (callback) {
            gameCreate("Risk of Rain 2", ["N/A"], ["PC", "PS4", "Xbox", "Switch"], false, "https://upload.wikimedia.org/wikipedia/en/c/c1/Risk_of_Rain_2.jpg", callback);
        },
        function (callback) {
            gameCreate("Stardew Valley", ["N/A"], ["PC", "PS4", "Switch"], false, "https://ih1.redbubble.net/image.470282489.7048/pp,840x830-pad,1000x1000,f8f8f8.jpg", callback);
        },
        function (callback) {
            gameCreate("Super Smash Bros", ["N/A"], ["Switch"], false, "https://i.pinimg.com/474x/0d/7f/c6/0d7fc6c898b6bcb21d88c2fc179248b3.jpg", callback);
        },
        function (callback) {
            gameCreate("Splatoon 2", ["N/A"], ["Switch"], false, "https://upload.wikimedia.org/wikipedia/en/thumb/4/49/Splatoon_2.jpg/220px-Splatoon_2.jpg", callback);
        },
        function (callback) {
            gameCreate("UNO", ["N/A"], ["iOS", "Android", "PC"], false, "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/UNO_Logo.svg/1280px-UNO_Logo.svg.png", callback);
        },

    ], cb);
}


async.series([createGames,], function (err, res) {
    if(err) {
        console.log("ERR: "+err);
    }
    else {
        console.log("All games are generated.");
    }
    // All done, disconnect from database
    mongoose.connection.close();
});