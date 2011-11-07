var id = 'ui/Carousel',
	Abstract = li.require( 'ui/Abstract' ),
	Carousel;

Carousel = Abstract.extend( function ( element, settings ){
	var Carousel = this,
		defaults = {};

	settings = _.extend( defaults, settings );

	element.data( id, this );

} );

if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = Carousel;
}