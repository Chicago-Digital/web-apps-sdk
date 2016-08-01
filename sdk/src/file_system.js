/* 
* 
* Copyright © 2016 Adobe. All rights reserved.

* Permission is hereby granted, free of charge, to any person obtaining a
* copy of this software and associated documentation files (the "Software"), 
* to deal in the Software without restriction, including without limitation 
* the rights to use, copy, modify, merge, publish, distribute, sublicense, 
* and/or sell copies of the Software, and to permit persons to whom the 
* Software is furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
* DEALINGS IN THE SOFTWARE.
* 
*/
(function($) {
    'use strict';

    function getParent(x) {
        return x == '/' ? BCAPI.Models.FileSystem.Root : new BCAPI.Models.FileSystem.Folder(x);
    }

    var FILE_REGEX = /^[^\&\%]+$/;

    //common model for files & folders
    var Entity = BCAPI.Models.Model.extend({
        'idAttribute': 'path',

        constructor: function(a1, a2, a3) {
            var attributes, options, initialProps = {};
            if (typeof a1 === 'string') {
                attributes = a2;
                options = a3;
                var path = $.trim(a1);
                if (path == '/') {
                    throw new Error('Cannot instantiate the "/" folder like this. Use BCAPI.Models.FileSystem.Root instead');
                } 
                var o = splitPath(path);
                initialProps.parent =  getParent(o.parent);
                initialProps.name = o.name;
            } else {
                attributes = a1;
                options = a2;
            }
            BCAPI.Models.Model.call(this, attributes, options);
            if (initialProps) {
                this.set(initialProps);
            }
            this._refreshPath();
            var model = this;
            this.on('change:parent sync', function() {
                model._refreshPath();
            });
        },

        endpoint: function() {
            return '/api/v2/admin/sites/current/storage';
        },
        
        url: function() {
            return this.contentUrl() + '?meta';
        },

        /**
         * Returns the url where the content can be accessed.
         * @return {string} The URL of the resource
         * @memberOf BCAPI.Models.FileSystem.File
         * @method
         * @instance
         */
        contentUrl: function() {
            var p = this.get('path');
            if (p[0] == '/') {
                p.substring(1);
            }
            return this.urlRoot() + p;
        },

        validate: function(attr) {
            if (!attr.name || typeof attr.name !== 'string' || !FILE_REGEX.test(attr.name)) {
                return 'Invalid name for file: [' + attr.name + ']';
            }
            if (!attr.path || attr.path === '/') {
                return 'Invalid path for file: [' + attr.path + ']';
            }
        },

        parse: function(result) {
            //converting to a date object instead of the date string
            var dateStr = result.lastModified;
            result.lastModified = new Date(dateStr);
            return result;
        },

        toJSON: function() {
            //only name should be persisted. Other attributes are calculated
            return _.pick(this.attributes, 'name');
        },

        //recomputes the path attribute. Useful to call when parent or name have changed
        _refreshPath: function() {
            this.set('path', mkFilePath(this.get('parent').get('path'), this.get('name')));
        }
    });

    function mkFilePath(dirPath, name) {
        if (dirPath[dirPath.length - 1] == '/') {
            return dirPath + name;
        } else {
            return dirPath + '/' + name;
        }
    }

    function splitPath(path) {
        var parent, name,
            index = path.lastIndexOf('/');
        if (index < 0) {
            name = path;
        } else {
            parent = path.substring(0, index);
            name = path.substring(index + 1);
        }
        if (!parent) {
            parent = '/';
        }
        return {
            'parent': parent,
            'name': name
        };
    }

    /**
     * @namespace BCAPI.Models.FileSystem
     */
    BCAPI.Models.FileSystem = {};

    /**
     * This class allows you to interact with files stored in your BC site.
     * Usage examples:
     *
     * ### Create a new file.
     * 
     * ```javascript
     * var f = BCAPI.Models.FileSystem.Root.file('hello_world.txt');
     * var data = 'Hello World !';
     * f.upload(data).done(function() {
     *     console.log('File uploaded succesfully');
     * });
     * ```
     *
     * A file is created in your site's file system only after uploading some
     * content.
     *
     * The content can be any javascript object, including file objects obtained
     * from html upload forms.
     *
     * BCAPI.Models.FileSystem.Root is the root folder in your site's
     * file structure. You can also create a file object by specifying
     * the file's full path.
     *
     * ```javascript
     * var f = new BCAPI.Models.FileSystem.File('/hello_world.txt');
     * ```
     *
     * If you omit the `/` at the beginning it will be added automatically.
     *
     * So the below is equivalent to the above instantiation:
     * 
     * ```javascript
     * var f = new BCAPI.Models.FileSystem.File('hello_world.txt');
     * ```
     *
     * You can also create a file by specifying the name and the parent folder
     * of the file. The following piece of code creates the file `/my/special/file`:
     * 
     * ```javascript
     * var f = new BCAPI.Models.FileSystem.File({
     *     'parent': new BCAPI.Models.FileSystem.Folder('/my/special'),
     *     'name': 'file'
     * });
     *
     * f.upload(files[0]);
     * ```
     * 
     * ### Get the file metadata
     *
     * ```javascript
     * var f = BCAPI.Models.FileSystem.Root.file('hello_world.txt');
     * f.fetch().done(function() {
     *     console.log('File name is: ', f.get('name'));
     *     console.log('Last update date is: ', f.get('lastModified'));
     * });
     * ```
     *
     * ### Download the file content
     *
     * ```javascript
     * var f = BCAPI.Models.FileSystem.Root.file('hello_world.txt');
     * f.download().done(function(content) {
     *     console.log('File content is: ' + content);
     * });
     * ```
     *
     * ### Rename a file
     *
     * Use `save` to change the name of a file.
     *
     * ```javascript
     * var f = new BCAPI.Models.FileSystem.File('/my/file');
     * f.set('name', 'new-file');
     * f.save().done(function() {
     *     console.log('File name has been changed. Path is ' + f.get('path'));
     *     //prints: /my/new-file
     * });
     *
     * ### Delete the file
     *
     * ```javascript
     * var f = BCAPI.Models.FileSystem.Root.file('hello_world.txt');
     * f.destroy().done(function() {
     *     console.log('File was destroyed');
     * });
     * ```
     *
     * @class
     * @name File
     * @memberOf BCAPI.Models.FileSystem
     * 
     */
     BCAPI.Models.FileSystem.File = Entity.extend({

        /**
         * Uploads a new content for the file. This method can be called if the
         * file isn't yet created - the file will be created afterwards.
         * @param  {any} data the data object which will be the file's content
         * @return {promise}      a promise that will be completed when the file
         *                        is uploaded
         * @memberOf BCAPI.Models.FileSystem.File
         * @method
         * @instance
         */
        upload: function(data) {
            return $.ajax(this.contentUrl(), {
                'contentType': 'application/octet-stream',
                'type': 'PUT',
                'data': data,
                'processData': false,
                'headers': this.headers()
            });
        },

        /**
         * Uploads new content and fetches the metadata for the file which will then
         * be used to populate the object. This method can be called even if the
         * file isn't created yet.
         * Useful if you want to create a file and retrieve it's metadata resulted
         * from the new content immediatly.
         * @param  {any} data The data object
         * @return {promise}      a promise that will be completed when the file
         *                        is uploaded and the new metadata is retrieved.
         *
         * @memberOf BCAPI.Models.FileSystem.File
         * @method
         * @instance
         */
        uploadAndFetch: function(data) {
            var self = this;
            return this.upload(data).then(function() {
                return self.fetch();
            });
        },

        /**
         * Downloads the content of the file
         * @return {promise} a promise which will be resolved with
         *                   the content of the file.
         * 
         * @memberOf BCAPI.Models.FileSystem.File
         * @method
         * @instance
         */
         download: function() {
            return $.ajax(this.contentUrl(), {
                'type': 'GET',
                'headers': this.headers()
            });
        },


        initialize: function() {
            this.set('type', 'file');
        }
    });

    /**
     * This class allows you to interact with the folders in the file system of your site.
     *
     * ### Creating a folder
     * 
     * A folder object can be instantiated in two ways.
     * 
     * You can specify the path of the folder:
     *
     * ```javascript
     * var folder = new BCAPI.Models.FileSystem.Folder('/folder/path');
     * ```
     *
     * You can also specify the name of the folder, and the parent directory:
     * 
     * ```javascript
     * var folder = new BCAPI.Models.FileSystem.Folder({
     *     'parent': BCAPI.Models.FileSystem.Root,
     *     'name': 'my-folder'
     * });
     * ```
     *
     * The root directory `/` cannot be created like this. You can only get it
     * with:
     *
     * ```javascript
     * var root = BCAPI.Models.FileSystem.Root;
     * console.log(root.get('path')); //prints '/'
     * ```
     *
     * It should be noted that just creating an instance of the folder class doesn't
     * actually create the folder on the server. If the folder doesn't exist yet,
     * a call to create is required:
     *
     * ```javascript
     * var folder = new BCAPI.Models.FileSystem.Folder('my-folder');
     * folder.create().done(function() {
     *     console.log('The folder has been created !');
     * });
     * ```
     *
     * ### Get the folder's metadata
     *
     * You use fetch to obtain the folder's details, including the files & folders that
     * the folder contains:
     *
     * ```javascript
     * var folder = new BCAPI.Models.FileSystem.Folder('/my/existing/folder');
     * folder.fetch().done(function() {
     *     console.log('Folder last update date is: ' + folder.get('lastModified'));
     *     console.log('Printing the folder contents: ');
     *     var contents = folder.get('contents');
     *     for (var i = 0; i < contents.length; i++) {
     *         var entity = contents[i];
     *         var isFile = entity instanceof BCAPI.Models.FileSystem.File;
     *         if (isFile) {
     *             console.log('File ' + entity.get('name') + ' updated at ' + entity.get('lastModified'));
     *         } else {
     *             console.log('Folder ' + entity.get('name'));
     *         }
     *     }
     * });
     * ```
     *
     * ### Rename the folder
     *
     * Use `save` to rename a folder:
     * 
     * ```javascript
     * var folder = new BCAPI.Models.FileSystem.Folder('/my/folder');
     * folder.set('name', 'new-folder');
     * folder.save().done(function() {
     *     console.log('The folder has been renamed');
     *     console.log('Path is now ' + folder.get('path'));
     *     //prints: /my/new-folder
     * });
     * ```
     *
     * ### Delete the folder
     *
     * ```javascript
     * var folder = new BCAPI.Models.FileSystem.Folder('/my-folder');
     * folder.destroy().done(function() {
     *     console.log('Folder was deleted');
     * });
     * ```
     * 
     * @class
     * @name Folder
     * @memberOf BCAPI.Models.FileSystem
     * 
     */
    BCAPI.Models.FileSystem.Folder = Entity.extend({

        /**
         * Creates a file object with the specified name and that has as parent
         * this folder.
         * @param  {string} name       The name of the file
         * @param  {object} attributes Properties of the file
         * @param  {object} options    Options for the file
         * @return {BCAPI.Models.FileSystem.File} A file that is a child of this folder
         *
         * @memberOf BCAPI.Models.FileSystem.Folder
         * @method
         * @instance
         */
        file: function(name, attributes, options) {
            var fullAttributes = _.extend({'parent': this, 'name': name}, attributes);
            return new BCAPI.Models.FileSystem.File(fullAttributes, options);
        },

        initialize: function() {
            this.set('type', 'folder');
        },

        /**
         * Creates the specified folder on the server.
         * @return {promise} A promised that will be resolved when the folder is created
         * 
         * @memberOf BCAPI.Models.FileSystem.Folder
         * @method
         * @instance
         */
        create: function() {
            return $.ajax(this.contentUrl() + '?type=folder', {
                'type': 'PUT',
                'processData': false,
                'headers': this.headers()
            });
        },

        parse: function(result) {
            var items = Entity.prototype.parse.call(this, result);
            var parent = this;
            var models = _.map(items.contents, function(obj) {
                obj.parent = parent;
                if (obj.type === 'file') {
                    return new BCAPI.Models.FileSystem.File(obj);
                } else if (obj.type === 'folder') {
                    return new BCAPI.Models.FileSystem.Folder(obj);
                }
            });
            items.contents = models;
            return items;
        }
    });

    var Root = BCAPI.Models.FileSystem.Folder.extend({
        constructor: function() {
            BCAPI.Models.Model.call(this);
            this.set({
                'path': '/',
                'name': '',
                parent: null
            });
        },

        validate: function() { },

        save: function() {
            throw new Error('Operation not supported');
        },

        destroy: function() {
            throw new Error('Operation not supported');
        }

    });

    /**
     * The root of the file system
     * @type {BCAPI.Models.FileSystem.Folder}
     * @memberOf BCAPI.Models.FileSystem
     * @static
     */
    BCAPI.Models.FileSystem.Root = new Root();

})(jQuery);

