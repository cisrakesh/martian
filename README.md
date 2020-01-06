# Martian Rationing System
You are part of the Ares III mission to Mars exploring “Acidalia Planitia” plain on Mars in the year 2035. Due to unfortunate circumstances involving a dust storm, you got stranded on Mars alone with no communication to your team or Earth’s command center.
Your surface habitat ("Hab") on Mars contains a limited inventory of food supplies. Each of these supplies is in the form of a packet containing either Food or Water. The food items have details of the content, expiry date and calories they provide. The water packet contains only the details of the quantity in liters and doesn’t expire.

You can find more info here - https://docs.google.com/document/d/12iUPtQJdN5tspzy2jSz8bqUytWMhcua3Cz38kGXq_Mo/edit?usp=sharing

## Installation
    1 Should have mongoDb 
    2 Node and angular cli 8
    Clone the repo. reach to root directory of the folder.  Install NPM packages using command line. 
    In sub-folder "martian-be" you can find backend of the project as well.
    You need to install node modules as well in the "martian-be" folder.
    
    You need to setup mongo Database credentials in the .env file under folder "martian-be". Set connection details there. And you are ready to use application. 
    Generally front end is running with url localhost:4200 and backend with url localhost:3000.
    In case you want to run backend on any other url or port , you are free to do that. you only need to set API_URL variable in at location /project-folder/src/app/services/appConfig.ts 
    You just need to make appropriate changes against variable "API_URL".
    
    In folder "martian-db" on project root , database dump is available.
    
## Usage
In this repo in root we are having front end of the application , which is built over angular 8 , and a Sub-folder named "martian-be" , "martian-be" is backend of the application which is built on the node.
To execute front end of the system run command 
```javascript
ng serve
```
On browser open localhost:4200 you will see the output.
As the very first page communicates with backend and get some records from the database , you also need to run backend on another terminal , change directory to "martian-be" and execute command :- 
```javascript
npm start
```
it will start backend on localhost:3000

## Test Case
To execute test cases , reach to folder martian-be in terminal , and write following command 
```javascript
mocha
```
It will show test case status 