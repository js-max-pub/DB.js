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
					// console.log('index....', index, ic, store.indexNames.includes(index));
					try {
						store.createIndex(index, index, ic);
						console.log('DB.createIndex', index);
					} catch (e) {}
				});
			}
		};
	}

	addStore(name, key, ...indices) {
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

	static logState(name, req) {
		req.onsuccess = e => console.log(name, e, req);
		req.onerror = e => console.error(name, e, req);
	}

}



class DBstore {
	constructor(db, name) {
		console.log('new DBstore', name);
		this.db = db;
		this.name = name;
		// this.db.getObjectStore(name);
		// this.read = this.db.transaction([name]).objectStore(name);
		// this.write = this.db.transaction([name], "readwrite").objectStore(name);
	}
	write() {
		return this.db.transaction([this.name], "readwrite").objectStore(this.name);
	}
	get(key) {
		return DBstore.promise(this.write().get(key));
	}
	add(data) {
		return DBstore.promise(this.write().add(data));
	}
	put(data) {
		return DBstore.promise(this.write().put(data));
	}
	del(key) {
		return DBstore.promise(this.write().delete(data));
	}

	static promise(req) { // transform event-handlers into ES6-Promises
		return new Promise((resolve, reject) => {
			req.onsuccess = e => resolve(req.result);
			req.onerror = e => reject(e);
		});
	}
}

// DB.logState('store:' + name, store);
// this.upgradeDone = true;
// for (let name in this.stores)
// 	DB.logState('store:' + name, db.createObjectStore(name, this.stores[name]))
// this.upgradeDone = true;


// listStores() {
// 	return this.db.objectStoreNames;
// }
// addStore(name, config) {
// 	this.stores[name] = config;
// 	if (this.upgradeDone) this.openDB(this.name, this.version++);
// 	return this;
// }
// store(name) {
// 	return new DBstore(this.db, name);
// }

// let storeConf = {};
// if (config[name].key) storeConf.keyPath = config[name].key;
// else storeConf.autoIncrement = true;

// console.log('has store', name, store);
// if (!store)