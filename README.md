## DB.js
IndexedDB is ready for prime-time! 
It is now supported by [all major browsers](caniuse.com).  
And it's great for Web Developers to finally have a Database. But the syntax is so horrible that you can't use it without an abstraction-library.
This is where **db.js** comes into play :-)  
At just **1kb** minified and gzipped you will barely add any weight to your app. And the syntax is super-easy. See for yourself:




#### Example One
``` javascript
db = new DB('ContactApp'); // create a database

db.addStore('contacts'); // add a store

db.contacts.add({name:'John Doe', email:'joe@doe.com'}); // add data

db.contacts.get(1).then(contact => {
  contact.name // = John Doe
}) // get entry by primary key
```
now wasn't that easy? :-) 




#### Example Two
``` javascript
db = new DB(...); 

db.addStore('contacts', 'email'); 
// email is the primary key now

db.contacts.add(contact1, contact2);

db.contacts.get('joe@doe.com').then(contact => {
  contact.name // John Doe
}) // get entry by primary key
```



#### Example Three
``` javascript
db = new DB(...); 

db.addStore('contacts', 'email', ['name', 'city']); 
// email is still the primary key
// name and city will also be indexed (=searchable)

db.contacts.add(...);

// get contacts where 'a' < name < 'z'
db.contacts.query('name', ['a','z]).forEach(contact => {
  contact.name // John Doe, Jane Doe, ...
}) 
```



#### Open a Database
``` javascript
db = new DB('ContactApp');
```




#### Add a Store to your Database
```javascript
db.addStore('contacts');
```
In the Terminology of IndexedDB a *store* is the same thing as a *table* was in traditional SQL-Databases.  You need to create at least one to be able to use your Database.
```javascript
db.addStore('contacts', ['name','!email','city']);
```
```javascript
db.addStore(storeName, storeConfig, [index1, index2, ...])
```

  
  



#### Add Data to your Store
```javascript
db.addStore('contacts', ['name','!email','city']);
```
You can add new Data in various ways.





#### Method Chaining