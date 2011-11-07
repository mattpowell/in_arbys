var id = 'ui/Abstract',
	klass = li.require( 'libraries/klass' ),
	EventProvider = li.require( 'providers/Event' ),
	Abstract;

Abstract = klass( function ( element, settings ){

	var Abstract = this,
		Event,
		defaults = {
			observers: []
		},
		observers,
		namespace;
	
	settings = _.extend( defaults, settings );
	observers = settings.observers;

	namespace = '.' + settings.namespace || '';

	Event = new EventProvider( {
		proxy: element
	} );

	function notify( type, parameters ) {
		_.each( observers, function( observer, index ) {
			observer.trigger ? observer.trigger( type, parameters ) : $( observer ).trigger( type, parameters );
		} );
	}

	Abstract.bind = function( type, handler ) {
		return Event.bind( type + namespace, handler );
	}
	Abstract.unbind = function( type ) {
		return Event.unbind( type + namespace );;
	}
	Abstract.trigger = function( type, parameters ) {
		notify( type + namespace, parameters );
		return Event.trigger( type + namespace, parameters );
	}
	Abstract.subscribe = function( observer ) {
		observers.push( observer );
	}

	element.data( id, this );

} );

if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = Abstract;
}
