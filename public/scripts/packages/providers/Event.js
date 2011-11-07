/**
 * @id providers/Event
 * @requires ['libraries/jquery', 'libraries/klass']
 */

var klass = li.require( 'libraries/klass' ),
	EventProvider;

var EventProvider = klass( function ( settings ){
	var EventProvider = this,
		defaults = {
			proxy: $( {} )
		},
		cache = {},
		proxy,
		provider = true;

	settings = _.extend( defaults, settings );

	proxy = settings.proxy;
	cache.bind = settings.proxy.bind;
	cache.unbind = settings.proxy.unbind
	cache.trigger = settings.proxy.trigger;

	EventProvider.bind = function ( type, handler ) {
		return ( function() {
			cache.bind.apply( settings.proxy, [type, handler] );
			return EventProvider;
		}() );
	}

	EventProvider.unbind = function( type ) {
		return proxy.unbind = ( function() {
			cache.unbind.apply( settings.proxy, [type] );
			return EventProvider;
		}() );
	}
	EventProvider.trigger = function( type, parameters ) {
		return ( function() {
			cache.trigger.apply( settings.proxy, [type + ':before', parameters] );
			cache.trigger.apply( settings.proxy, [type, parameters] );
			cache.trigger.apply( settings.proxy, [type + ':after', parameters] );
			return EventProvider;
		}() );
	}

} );

if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = EventProvider;
}