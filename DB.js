class DB {
	constructor(name = 'database', version = 1) {
		this.stores = {};
		let request = window.indexedDB.open(name, version);
		request.onsuccess = event => {
			console.log('db-success', event);
			this.db = event.target.result;
		};
		request.onupgradeneeded = event => {
			console.log('db-upgrade', event);
			this.db = event.target.result;
			for (let name in this.stores)
				this.db.createObjectStore(name, this.stores[name]).onsuccess = event => {
					console.log('store created', event);
				};

		};
	}
	addStore(name, config) {
		this.stores[name] = config;
		return this;
	}
	store(name) {
		return new DBstore(this.db, name);
	}

}

class DBstore {
	constructor(db, name) {
		this.db = db;
		this.name = name;
		// this.db.getObjectStore(name);
		this.read = this.db.transaction([name]).objectStore(name);
		this.write = this.db.transaction([name], "readwrite").objectStore(name);
	}
	static promise(req) { // transform event-handlers into ES6-Promises
		return new Promise((resolve, reject) => {
			req.onsuccess = e => resolve(req.result);
			req.onerror = e => reject(e);
		});
	}
	get(key) {
		return DBstore.promise(this.read.get(key));
	}
	add(data) {
		return DBstore.promise(this.write.add(data));
	}
}