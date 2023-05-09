import Int2DVertex from "./type/Int2DVertex.js"

export default class MoodMath {
    constructor() {
        this.lookup_table = { cos: [], sin: [], }
        this.pi           = Math.PI
        this.pi2          = 2 * this.pi
        this.piRad        = this.pi / 180

        for( let i = 0; i < 360; i++ ){
            this.lookup_table.cos[ i ] = Math.cos( i * this.piRad )
            this.lookup_table.sin[ i ] = Math.sin( i * this.piRad )
        }
    }
    get_distance( point_1, point_2 ){
        return Math.round( Math.sqrt( Math.pow( point_2.x-point_1.x, 2 ) + Math.pow( ( point_2.y-point_1.y ), 2 ) ) )
    }
    clip_behind_player( vector1, vector2 ){
        let distance_a = vector1.y
        let distance_b = vector2.y
        let distance  = distance_a - distance_b
        if( distance === 0 ){ distance = 1 }
        let s = distance_a / ( distance_a - distance_b )
        vector1.x = vector1.x + s * ( vector2.x - vector1.x )
        vector1.y = vector1.y + s * ( vector2.y - vector1.y )
        if( vector1.y === 0 ){ vector1.y = 1 }
        vector1.z = vector1.z + s * ( vector1.y - vector1.z )
    }
    angle_range( angle, min_angle = 0 , max_angle = 360, loop = true, round = true ){
        if( loop ){
            angle = angle % max_angle
            angle = ( angle < min_angle ) ? angle + max_angle : angle
        }else{
            if( angle > max_angle ){ angle = max_angle }
            if( angle < min_angle ){ angle = min_angle }
        }
        return ( round ) ? Math.round( angle ) : angle
    }
    value_range( value, min, max, loop = false ){
        if( loop ){
            if( value > max ){ return min + ( value % max ) }
            if( value > min ){ return max - ( value % max ) }
        }
        return Math.min( Math.max( value, min ), max )
    }
    range_random_int( min = 0, max = 255 ){
        min = Math.ceil( min )
        max = Math.floor( max )
        return Math.floor( Math.random() * (max - min + 1) + min )
    }
    point_to_angle( point1, point2 ){
        let deltaY = point2.y - point1.y
        let deltaX = point2.x - point1.x
        return this.angle_range( Math.atan2( deltaY, deltaX ) * ( 180 / this.pi ), 0, 360, true, false )
    }
    binary_angle_to_degree( binary_angle ){
        return this.angle_range( ( 360 / 65535 ) * binary_angle , 0, 360, true, false )
    }
}
