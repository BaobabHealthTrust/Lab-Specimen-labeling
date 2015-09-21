LAB SPECIMEN LABELING READ-ME<br />

<b>HOW TO SETUP</b><br />
1. Make sure node.js is installed in your PC<br />
2. git clone git@github.com:BaobabHealthTrust/Lab-Specimen-labeling.git<br />
3. switch to specimen_label branch. git checkout specimen_label<br />
4. Open bart_config.js and make sure it is pointing where your BART2 is running.<br />
5. open db/bookshelf.js and edit the file to match your MySQL security variables. This uses healthdata database <br />
6. While in the root directory of your app, type <i>npm start</i> to start your application. This will start the app in port 3000<br />
7. To change the default port, type <i>PORT=4000 npm start</i>. Running on port 4000. Feel free to change the port number 
