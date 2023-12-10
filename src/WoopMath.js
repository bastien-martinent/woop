export default class WoopMath {

    static is_init       = false
    static lookup_tables = { cos : [], sin : [], x_to_angle : [] }
    static pi            = Math.PI
    static pi2           = 2 * this.pi
    static piRad         = this.pi / 180
    static piDeg         = 180 / this.pi
    static min_scale     = 0.00390625
    static max_scale     = 64

    static init = ( renderer ) => {
        for( let i = 0; i < 360; i++ ){
            this.lookup_tables.cos[ i ] = Math.cos( i * this.piRad )
            this.lookup_tables.sin[ i ] = Math.sin( i * this.piRad )
        }
        for( let i = 0; i < renderer.internal_width; i++ ){
            this.lookup_tables.x_to_angle[ i ] = this.radians_to_degrees( Math.atan(
                ( renderer.demi_internal_width - i ) / renderer.screen_distance
            ) )
        }
        this.is_init = true
    }

    static lookup_x_to_angle = ( value ) => {
        if( ! this.is_init ){
            console.log( 'WoopMath need to be init ( after the renderer ) for assessing the lookup table function' )
            return null
        }
        return this.lookup_tables.x_to_angle[ value ]
    }

    static lookup_cos = ( value ) => {
        if( ! this.is_init ){
            console.log( 'WoopMath need to be init for assessing the lookup table function' )
            return null
        }
        return this.lookup_tables.cos[ this.angle_range( value ) ]
    }
    static lookup_sin = ( value ) => {
        if( ! this.is_init ){
            console.log( 'WoopMath need to be init for assessing the lookup table function' )
            return null
        }
        return this.lookup_tables.sin[ this.angle_range( value ) ]
    }

    //TODO::redo
    static scale = ( x, edge_normal, distance, screen_distance, player_angle ) => {
        let x_angle = WoopMath.lookup_x_to_angle( x )
        let num     = screen_distance * Math.cos( WoopMath.degrees_to_radians( edge_normal - x_angle - player_angle ) )
        let den     = distance * Math.cos( WoopMath.degrees_to_radians( x_angle ) )
        let scale   = num / den
        return Math.min( Math.max( scale, this.min_scale ), this.max_scale )
    }

    static distance( point_1, point_2 ){
        return Math.round( Math.sqrt( Math.pow( point_2.x-point_1.x, 2 ) + Math.pow( ( point_2.y-point_1.y ), 2 ) ) )
    }
    static angle_range = ( angle, min_angle = 0 , max_angle = 360, loop = true, round = true ) => {
        if( loop ){
            angle = angle % max_angle
            angle = ( angle < min_angle ) ? angle + max_angle : angle
        }else{
            if( angle > max_angle ){ angle = max_angle }
            if( angle < min_angle ){ angle = min_angle }
        }
        return ( round ) ? Math.round( angle ) : angle
    }
    static value_range = ( value, min, max, loop = false ) => {
        if( loop ){
            if( value > max ){ return min + ( value % max ) }
            if( value > min ){ return max - ( value % max ) }
        }
        return Math.min( Math.max( value, min ), max )
    }
    static random_int_range = ( min = 0, max = 255 ) => {
        min = Math.ceil( min )
        max = Math.floor( max )
        return Math.floor( Math.random() * ( max - min + 1 ) + min )
    }
    static point_to_angle = ( point1, point2 ) => {
        let deltaY = point2.y - point1.y
        let deltaX = point2.x - point1.x
        return this.angle_range( this.radians_to_degrees( Math.atan2( deltaY, deltaX ) ), 0, 360, true, false )
    }
    static radians_to_degrees = ( radians ) => {
        return radians * this.piDeg
    }
    static degrees_to_radians = ( degrees ) => {
        return degrees * this.piRad
    }
    static binary_angle_to_degree = ( binary_angle ) => {
        //full circle is -32768 to 32767.
        return this.angle_range( ( 360 / 65535 ) * ( binary_angle + 32768 ), 0, 360, true, false )
    }
    static angle_to_screen_x = ( angle, screen_distance, demi_internal_width ) => {
        if( angle >= 0 ){
            return Math.round( screen_distance - Math.tan( this.degrees_to_radians( angle ) ) * demi_internal_width )
        }
        return Math.round( ( Math.tan( this.degrees_to_radians( angle ) ) * - 1 ) * demi_internal_width + screen_distance )
    }

}
