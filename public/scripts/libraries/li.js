/**
 * Athena Core Javascript Library
 *
 * JSLint Settings:
 * jslint white: true, onevar: true, undef: true, nomen: true, eqeqeq: true,
 * plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true,
 * immed: true, devel: true
 */

/*****************************************************************************
  Internet Information Superhighway 2.0 v5
*****************************************************************************/

'use strict';

( function( window, document, undefined ) {

	var li = {},
		modules = [],
		packages = {},
		loaders = {};

	//Allow resource sharing across *.linkedin.com,
	//This should be factored out with via proxy.

	if( document.domain.match( 'linkedin.com' ) ) {
		document.domain = 'linkedin.com';
	}

	window.ENV_CONFIG = ENV_CONFIG || {};

	li.environment = _.extend( {
		debug: false,
		baseUri: ''
	}, ENV_CONFIG );

	function cacheScript( id ) {
		var pckg,
			key;

		if( Modernizr.localstorage && li.environment.debug === false ) {
			pckg = packages[id];
			key = pckg.id + pckg.version;
			localStorage[key] = pckg.__script;
		}
	}
	function evalScript( code ) {
		if ( window.execScript ) {
			window.execScript( code );
		} else {
			window.eval.call( window, code );
		}
	}
	function Require( ids, callback ) {
		var required = [],
			interfaces = ids,
			request;

		function getScript( id ) {
			var pckg = packages[id],
				key,
				loader = new ResourceLoader();

			function ResourceLoader(){
				var ResourceLoader = this;

				function guid() {
					function S4() {
						return ( ( ( 1 + Math.random() ) * 0x10000 ) | 0 ).toString( 16 ).substring( 1 );
					}
					return ( S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4() );
				}

				ResourceLoader.id = guid();

				loaders[ResourceLoader.id] = ResourceLoader;
				ResourceLoader.proxyEventHandler = function( response ) {
					pckg.__script = response;
					cacheScript( pckg.id );
					resolve( pckg.id );
				}
				ResourceLoader.load = function( url ){
					( function recurse() {
						if( window.getResource ) {
							window.getResource( ResourceLoader.id, url );
						} else {
							window.setTimeout( recurse, 1 );
						}
					}() );
				}
			}
			function resolve( id ) {
				var i,
					code;

				for( i in packages ) {
					packages[i].requires = _.reject( packages[i].requires, function ( item ) {
						return ( item === id );
					} );
				}

				required = _.reject( required, function( item, index ) {
					if( packages[item].requires.length === 0 && packages[item].__script ) {
						if( li.environment.debug ) {
							code = ( '( function () {\n' + packages[item].__script + '\nconsole.log(\'Module "' + item + '" ready.\' );\n}() );' );
						} else {
							code = ( '( function () {\n' + packages[item].__script + '\n}() );' );
						}
					
						try {
							evalScript( code );
						} catch ( e ) {
							console.error( 'Module ', item, ' could not be loaded.\n', e )
							return false;
						}
					
						if( module.exports !== true ) {
							eval( packages[item].__namespace + ' = module.exports;' );
							module.exports = true;
						}
					
						return true;
					
					} else {
						return false;
					}
				} );

				if( required.length === 0 ) {
					applyCallback( callback );
				}

			}

			if( Modernizr.localstorage && li.environment.debug === false ) {
				key = pckg.id + pckg.version;
				if( localStorage[key] ) {
					pckg.__script = localStorage[key];
					resolve( pckg.id );
					return;
				}
			}

			loader.load( pckg.path );

			return;

		}
		function require( ids ) {
			_.each( ids, function( item, index ) {

				var pckg = packages[item],
					requirements,
					namespaces = item.split( '/' ),
					namespace = 'li',
					context = li;
			
				_.each( namespaces, function( item, index ) {

					if( context[namespaces[index]] === undefined ) {
						context[namespaces[index]] = {};
					}

					context = context[namespaces[index]];
					namespace += '[\'' + namespaces[index] + '\']';

				} );

				if( !pckg ) {
					console.error( 'The Module with id ' + item + ' is not defined.' );
					return;
				}

				if( !pckg.__required ) {
					pckg.__required = true;
					pckg.__namespace = namespace;
					requirements = pckg.requires;

					( function recurse( requirements ) {
						if( requirements.length > 0 ) {
							_.each( requirements, function( item, index ) {
								recurse( packages[item].requires );
								if( _.indexOf( pckg.requires, item ) === -1 ) {
									pckg.requires.push( item );
								}
							} );
						}
					}( requirements ) );

					getScript( pckg.id );

				}

			} );
		}
		function applyCallback( callback ) {
			_.each( interfaces, function( item, index ) {
				interfaces[ index ] = eval( packages[item].__namespace );
			} );
			callback.apply( this, interfaces );
		}

		this.execute = function() {
			( function gather( ids ) {
				_.each( ids, function( item, index ) {
					gather( packages[ item ].requires );
					if( _.indexOf( modules, item ) === -1 ) {
						required.push( item );
						modules.push( item );
					}
				} );
			}( ids ) );

			if( required.length > 0 ) {
				require( required );
			}
		}

	}

	li.define = function( definitions ){
		_.each( definitions, function( item, index ) {
			packages[item.id] = {
				id: item.id,
				version: item.version,
				requires: item.requires || [],
				path: item.path || li.environment.baseUri + item.id + '.js'
			};
		} );
	}
	li.require = function( ids, callback ){
		if( typeof ids === 'string' ){
			var pckg = packages[ids];
			return eval( pckg.__namespace );
		}
		new Require( ids, callback ).execute();
	}
	li.proxyEventHandler = function ( event ) {
		var parameters = event.data.split( '&response=' ),
			response,
			key;

		response = parameters[1];
		key = parameters[0].split( '?key=' )[1];

		loaders[key].proxyEventHandler( response );

	}

	//CommonJS
	window.module = { exports: true };

	//Expose li, module to global scope
	window.li = li;

}( this, this.document ) );

( function DependancyTree(){
	li.define( [
		{
			id: 'libraries/klass',
			version: '1.0.0',
			path: '/scripts/packages/libraries/klass.js'
		}, {
			id: 'providers/Event',
			version: '0.0.1',
			path: '/scripts/packages/providers/Event.js',
			requires: ['libraries/klass']
		}, {
			id: 'ui/Abstract',
			version: '0.0.1',
			path: '/scripts/packages/ui/Abstract.js',
			requires: ['libraries/klass', 'providers/Event']
		}
	] );

}() );