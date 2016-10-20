var config = {
	store3: {
		key: 'email',
		unique: ['email'],
		indexed: ['name']
	},
	store2: {}
};

// var db = new DB('db', config);
var db = new DB('db');

// db.addStore('store1', 'email').addIndex('!email', 'name', 'firstName');