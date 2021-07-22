
# Game-with-me-backend application

GameWithMe is a platform to help online gamers to enhance their gaming experience and get gaming companionship with quality gamer-for-hire services provided by gaming companions.

GameWithMe frontend can be found [here](https://gitlab.lrz.de/seba-master-2021/team-35/game-with-me-frontend)


## Prerequisites

Both for the backend and frontend application:

* nodejs [official website](https://nodejs.org/en/) - nodejs includes [npm](https://www.npmjs.com/) (node package manager)

Just for the backend application:

* mongodb [official installation guide](https://docs.mongodb.org/manual/administration/install-community/)

## Setup (before first run)

Go to your project root folder via command line
```
cd your/path/to/game-with-me-backend
```

**Install node dependencies**

```
npm install
```

**Set up your database**

* Create a new directory where your database will be stored (it's a good idea to separate data and business logic - the data directory should be on a different place than your app)
* Start the database server
```
mongod --dbpath "your/path/to/database"
```

## Start the project

**Generate games**
```
npm run gameGenerator
```
**Start project**
```bash
npm start
```
