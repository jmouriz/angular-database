(function(window, angular, undefined) {
   
   'use strict';
   
   angular.module('ngDatabase', []).service('$database', ['$window',  function($window) {
      var $this = this;
   
      var $database = undefined;
      var $result = undefined;
      var $transaction = undefined;
      var $store = undefined;
      var $request = undefined;
   
      $this.open = function(database, version, upgrade, success) {
         $database = $window.indexedDB;
         var request = $database.open(database, version);
   
         request.onupgradeneeded = function(event) {
            $result = event.target.result;
            upgrade();
         };
   
         request.onsuccess = function(event) {
            $result = event.target.result;
            success();
         };
   
         request.onerror = function(event) {
            console.log('open =>', event.target.error);
         };
      };
   
      $this.exists = function(store) {
         return $result.objectStoreNames.contains(store);
      };
   
      $this.create = function(store) {
         $store = $result.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
      };
   
      $this.store = function(store, type) {
         if ($result !== undefined) {
            $transaction = $result.transaction([store], type === undefined ? 'readonly' : 'readwrite');
            $store = $transaction.objectStore(store);
         }
         return $this;
      };
   
      $this.append = function(data, callback) {
         if ($store === undefined) {
            return;
         }
         $request = $store.add(data);
         $request.onsuccess = function(event) {
            if (typeof callback == 'function') {
               callback(event.target.result);
            }
         };
         $request.onerror = function(event) {
            console.log('append =>', event.target.error);
         };
      };
   
      $this.delete = function(key) {
         $request = $store.delete(key);
         $request.onsuccess = function(event) {
         };
         $request.onerror = function(event) {
            console.log('delete =>', event.target.error);
         };
      };
   
      $this.clear = function(key, data) {
         $request = $store.clear();
         $request.onsuccess = function(event) {
         };
         $request.onerror = function(event) {
            console.log('clear =>', event.target.error);
         };
      };
   
      $this.all = function(callback) {
         if ($store === undefined) {
            return;
         }
         //var defered = $q.defer();
         var records = [];
         var cursor = $store.openCursor();
         cursor.onsuccess = function(event) {
            var result = event.target.result;
            if (result) {
               records.push(result.value);
               result.continue();
            } else {
               callback(records);
               //defered.resolve(records);
            }
         };
         cursor.onerror = function(event) {
            $('Toolbar').busy(false);
            console.log('all =>', event.target.error);
            //defered.reject(event.target.error);
         };
         //return defered.promise;
      };
   
      $this.update = function(key, data) {
         $request = $store.get(key);
         $request.onsuccess = function(event) {
            var update = $store.put(data);
            update.onsuccess = function(event) {
               // console.log('updated', $request.result, 'with', data);
            };
            update.onerror = function(event) {
               console.log('update =>', event.target.error);
            };
         };
         $request.onerror = function(event) {
            console.log('get for update =>', event.target.error);
         };
      };
   
      $this.get = function(key, callback) {
         if ($store !== undefined) {
            $request = $store.get(key);
            $request.onsuccess = function(event) {
               callback($request.result);
            };
            $request.onerror = function(event) {
               console.log('get =>', event.target.error);
            };
         }
      };
   }]);
})(window, window.angular, undefined);
