#  OHLLabpro - NELFLIX
### Thea Josephine - 13522012
Seleksi Labpro Tahap 3
## Table of Contents 💫
* [The Game](#the-algorithm) 👾 
* [Tools](#tools-and-libraries) 🔨
* [Requirements](#requirements) 🫧
* [Setting Up](#setting-up) 🍀
* [How To Use](#how-to-use) 🪄

## Design Pattern
- Singleton Pattern
The PrismaSingleton class ensures that only one instance of the Prisma client is created and used throughout the web. By importing the Prisma client instance from the singleton, we use it to interact with the database.

- Strategy Pattern 
To display the purchased films or wishlisted films using the same frontend logic as the browse page, we reuse most of the existing code by applying the Strategy Pattern. Since we only change the content we wanted to display, this design This design pattern allows you to define a family of algorithms (in this case, data fetching for browsing or displaying purchased films), encapsulate each one, and make them interchangeable.
## Servers
- Localhost 3000 for monolith
- Localhost 3001 for backend server
- Localhost 5173 for admin

## Endpoints

## Bonuses
- Responsiveness
- Wishlist
- Review x Comment

## Tools and Libraries
- Express.js
- Node.js
- MySQL
- Prisma

## Requirements
- Have npm installed with `npm install`

## Setting Up
- Clone this repository on your terminal `https://github.com/pandaandsushi/LabproOHL.git`


## How to Use
- Create a database, for me i use MariaDB `create database {db name}` then `use {db name}`.
- Ensure that the `DATABASE_URL` environment variable in your .env (inside Backend folder) file is correctly set and accessible based on your db `mysql://{username}:{password}@localhost:3306/{db name}`
- run `npm install` in Admin, Backend, and Frontend folder each. Also make sure you have npm and node installed in ur system
- run Backend server using `node server.js` inside Backend folder, run Frontend display using `node app.js` inside Frontend folder, and at last `npm run dev` inside Admin folder.
- Run Seeders for faster testing by navigating to Backend/scrips folder and use `node {js file}` to populate the db.
- 