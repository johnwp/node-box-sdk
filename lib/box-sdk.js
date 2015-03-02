'use strict';

/*
 * https://github.com/adityamukho/node-box-sdk
 *
 * Copyright (c) 2014 Aditya Mukhopadhyay
 * Licensed under the MIT license.
 */

/**
 * The Box SDK entry point.
 * @example
 * var box_sdk = require('box-sdk');
 * @module box-sdk
 */

/**
 * A callback with an optional error argument.
 * @callback optionalErrorCallback
 * @param {Error} [error] - Any error that occurred while attempting to stop the server.
 */

/**
 * A Writable Stream.
 * @external Writable
 * @see {@link http://nodejs.org/api/stream.html#stream_class_stream_writable}
 */

var base = require('base-framework'),
	_ = require('lodash'),
	Log = require('log'),
	Connection = require('./connector');

/**
 * Constructor options for the Box object.
 * @typedef {Object} BoxInit
 * @property {string} client_id - The Box app's Client ID.
 * @property {string} client_secret - The Box app's Client Secret.
 * @property {number} port - The port on which to listen for the authorization callback.
 * @property {string} [host] - Optional host on which to listen for the authorization callback.
 * Defaults to {@linkcode localhost}.
 */

/**
 * @class Box
 * @classdesc The Box object: One instance for each client. This is used to get {@link Connection|connections}.
 * @param {?BoxInit} [opts] - Client parameters required for standalone operation. Should be omitted when
 * running with [passport authentication middleware]{@link https://github.com/bluedge/passport-box}.
 * @param {?string} [logLevel] - Optional log level. Defaults to {@linkcode info}.
 * @param {?external:Writable} [logStream] - Optional writable stream for log output. Defaults to console.
 * @see {@link https://www.npmjs.org/package/log#log-levels}
 */
var Box = base.createChild().addInstanceMethods(
	/** @lends Box.prototype */
	{
		init: function (opts, logLevel, logStream) {
			var self = this;
			self.connections = {};

			if (opts) {
				if (!opts.client_id) {
					throw new Error('Must specify a client_id');
				}
				if (!opts.client_secret) {
					throw new Error('Must specify a client_secret');
				}

				self.port = parseInt(opts.port, 10);
				if (!_.isNumber(self.port)) {
					throw new Error('Must specify a numeric port');
				}

				self.host = opts.host || 'localhost';
				self.log = new Log(logLevel || 'info', logStream);
				self.client_id = opts.client_id;
				self.client_secret = opts.client_secret;
                self.refresh_token = opts.refresh_token;

				var router = require('router'),
					http = require('http'),
					request = require('request'),
					url = require('url');

				var route = router();
                var tokenParams = {
                        client_id: self.client_id,
                        client_secret: self.client_secret,
                        grant_type: 'refresh_token',
                        refresh_token: self.refresh_token
                    },
                    authUrl = 'https://app.box.com/api/oauth2/token';

                request.post({
                    url: authUrl,
                    form: tokenParams,
                    json: true
                }, function (err, res, body) {
                    console.log('\nTOKEN REFRESH: ', body, '\n');

                    if (err) {
                        /**
                         * Fires when an error occurs while setting access tokens have been set on this
                         * connection. Could be triggered more than once, so listeners must deregister
                         * after receiving the first event. Preferably use the {@link Connection#ready} method.
                         * @event Connection#"tokens.error"
                         * @type {Error}
                         * @see {@link Connection#ready}
                         */
                        self.connections['ehgt'].emit('tokens.error', err);
                    } else {
                        self.connections['ehgt']._setTokens(body);
                    }
                });
			}
		},

		/**
		 * Get a connection for the provided email id.
		 * @param {string} email - The email account identifier to connect to.
		 * @returns {Connection} A connection on which API calls can be made.
		 * @fires Connection#"tokens.set"
		 */
		getConnection: function (email) {
			if (this.connections[email]) {
				return this.connections[email];
			}

			var connection = new Connection(this, email);
			this.connections[email] = connection;
			return connection;
		},

		/**
		 * Used with Passport {@link https://github.com/bluedge/passport-box|BoxStrategy}.
		 * @returns {function} A callback for use in the BoxStrategy.
		 * @example
		 * passport.use(new BoxStrategy({
		 *   clientID: BOX_CLIENT_ID,
		 *   clientSecret: BOX_CLIENT_SECRET,
		 *   callbackURL: "http://127.0.0.1:3000/auth/box/callback"
		 * }, box.authenticate()));
		 */
		authenticate: function () {
			return _.bind(function (access_token, refresh_token, profile, done) {
				var email = profile.login,
					connection = this.getConnection(email);
				connection._setTokens({
					access_token: access_token,
					refresh_token: refresh_token
				});
				return done(null, profile);
			}, this);
		},

		/**
		 * Stop the authorization callback listener when running in standalone mode.
		 * @param {optionalErrorCallback} callback - Called after asynchronously stopping the server.
		 */
		stopServer: function (callback) {
			if (this.server) {
				this.log.debug('Stopping server...');
				try {
					this.server.close();
					_.forIn(this.sockets, function (socket) {
						socket.destroy();
					});
					callback();
				} catch (err) {
					callback(err);
				}
			}
		}
	});

/**
 * The {@link Box} prototype, instances of which represent a specific client.
 * @example
 * var box = box_sdk.Box({
 *   client_id: 'client id',
 *   client_secret: 'client secret',
 *   port: 9999
 * });
 */
exports.Box = Box;

/**
 * The {@link Connection} prototype, instances of which represent a specific account.
 */
exports.Connection = Connection;