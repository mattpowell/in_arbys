
( function( $ ){

	var pattern = pattern = '*[role*="ui:"]',
		queues = {},
		actions = {},
		required = [];

	//Queue a node for execution once associated package is ready
	function enqueue( key, $node ) {
		if( $node.data().queued ) {
			return;
		} else {
			if( queues[key] ) {
				queues[key].push( $node );
			} else {
				queues[key] = [$node];
			}
			$node.data( 'queued', true );
		}
	}

	//Parse node for UI components, load and instantiate, nessasay pacakges.
	$.fn.act = function() {
		var $this = $( this ),
			count;

		//Instantiate a node's role.
		function execute( $node, role, Action ) {
			new Action( $node, new Function ( '$this', 'return ' + $node.data().config + '[\'' + role + '\']'  )( $node ) );
			$node.data( 'acting', true );
			console.info( 'Action ' + role + ' executed with', $node );
			count -= 1;
			if( count  === 0 ) {
				$this.trigger( 'acting' );
			}
		}

		//Keep track of total actors found, so we can trigger an acting event when they're instanciated
		count = _.reject( $( pattern, $this ), function( item, index ) {
			return $( item ).data().acting;
		} ).length;

		//Recurse over children to make sure UI components are instanciated inside out. 
		( function recurse( $this ) {
			var $actors,
				roles;

			//It's already instantiated so there's no need to continue
			if( $this.data().acting ) {
				return;
			}

			//UI components that are children of the passed in node.
			$actors = _.reject( $( pattern, $this ), function( item, index ) {
				return $( item ).data().acting;
			} );

			//There are no child UI components, so it's safe to instanceiate it, or queue it up and load nessasary packages
			if( $actors.length === 0 ) {
				if( $this.is( pattern ) ) {
					roles = _.reject( ( $this.attr( 'role' ) || '' ).split( ' ' ), function( role, index ) {
						return ( role.indexOf( 'ui:' ) === -1 );
					} );
					_.each( roles, function( role, index ) {
						var module;
						if( typeof actions[role] === 'function' ) {
							execute( $this, role, actions[role] );
						} else {
							enqueue( role, $this );
							module = role.replace( ':', '/' );
							if( _.indexOf( required, module ) === -1 ) {
								required.push( module );
								li.require( [ module ], function( Action ) {
									actions[role] = Action;
									queue = queues[role];
									while ( queue.length > 0 ) {
										execute( queue.pop(), role, Action );
									}
									recurse( $this.parents() );
								} );
							}
						}
					} );
				} else {
					return;
				}
			}

			//Lather, rinse, repeat...
			_.each( $this.contents(), function( node, index ) {
				recurse( $( node ) );
			} );

		} () );

	}

}( jQuery ) );

( function( $ ){

	//Returns a control.
	$.fn.getControl = function( id ) {
		return $( this ).data( id );
	}

}( jQuery ) );