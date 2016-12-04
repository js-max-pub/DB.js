class DB {

	constructor(name, version) {
		this.upgradeInfo = {};
		this.openDB(name, version);
	}

	openDB(name = 'database', version = 1) {
		this.name = name;
		this.version = version;
		if (this.db) this.db.close();
		let request = window.indexedDB.open(name, version);

		request.onerror = event => {
			console.log('DB.error', event.target.error.message);
			let currentVersion = event.target.error.message.match(/([0-9]+)/g).slice(-1);
			if (event.target.error.name == 'VersionError')
				if (currentVersion) this.openDB(name, currentVersion);
				else this.openDB(name, ++version);
		}

		request.onsuccess = event => {
			this.db = event.target.result;
			console.log('DB.ready', 'v' + this.version);
			let stores = this.db.objectStoreNames;
			for (let i = 0; i < stores.length; i++)
			// if (!this[stores[i]])
				this[stores[i]] = new DBstore(this.db, stores[i]);
		}

		request.onupgradeneeded = event => {
			console.log('DB.upgrade');
			let db = event.target.result;
			for (let name in this.upgradeInfo) {
				let conf = this.upgradeInfo[name];
				delete this.upgradeInfo[name];

				try {
					var store = event.target.transaction.objectStore(name);
				} catch (e) {
					console.log('DB.createStore', name, conf.store);
					var store = db.createObjectStore(name, conf.store);
				}

				conf.indices.forEach((ic, index) => {
					try {
						console.log('DB.createIndex', index, ic);
						store.createIndex(index, index, ic);
					} catch (e) {}
				});
			}
		};
	}

	addStore(name, key, indices) {
		if (!this.db.objectStoreNames.contains(name)) return this._addStore(name, key, indices);
		let store = this.db.transaction([name]).objectStore(name);
		for (let index of indices) {
			if (index[0] == '!') index = index.slice(1);
			if (!store.indexNames.contains(index))
				return this._addStore(name, key, indices);
		}
		console.log('DB.addStore', name, '... store and indices already added');
	}

	_addStore(name, key, indices) {
		let conf = {
			store: {},
			indices: new Map()
		};
		if (typeof key == 'number') conf.store.autoIncrement = true;
		if (typeof key == 'string') conf.store.keyPath = key;
		if (typeof key == 'object') conf.store = key;

		for (let index of indices)
			if (index[0] == '!')
				conf.indices.set(index.slice(1), {
					unique: true
				});
			else
				conf.indices.set(index, {
					unique: false
				});
		this.upgradeInfo[name] = conf;
		this.openDB(this.name, ++this.version);
		return this;
	}

	// static logEvent(name, request) {
	// 	req.onsuccess = event => console.log(name, event, request);
	// 	req.onerror = event => console.error(name, event, request);
	// }
}



class DBstore {
	constructor(db, name) {
		// console.log('new DBstore', name);
		this.db = db;
		this.name = name;
	}
	access(type, callback) {
		return this.db.transaction([this.name], "readwrite").objectStore(this.name);
	}
	query(index, filter) {
		if (filter.length == 1) var bounds = IDBKeyRange.only(filter[0]);
		else if (!filter[0]) var bounds = IDBKeyRange.upperBound(filter[1]);
		else if (!filter[1]) var bounds = IDBKeyRange.lowerBound(filter[0]);
		else var bounds = IDBKeyRange.bound(filter[0], filter[1]);
		return new DBcursor(this.write().index(index).openCursor(bounds));
	}
	get(index, key) {
		if (key)
			var tx = this.write().index(index).get(key)
		else
			var tx = this.write().get(index);
		return DBstore.promise(tx);
	}
	add(data) {
		this.access(tx => {
			tx.add(data);
		}, 'readwrite');
		return DBstore.promise(this.write().add(data));
	}
	put(data) {
		return DBstore.promise(this.write().put(data));
	}
	del(key) {
		return DBstore.promise(this.write().delete(data));
	}

	static promise(request) { // transform event-handlers into ES6-Promises
		return new Promise((resolve, reject) => {
			request.onsuccess = event => resolve(request.result);
			request.onerror = event => reject(event);
		});
	}
}



class DBcursor {
	constructor(tx) {
		var list = [];
		tx.onsuccess = event => {
			var cursor = event.target.result;
			if (cursor) {
				if (this.f1)
					this.f1(cursor.value);
				list.push(cursor.value);
				cursor.continue();
			} else {
				if (this.f2)
					this.f2(list);
			}
		};
	}
	forEach(callback) {
		this.f1 = callback;
		return this;
	}
	getAll(callback) {
		this.f2 = callback;
		return this;
	}
	saveTo(map) {

	}
}



// this.write().index(index).openCursor(bounds).onsuccess = event => {
// 	var cursor = event.target.result;
// 	if (cursor) {
// 		if (callback)
// 			callback(cursor.value);
// 		// console.log("CURSOR", cursor.value);
// 		cursor.continue();
// 	}
// };


// return DBstore.promise(this.write().index(name).get(key));


// this.db.getObjectStore(name);
// this.read = this.db.transaction([name]).objectStore(name);
// this.write = this.db.transaction([name], "readwrite").objectStore(name);