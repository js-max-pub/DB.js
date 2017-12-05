var config = {
	store3: {
		key: 'email',
		unique: ['email'],
		indexed: ['name']
	},
	store2: {}
};

if (!LOG) LOG = console.log;


// var db = new DB('db', config);
// var db = new DB('db');
// db.addStore('contacts', ['name', '!email','city']);

db = new DB('ContactApp', 3, {
	contacts: '@email,name,city,phone'
});

db.upgrade((currentVersion) => {
	switch (currentVersion) {
		case 1: // balsdf
		case 2: // fasdfasd
	}
});

// db = new DB('ContactApp');
// db.addStore('contacts', ['name', '!email', 'city']);
// db.addStore('contacts', '@email, name, city, !phone');


db.contacts.add({
	name: 'Schmidt',
	city: 'Hamburg'
}, {
	name: 'Meier',
	city: 'Hamburg'
});

// db.contacts.add('http://example.com/addressbook.json');

db.contacts.query('name', ['a', 'o']).forEach(contact => {
	console.log('contact', contact);
})

// .getAll(lst => {
// 	console.log("FULL LIST", lst);
// });