#  OHLLabpro - NELFLIX
### Thea Josephine - 13522012
Admin FE taken from `https://github.com/arsaizdihar/labpro-ohl-fe` Cool!

## Table of Contents 💫
* [Design Pattern](#design-pattern)
* [Servers](#servers)
* [Endpoints](#endpoints)
* [Bonuses](#bonuses)
* [Tools](#tools-and-libraries)
* [Setup](#setup)
* [How To Use](#how-to-use)

## Design Pattern
- Singleton Pattern
The PrismaSingleton class ensures that only one instance of the Prisma client is created and used throughout the web. By importing the Prisma client instance from the singleton, we use it to interact with the database.

- Strategy Pattern 
To display the purchased films or wishlisted films using the same frontend logic as the browse page, we reuse most of the existing code by applying the Strategy Pattern. Since we only change the content we wanted to display, this design This design pattern allows you to define a family of algorithms (in this case, data fetching for browsing or displaying purchased films), encapsulate each one, and make them interchangeable.

- Observer Pattern
The Observer Pattern enables real-time updates to the website based on backend changes. When a user adds a film to their list or makes a purchase, the system should update the UI to reflect these changes, making it used in the Long Polling.

## Servers
- Localhost 3000 for monolith http://localhost:3000/
- Localhost 3001 for backend server
- Localhost 5173 for admin http://localhost:5173/

## Endpoints

## Bonuses
- Responsive UI
- Wishlist
- 

## Tools and Libraries
- MariaDB
- Docker Desktop
- Node.js
- Prisma
- etc.

## Setup
SETUP DB
1. Create a database, open up MariaDB `create database {db name}` then `use {db name}`.
2. Ensure that the `DATABASE_URL` environment variable (.env) in your .env (inside Backend folder) file is correctly set and accessible based on your db `mysql://{username}:{password}@localhost:3306/{db name}`

Manually
1. Run `npm install` in Admin, Backend, and Frontend folder each. Also make sure you have npm and node installed in ur system
2. Run Backend server using `node server.js` inside Backend folder, run Frontend display using `node app.js` inside Frontend folder, and at last `npm run dev` inside Admin folder.
3. Run Seeders for faster testing by navigating to Backend/scripts folder and use `node seeders.js` to populate the db with dummy datas.

Dockerize
1. Make sure Docker Desktop is installed on your system
2. Run `docker compose build` then `docker compose run` in the root directory
3. Run Seeders for faster testing by navigating to Backend/scripts folder and use `node seeders.js` to populate the db with dummy datas.

### Thanks for trying my website :> 
Kind of new to backend devs lol kind of wacky, it's my first full stack project, enjoy!