import WoopMath from "./WoopMath.js"

export const SCREEN_STATUS = {
    EMPTY   : 0,
    PARTIAL : 1,
    FULL    : 2,
}

export default class ScreenSpace {
    constructor( screen_width, screen_height ) {
        this.screen = null
        this.width  = screen_width
        this.height = screen_height
        this.init()
    }
    init = () => {
        this.screen = Array( this.width ).fill().map( () => {
            return [
                SCREEN_STATUS.EMPTY,
                Array( this.height ).fill().map( () => { return SCREEN_STATUS.EMPTY } )
            ]
        } )
    }

    fill_pixel = ( x, y ) => {
        x = WoopMath.value_range( x, 0, this.width  -1 )
        y = WoopMath.value_range( y, 0, this.height -1 )
        this.screen[ x ][ 1 ][ y ] = SCREEN_STATUS.FULL
        this.update_vertical_line( x )
    }
    fill_vertical_line   = ( x, y_start = 0, y_end = this.height -1 ) => {
        x       = WoopMath.value_range( x, 0, this.width  -1 )
        y_start = WoopMath.value_range( y_start, 0, this.height -1 )
        y_end   = WoopMath.value_range( y_end, 0, this.height -1 )
        if( y_start === 0 && y_end === this.height -1 ){
            this.screen[ x ] = [ SCREEN_STATUS.FULL, Array( this.height ).fill( SCREEN_STATUS.FULL ) ]
            return
        }
        for( let y = y_start; y <= y_end; y++ ){
            this.screen[ x ][ 1 ][ y ] = SCREEN_STATUS.FULL
        }
        this.update_vertical_line( x )
    }
    fill_horizontal_line = ( x_start = 0, x_end = this.width -1 ) => {
        x_start = WoopMath.value_range( x_start, 0, this.width -1 )
        x_end   = WoopMath.value_range( x_end, 0, this.width -1 )
        for( let x = x_start; x <= x_end; x++ ){
            this.screen[ x ] = [ SCREEN_STATUS.FULL, Array( this.height ).fill( SCREEN_STATUS.FULL ) ]
        }
    }

    get_empty_horizontal_range = ( x, x_max = this.width -1 ) => {
        x     = WoopMath.value_range( x, 0, this.width -1 )
        x_max = WoopMath.value_range( x_max, 0, this.width -1 )
        if( this.vertical_is_full( x ) ){ return 0 }
        while( x <= x_max && this.vertical_line_has_space( x ) ){ x++ }
        return x
    }

    get_empty_vertical_range = () => {

    }

    has_space = () => {
        for( let x = 0; x < this.width; x++ ){
            if( this.screen[ x ][ 0 ] === SCREEN_STATUS.FULL ){ continue }
            return true
        }
        return false
    }
    is_full   = () => {
        return ! this.has_space()
    }

    horizontal_line_has_space = ( x_start = 0, x_end = this.width -1 ) => {
        x_start = WoopMath.value_range( x_start, 0, this.width -1 )
        x_end   = WoopMath.value_range( x_end, 0, this.width -1 )
        for( let x = x_start; x <= x_end; x++ ){
            if( this.screen[ x ][ 0 ] === SCREEN_STATUS.FULL ){ continue }
            return true
        }
        return false
    }
    horizontal_line_is_full = ( x_start = 0, x_end = this.width -1 ) => {
        return ! this.horizontal_line_has_space( x_start, x_end )
    }

    vertical_line_has_space = ( x ) => {
        x = WoopMath.value_range( x, 0, this.width -1 )
        if( this.screen[ x ][ 0 ] === SCREEN_STATUS.FULL){ return false }
        return true
    }
    vertical_is_full         = ( x ) => {
        return ! this.vertical_line_has_space( x )
    }

    update_vertical_line = ( x ) => {
        x = WoopMath.value_range( x, 0, this.width -1 )
        if( ! this.screen[ x ][ 1 ].includes( 0 ) ){
            this.screen[ x ][ 0 ] = SCREEN_STATUS.FULL
        }else if( this.screen[ x ][ 1 ].includes( 1 ) ){
            this.screen[ x ][ 0 ] = SCREEN_STATUS.PARTIAL
        }else{
            this.screen[ x ][ 0 ] = SCREEN_STATUS.EMPTY
        }
    }

    pixel_has_space = ( x = 0, y = this.width  -1 ) => {
        x = WoopMath.value_range( x, 0, this.width  -1 )
        y = WoopMath.value_range( y, 0, this.height -1 )
        return ( this.screen[ x ][ 1 ][ y ] === SCREEN_STATUS.EMPTY ) ? true : false
    }
    pixel_is_full = ( x = 0, y = this.width  -1 ) => {
        return ! this.pixel_has_space( x, y )
    }

}