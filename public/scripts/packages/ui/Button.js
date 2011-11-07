var id = 'ui/Button',
	Abstract = li.require( 'ui/Abstract' ),
	Button;

Button = Abstract.extend( function ( element, settings ){
	var Button = this,
		defaults = {
			event: 'click',
			parameters: []
		},
		out;

	settings = _.extend( defaults, settings );

	out =  settings.out;

	element.bind( settings.event, function ( event ) {
		Button.send( out );
	} )

} );

if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = Button;
}