'use strict';

var _ = require('lodash');

module.exports = function (Connection) {
  Connection.addInstanceMethods(
    /** @lends Connection.prototype */
    {
      /**
       * Retrieves the full metadata about a folder,
       * including information about when it was last updated as well as the files and folders
       * contained in it. The root folder of a Box account is always represented by the id “0″.
       * @summary Get Information About a Folder.
       * @see {@link https://developers.box.com/docs/#folders-get-information-about-a-folder}
       * @param {number} id - The folder's ID.
       * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
       * @param {RequestHeaders} [headers] - Additional headers.
       */
      getFolderInfo: function (id, done, headers) {
        if (!_.isNumber(id)) {
          return done(new Error('id must be specified.'));
        }
        this.request(['folders', id], 'get', done, null, null, null, headers);
      },

      /**
       * Standard {@linkcode fields, limit, offset} options, used in several connection methods.
       * @external OptsFLO
       * @see {@link https://developers.box.com/docs/#folders-retrieve-a-folders-items}
       */

      /**
       * Retrieves the files and/or folders contained within this folder without any other metadata
       * about the folder. Any attribute in the full files or folders objects can be passed in with
       * the {@linkcode opts.fields} parameter to get specific attributes, and only those specific
       * attributes back; otherwise, the mini format is returned for each item by default.
       * Multiple attributes can be passed in separated by commas e.g.
       * {@linkcode opts.fields=name,created_at}. Paginated results can be retrieved using the
       * {@linkcode opts.limit} and {@linkcode opts.offset} parameters.
       * @summary Retrieve a Folder’s Items.
       * @see {@link https://developers.box.com/docs/#folders-retrieve-a-folders-items}
       * @param {number} id - The folder's ID.
       * @param {external:OptsFLO} opts - Request options. Can be null.
       * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
       * @param {RequestHeaders} [headers] - Additional headers.
       */
      getFolderItems: function (id, opts, done, headers) {
        if (!_.isNumber(id)) {
          return done(new Error('id must be specified.'));
        }
        this.request(['folders', id, 'items'], 'get', done, opts, null, null, headers);
      },

      /**
       * Used to create a new empty folder. The new folder will be created inside of the
       * specified parent folder.
       * @summary Create a New Folder.
       * @see {@link https://developers.box.com/docs/#folders-create-a-new-folder}
       * @param {string} name - The folder's name.
       * @param {number} parent_id - The parent folder's ID.
       * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
       * @param {RequestHeaders} [headers] - Additional headers.
       */
      createFolder: function (name, parent_id, done, headers) {
        if (!_.isString(name) || !_.isNumber(parent_id)) {
          return done(new Error('Invalid params. Required - name: string, parent_id: number'));
        }
        this.request(['folders'], 'post', done, null, {
          name: name,
          parent: {
            id: parent_id.toString()
          }
        }, null, headers);
      },

      /**
       * Fields to set for {@link Connection#updateFolder}.
       * @external FieldsUpdateFolder
       * @see {@link https://developers.box.com/docs/#folders-update-information-about-a-folder}
       */

      /**
       * Used to update information about the folder. To move a folder, update the ID of its parent.
       * To enable an email address that can be used to upload files to this folder, update the
       * {@linkcode fields.folder_upload_email} attribute. An optional {@linkcode header[If-Match]}
       * header can be included to ensure that client only updates the folder if it knows about
       * the latest version.
       * @summary Update Information About a Folder.
       * @see {@link https://developers.box.com/docs/#folders-update-information-about-a-folder}
       * @param {number} id - The folder's ID.
       * @param {external:FieldsUpdateFolder} fields - The fields to update.
       * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
       * @param {RequestHeaders} [headers] - Additional headers.
       */
      updateFolder: function (id, fields, done, headers) {
        if (!_.isNumber(id)) {
          return done(new Error('id must be specified.'));
        }
        if (!_.isObject(fields)) {
          return done(new Error('An fields object must be provided.'));
        }
        this.request(['folders', id], 'put', done, null, fields, null, headers);
      },

      /**
       * Options to pass to {@link Connection#deleteFolder}.
       * @external OptsDeleteFolder
       * @see {@link https://developers.box.com/docs/#folders-delete-a-folder}
       */

      /**
       * Used to delete a folder. A recursive parameter must be included in order to delete folders
       * that have items inside of them. An optional {@linkcode header[If-Match]} header can be
       * included to ensure that client only deletes the folder if it knows about the latest version.
       * @summary Delete a Folder.
       * @see {@link https://developers.box.com/docs/#folders-delete-a-folder}
       * @param {number} id - The folder's ID.
       * @param {external:OptsDeleteFolder} opts - Options to control recursive delete.
       * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
       * @param {RequestHeaders} [headers] - Additional headers.
       */
      deleteFolder: function (id, opts, done, headers) {
        if (!_.isNumber(id)) {
          return done(new Error('id must be specified.'));
        }
        this.request(['folders', id], 'delete', done, opts, null, null, headers);
      },

      /**
       * Used to create a copy of a folder in another folder. The original version of the folder
       * will not be altered.
       * @summary Copy a Folder.
       * @see {@link https://developers.box.com/docs/#folders-copy-a-folder}
       * @param {number} id - The source folder's ID.
       * @param {number} parent_id - The destination parent folder's ID.
       * @param {string} name - The destination folder's name. Can be null.
       * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
       * @param {RequestHeaders} [headers] - Additional headers.
       */
      copyFolder: function (id, parent_id, name, done, headers) {
        if (!_.isNumber(id) || !_.isNumber(parent_id)) {
          return done(new Error('Invalid params. Required - id: number, parent_id: number'));
        }

        var opts = {
          parent: {
            id: parent_id.toString()
          }
        };
        if (name) {
          opts.name = name;
        };

        this.request(['folders', id, 'copy'], 'post', done, null, opts, null, headers);
      },

      /**
       * Options to pass to {@link Connection#folderSharedLink}.
       * @external OptsFolderSharedLink
       * @see {@link https://developers.box.com/docs/#folders-create-a-shared-link-for-a-folder}
       * @example
       * var opts = {
       *   access: 'open',
       *   can_download: 'open'
       * };
       */

      /**
       * Used to create a shared link for this particular folder.
       * {@link http://blog.box.com/2012/04/share-your-stuff-and-stay-in-control-using-box-shared-links/|Please see here}
       * for more information on the permissions available for shared links. In order to disable
       * a shared link, set {@linkcode opts} to null.
       * @summary Create a Shared Link for a Folder.
       * @see {@link https://developers.box.com/docs/#folders-create-a-shared-link-for-a-folder}
       * @param {number} id - The folder's ID.
       * @param {external:OptsFolderSharedLink} opts - Link options.
       * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
       * @param {RequestHeaders} [headers] - Additional headers.
       */
      folderSharedLink: function (id, opts, done, headers) {
        if (!_.isNumber(id)) {
          return done(new Error('id must be specified.'));
        }
        this.request(['folders', id], 'put', done, null, {
          shared_link: opts
        }, null, headers);
      },

      /**
       * Use this to get a list of all the
       * {@link http://developers.box.com/docs/#collaborations|collaborations} on a folder
       * i.e. all of the users that have access to that folder.
       * @summary View a Folder’s Collaborations.
       * @see {@link https://developers.box.com/docs/#folders-view-a-folders-collaborations}
       * @param {number} id - The folder's ID.
       * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
       * @param {RequestHeaders} [headers] - Additional headers.
       */
      getFolderCollaborations: function (id, done, headers) {
        if (!_.isNumber(id)) {
          return done(new Error('id must be specified.'));
        }
        this.request(['folders', id, 'collaborations'], 'get', done, null, null, null, headers);
      },

      /**
       * Retrieves the files and/or folders that have been moved to the trash. Any attribute
       * in the full {@link http://developers.box.com/docs/files/file-object-2/|files} or
       * {@link http://developers.box.com/docs/folders/folder-object-2/|folders} objects can
       * be passed in with the {@linkcode opts.fields} parameter to
       * get specific attributes, and only those specific attributes back; otherwise, the mini
       * format is returned for each item by default. Multiple attributes can be passed in
       * separated by commas e.g. {@linkcode opts.fields='name,created_at'}. Paginated results
       * can be retrieved using the {@linkcode opts.limit} and {@linkcode opts.offset} parameters.
       * @summary Get the Items in the Trash.
       * @see {@link https://developers.box.com/docs/#folders-get-the-items-in-the-trash}
       * @param {external:OptsFLO} opts - Request options. Can be null.
       * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
       * @param {RequestHeaders} [headers] - Additional headers.
       */
      getTrashedItems: function (opts, done, headers) {
        this.request(['folders', 'trash', 'items'], 'get', done, opts, null, null, headers);
      },

      /**
       * Retrieves an item that has been moved to the trash.
       * @summary Get a Trashed Folder.
       * @see {@link https://developers.box.com/docs/#folders-get-a-trashed-folder}
       * @param {number} id - The folder's ID.
       * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
       * @param {RequestHeaders} [headers] - Additional headers.
       */
      getTrashedFolder: function (id, done, headers) {
        if (!_.isNumber(id)) {
          return done(new Error('id must be specified.'));
        }
        this.request(['folders', id, 'trash'], 'get', done, null, null, null, headers);
      },

      /**
       * Permanently deletes an item that is in the trash. The item will no longer exist in Box.
       * This action cannot be undone.
       * @summary Permanently Delete a Trashed Folder.
       * @see {@link https://developers.box.com/docs/#folders-permanently-delete-a-trashed-folder}
       * @param {number} id - The folder's ID.
       * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
       * @param {RequestHeaders} [headers] - Additional headers.
       */
      deleteTrashedFolder: function (id, done, headers) {
        if (!_.isNumber(id)) {
          return done(new Error('id must be specified.'));
        }
        this.request(['folders', id, 'trash'], 'delete', done, null, null, null, headers);
      },

      /**
       * Restores an item that has been moved to the trash. Default behavior is to restore the
       * item to the folder it was in before it was moved to the trash. If that parent folder
       * no longer exists or if there is now an item with the same name in that parent folder,
       * the new parent folder and/or new name will need to be included in the request.
       * @summary Restore a Trashed Folder.
       * @see {@link https://developers.box.com/docs/#folders-restore-a-trashed-folder}
       * @param {number} id - The folder's ID.
       * @param {string} name - The folder's name. Can be null.
       * @param {number} parent_id - The parent folder's ID. Can be null.
       * @param {requestCallback} done - The callback to invoke (with possible errors) when the request returns.
       * @param {RequestHeaders} [headers] - Additional headers.
       */
      restoreTrashedFolder: function (id, name, parent_id, done, headers) {
        if (!_.isString(name) || !_.isNumber(parent_id)) {
          return done(new Error('Invalid params. Required - name: string, parent_id: number'));
        }

        var opts = {};
        if (name) {
          opts.name = name;
        }
        if (parent_id) {
          opts.parent = {
            id: parent_id.toString()
          };
        };

        this.request(['folders', id], 'post', done, null, opts, null, headers);
      }
    });
};